import { ExportForRAG } from "@/components/upload-for-rag";

const Upload = () => {
  return (
    <div>
      <div className="w-full flex flex-col justify-center items-center gap-4 mt-28 text-center">
        <h1 className="font-bold text-4xl">
          Turn Resume Chaos Into Hiring Gold
        </h1>
        <p className="text-xl w-1/2 mt-8">
          Our AI reads between the lines of every resume, spots patterns you'd
          miss, and serves up your top candidates on a silver platter. Because
          life's too short for bad hires.
        </p>
        <ExportForRAG />
      </div>
    </div>
  );
};

export default Upload;
