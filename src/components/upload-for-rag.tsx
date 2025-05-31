"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUploadPipeline } from "@/hooks/rag/useDocumentUploadPipeline";
import { useApiToast } from "@/components/promise-sonner/promise-sonner";

type FileStatus = "idle" | "processing" | "success" | "error";

interface UploadFile {
  file: File;
  status: FileStatus;
  error?: string;
}

export const ExportForRAG = () => {
  const { handleFullUploadPipeline } = useUploadPipeline();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [processedCount, setProcessedCount] = useState(0);
  const [failedFiles, setFailedFiles] = useState<string[]>([]);
  const { isLoading } = useApiToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    const newFiles: UploadFile[] = Array.from(selectedFiles).map((file) => ({
      file,
      status: "idle",
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleSubmit = async () => {
    setProcessedCount(0);
    setFailedFiles([]);

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
        setFailedFiles((prev) => [...prev, updatedFiles[i].file.name]);
      }

      setProcessedCount((prev) => prev + 1);
      setFiles([...updatedFiles]);
    }
  };

  const resetAll = () => {
    setFiles([]);
    setProcessedCount(0);
    setFailedFiles([]);
  };

  return (
    <div className="mt-10 space-y-6">
      <div>
        <Label htmlFor="file" className="text-lg font-medium">
          Upload PDFs for processing
        </Label>
        <Input
          name="file"
          id="file"
          className="mt-2 text-sm"
          type="file"
          multiple
          onChange={handleFileSelect}
        />
      </div>

      {files.length > 0 && (
        <>
          <ul className="space-y-1 text-sm">
            {files.map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="font-medium">{f.file.name}</span>
                <span className="text-muted-foreground text-xs">
                  {f.status === "idle" && "Pending"}
                  {f.status === "processing" && "Processing..."}
                  {f.status === "success" && "Done"}
                  {f.status === "error" && `❌ Failed: ${f.error}`}
                </span>
              </li>
            ))}
          </ul>

          <Button
            className="mt-4"
            onClick={handleSubmit}
            disabled={files.length === 0}
          >
            Submit
          </Button>

          {processedCount > 0 && (
            <div className="mt-4 text-sm">
              <p>
                 {processedCount - failedFiles.length} succeeded / {" "}
                {failedFiles.length} failed
              </p>
              {failedFiles.length > 0 && (
                <ul className="mt-1 list-disc list-inside text-red-500">
                  {failedFiles.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              )}
              <Button
                variant="secondary"
                className="mt-2 text-xs"
                onClick={resetAll}
              >
                Reset
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
