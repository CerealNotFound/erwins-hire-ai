// CLEAN SINGLE-RESPONSIBILITY PIPELINE
import { useApiToast } from "@/components/promise-sonner/promise-sonner";
import { CandidateProfile } from "@/engine/resumeExtractors/geminiExtractor";
import axios from "axios";

interface BatchJob {
  id: string;
  file: File;
  profile?: CandidateProfile;
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
}

interface BatchConfig {
  maxConcurrentProcessing: number;
  batchSize: number;
}

export const useBatchUploadResumePipeline = () => {
  const { callApi } = useApiToast();

  const config: BatchConfig = {
    maxConcurrentProcessing: 12, // Adjust based on your API limits
    batchSize: 12,
  };

  // Step 1: Process files and extract profiles (ALL IN ONE SHOT)
  const processResumesBatch = async (
    files: File[],
    onProgress?: (completed: number, total: number, stage: string) => void
  ): Promise<BatchJob[]> => {
    const jobs: BatchJob[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: "pending",
    }));

    const semaphore = new Semaphore(config.maxConcurrentProcessing);
    let completed = 0;

    const processPromises = jobs.map(async (job) => {
      return semaphore.acquire(async () => {
        try {
          const formData = new FormData();
          formData.append("file", job.file);

          const response = await axios
            .post("/api/rag/processFile", formData)
            .then((processedFile) => processedFile.data);

          // Your endpoint returns candidate-profile directly!
          if (response.type === "candidate-profile") {
            job.profile = response.data;
            job.status = "processing";
          } else {
            throw new Error(
              "Expected candidate-profile but got something else"
            );
          }

          completed++;
          onProgress?.(completed, files.length, "Processing resumes");
        } catch (error: any) {
          job.error = error.message;
          job.status = "failed";
          completed++;
          onProgress?.(completed, files.length, "Processing resumes");
        }
      });
    });

    await Promise.all(processPromises);
    return jobs.filter((job) => job.profile && job.status === "processing");
  };

  // Step 2: Batch upload (profiles already have embeddings!)
  const batchUpload = async (
    jobs: BatchJob[],
    onProgress?: (completed: number, total: number, stage: string) => void
  ): Promise<BatchJob[]> => {
    // Filter valid jobs first
    const validJobs = jobs.filter(
      (job) => job.profile?.about && job.profile?.embedding
    );

    if (validJobs.length === 0) {
      console.log("No valid profiles with embeddings for upload");
      return [];
    }

    try {
      onProgress?.(0, validJobs.length, "Uploading to database");

      // STUPID SIMPLE - just upload the profiles (they already have embeddings!)
      await callApi({
        url: "/api/rag/uploadCandidateProfile",
        method: "POST",
        data: { candidates: validJobs.map((job) => job.profile!) },
        loadingMessage: `Uploading ${validJobs.length} candidates...`,
        successMessage: () =>
          `Successfully uploaded ${validJobs.length} candidates`,
        errorMessage: (err) => `Upload failed: ${err.message}`,
      });

      // Mark all as completed
      validJobs.forEach((job) => {
        job.status = "completed";
      });

      onProgress?.(validJobs.length, validJobs.length, "Upload complete");
    } catch (error: any) {
      validJobs.forEach((job) => {
        job.error = error.message;
        job.status = "failed";
      });
    }

    return validJobs;
  };

  // Main pipeline - BRUTALLY SIMPLE
  const handleBatchUploadPipeline = async (
    files: File[],
    onProgress?: (completed: number, total: number, stage: string) => void
  ) => {
    const total = files.length;
    console.log(`🚀 Starting streamlined processing of ${total} resumes...`);

    // Step 1: Process files → Get profiles
    const processedJobs = await processResumesBatch(files, onProgress);

    // Step 2: Upload profiles (they already have embeddings!)
    const finalJobs = await batchUpload(processedJobs, onProgress);

    const successful = finalJobs.filter((job) => job.status === "completed");
    const failed = finalJobs.filter((job) => job.status === "failed");

    console.log(
      `🎉 Pipeline complete: ${successful.length} successful, ${failed.length} failed`
    );

    return {
      successful: successful.length,
      failed: failed.length,
      errors: failed.map((job) => ({ file: job.file.name, error: job.error })),
    };
  };

  return {
    handleBatchUploadPipeline,
    handleSingleUpload: (file: File) => handleBatchUploadPipeline([file]),
  };
};

// Simple semaphore for concurrency control
class Semaphore {
  private permits: number;
  private queue: (() => void)[] = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (this.permits > 0) {
        this.permits--;
        this.executeTask(task, resolve, reject);
      } else {
        this.queue.push(() => {
          this.permits--;
          this.executeTask(task, resolve, reject);
        });
      }
    });
  }

  private async executeTask<T>(
    task: () => Promise<T>,
    resolve: (value: T) => void,
    reject: (reason: any) => void
  ) {
    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.permits++;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        next?.();
      }
    }
  }
}
