"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUploadPipeline } from "@/hooks/rag/useDocumentUploadPipeline";
import { useBatchUploadResumePipeline } from "@/hooks/rag/useBatchUploadResumePipeline";
import { useApiToast } from "@/components/promise-sonner/promise-sonner";

type FileStatus = "idle" | "processing" | "success" | "error";
type ProcessingStage =
  | "files"
  | "extraction"
  | "embedding"
  | "upload"
  | "complete";

interface UploadFile {
  file: File;
  status: FileStatus;
  error?: string;
}

interface BatchProgress {
  stage: ProcessingStage;
  completed: number;
  total: number;
  isProcessing: boolean;
}

export const ExportForRAG = () => {
  const { handleFullUploadPipeline } = useUploadPipeline();
  const { handleBatchUploadPipeline } = useBatchUploadResumePipeline();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [batchProgress, setBatchProgress] = useState<BatchProgress>({
    stage: "files",
    completed: 0,
    total: 0,
    isProcessing: false,
  });
  const [results, setResults] = useState<{
    successful: number;
    failed: number;
    errors: Array<{ file: string; error: string }>;
  } | null>(null);
  const { isLoading } = useApiToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    const newFiles: UploadFile[] = Array.from(selectedFiles).map((file) => ({
      file,
      status: "idle",
    }));

    setFiles((prev) => [...prev, ...newFiles]);
    setResults(null); // Clear previous results
  };

  const handleBatchSubmit = async () => {
    if (files.length === 0) return;

    setBatchProgress({
      stage: "files",
      completed: 0,
      total: files.length,
      isProcessing: true,
    });
    setResults(null);

    // Mark all files as processing
    const updatedFiles = files.map((f) => ({
      ...f,
      status: "processing" as FileStatus,
    }));
    setFiles(updatedFiles);

    try {
      const fileList = files.map((f) => f.file);

      // Use the high-performance batch pipeline
      const batchResults = await handleBatchUploadPipeline(
        fileList,
        (completed: number, total: number, stage: string) => {
          // Map stage names to our enum
          let currentStage: ProcessingStage = "files";
          if (stage.includes("extract")) currentStage = "extraction";
          else if (stage.includes("embed")) currentStage = "embedding";
          else if (stage.includes("upload") || stage.includes("database"))
            currentStage = "upload";

          setBatchProgress({
            stage: currentStage,
            completed,
            total,
            isProcessing: true,
          });
        }
      );

      // Update file statuses based on results
      const finalFiles = files.map((f, index) => {
        const hasError = batchResults.errors.some(
          (err) => err.file === f.file.name
        );
        return {
          ...f,
          status: hasError
            ? ("error" as FileStatus)
            : ("success" as FileStatus),
          error: hasError
            ? batchResults.errors.find((err) => err.file === f.file.name)?.error
            : undefined,
        };
      });

      setFiles(finalFiles);
      setResults({
        ...batchResults,
        errors: batchResults.errors.map((err) => ({
          file: err.file,
          error: err.error || "Unknown error",
        })),
      });
      setBatchProgress({
        stage: "complete",
        completed: batchResults.successful,
        total: files.length,
        isProcessing: false,
      });
    } catch (error) {
      console.error("Batch processing failed:", error);

      // Mark all files as failed
      const failedFiles = files.map((f) => ({
        ...f,
        status: "error" as FileStatus,
        error: (error as Error).message || "Batch processing failed",
      }));

      setFiles(failedFiles);
      setBatchProgress({
        stage: "complete",
        completed: 0,
        total: files.length,
        isProcessing: false,
      });
    }
  };

  const handleSingleSubmit = async () => {
    if (files.length === 0) return;

    const updatedFiles = [...files];

    for (let i = 0; i < updatedFiles.length; i++) {
      updatedFiles[i].status = "processing";
      setFiles([...updatedFiles]);

      try {
        await handleFullUploadPipeline(updatedFiles[i].file);
        updatedFiles[i].status = "success";
      } catch (err) {
        updatedFiles[i].status = "error";
        updatedFiles[i].error = (err as Error).message || "Unknown error";
      }

      setFiles([...updatedFiles]);
    }
  };

  const resetAll = () => {
    setFiles([]);
    setResults(null);
    setBatchProgress({
      stage: "files",
      completed: 0,
      total: 0,
      isProcessing: false,
    });
  };

  const getStageLabel = (stage: ProcessingStage): string => {
    switch (stage) {
      case "files":
        return "Processing files...";
      case "extraction":
        return "Extracting profiles with AI...";
      case "embedding":
        return "Generating embeddings...";
      case "upload":
        return "Uploading to database...";
      case "complete":
        return "Complete!";
      default:
        return "Processing...";
    }
  };

  const getProgressPercentage = (): number => {
    if (!batchProgress.isProcessing && batchProgress.stage === "complete")
      return 100;
    if (batchProgress.total === 0) return 0;
    return Math.round((batchProgress.completed / batchProgress.total) * 100);
  };

  const canSubmit =
    files.length > 0 && !batchProgress.isProcessing && !isLoading;

  return (
    <div className="mt-10 space-y-6">
      <div>
        <Label htmlFor="file" className="text-lg font-medium">
          Feed the AI beast (.pdf/.docx)
        </Label>
        <Input
          name="file"
          id="file"
          className="mt-2 text-sm"
          type="file"
          multiple
          onChange={handleFileSelect}
          disabled={batchProgress.isProcessing}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Pro tip: Upload multiple files for lightning-fast batch processing
        </p>
      </div>

      {files.length > 0 && (
        <>
          {/* Batch Progress Bar */}
          {batchProgress.isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{getStageLabel(batchProgress.stage)}</span>
                <span>
                  {batchProgress.completed}/{batchProgress.total}
                </span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>
          )}

          {/* File List */}
          <div className="max-h-60 overflow-y-auto">
            <ul className="space-y-1 text-sm">
              {files.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="font-medium truncate max-w-xs">
                    {f.file.name}
                  </span>
                  <span className="text-muted-foreground text-xs shrink-0">
                    {f.status === "idle" && "⏳ Pending"}
                    {f.status === "processing" && "🔄 Processing..."}
                    {f.status === "success" && "✅ Done"}
                    {f.status === "error" && `❌ Failed: ${f.error}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleBatchSubmit}
              disabled={!canSubmit}
              className="flex-1 min-w-0"
            >
              🚀 Submit ({files.length} files)
            </Button>
          </div>

          {/* Results Summary */}
          {results && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Processing Complete!</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-green-600">
                  ✅ Successful: {results.successful}
                </div>
                <div className="text-red-600">
                  ❌ Failed: {files.length - results.successful}
                </div>
              </div>

              {results.errors.length > 0 && (
                <div className="mt-3">
                  <details className="cursor-pointer">
                    <summary className="text-sm font-medium text-red-600">
                      View {results.errors.length} error(s)
                    </summary>
                    <ul className="mt-2 text-xs space-y-1 text-red-500">
                      {results.errors.map((error, i) => (
                        <li key={i} className="truncate">
                          <span className="font-medium">{error.file}:</span>{" "}
                          {error.error}
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              )}

              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={resetAll}
              >
                🔄 Reset & Upload More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
