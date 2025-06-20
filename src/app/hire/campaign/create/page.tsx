"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import OutreachForm from "@/components/outreach-form";

export default function CreateCampaignPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/hire/campaign");
  };

  return (
    <div className="min-h-screen pt-10 pb-8">
      <div className="container mx-auto px-6 space-y-8">
        {/* Header with Back Navigation */}
        <div className="flex flex-col items-start gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-neutral-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Button>
          {/* <div className="h-4 w-px bg-neutral-600"></div> */}
          <div>
            <h1 className="text-3xl font-bold text-white">
              Create New Campaign
            </h1>
            <p className="text-neutral-400 mt-1">
              Design your personalized AI-powered candidate outreach
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-4xl mx-auto">
          <div className="p-4">
            <OutreachForm />
          </div>
        </div>
      </div>
    </div>
  );
}
