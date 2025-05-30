import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Image - positioned at bottom */}
      <div
        className="absolute bottom-0 left-0 w-full h-[60vh] z-0"
        style={{
          backgroundImage: "url(/illustration.png)",
          backgroundSize: "100% 100%",
          backgroundPosition: "bottom center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Content Layer - positioned above image */}
      <div className="relative z-10 flex w-full h-full flex-col justify-center items-center gap-10 px-8">
        <div className="text-6xl font-medium font-poppins w-full max-w-2xl text-center">
          Introducing Erwin's
          <div className="font-extrabold mt-10">HireAI</div>
        </div>

        <div className="text-lg text-gray-400 font-poppins w-full max-w-lg text-center">
          The AI search engine that understands who you're looking for. Discover
          and unlock talent density at scale.
        </div>

        {/* The animated gradient border button */}
        <Button
          variant={"ghost"}
          className="relative h-12 px-8 py-4 text-lg font-poppins font-medium text-white rounded-xl overflow-hidden group
                         [background:linear-gradient(45deg,theme(colors.black)_50%,theme(colors.gray.900)_100%)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.gray.600/.3)_0%,theme(colors.blue.500)_15%,theme(colors.purple.500)_30%,theme(colors.pink.500)_45%,theme(colors.blue.500)_60%,theme(colors.gray.600/.3)_80%)_border-box] 
                         border-2 border-transparent animate-border-spin
                         hover:scale-105 transition-transform duration-300"
        >
          <span className="">Get Started</span>
          {/* Hover glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
        </Button>
      </div>
    </div>
  );
}
