import { ExportForRAG } from "@/components/upload-for-rag";

const Upload = () => {
  return (
    <div>
      <div className="w-full flex flex-col justify-center items-center gap-4 mt-28 text-center">
        <h1 className="font-bold text-6xl">Chat with your documents.</h1>
        <p className="text-xl w-1/2 mt-8">
          Dive into PDFs like never before with. Let AI summarize long
          documents, explain complex concepts, and find key information in
          seconds.
        </p>
        <ExportForRAG />
      </div>
    </div>
  );
};

export default Upload;
