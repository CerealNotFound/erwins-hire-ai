import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useOutreachCampaigns } from "@/hooks/useOutreachCampaigns";

interface ShortlistedCandidate {
  id: string;
  full_name: string;
  email?: string;
  linkedin_url?: string;
  title: string;
  matching_skills: string[];
}

interface OutreachDialogProps {
  candidate: ShortlistedCandidate;
  isOpen: boolean;
  onClose: () => void;
}

export const OutreachDialog: React.FC<OutreachDialogProps> = ({
  candidate,
  isOpen,
  onClose,
}) => {
  const { campaigns, loading } = useOutreachCampaigns();
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");

  const handleSendOutreach = () => {
    if (!selectedCampaign) return;

    const campaign = campaigns.find((c) => c.id === selectedCampaign);
    if (!campaign) return;

    const interviewLink = `${window.location.origin}/interview?candidateId=${candidate.id}&campaignId=${campaign.id}`;

    const subject = `${campaign.role} Opportunity - ${campaign.campaign_name}`;
    const body = `Hi ${candidate.full_name.split(" ")[0]},

      I came across your profile and was impressed by your experience in ${candidate.matching_skills
        .slice(0, 3)
        .join(", ")}. 

      I have an exciting ${campaign.role} opportunity that might interest you:

      ${campaign.description}

      Would you be open to a brief conversation? Please use this link to schedule an interview at your convenience:

      ${interviewLink}

      Best regards`;

    if (candidate.email) {
      window.open(
        `https://mail.google.com/mail/?view=cm&to=${
          candidate.email
        }&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      );
    } else if (candidate.linkedin_url) {
      window.open(candidate.linkedin_url, "_blank");
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Campaign</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
            <SelectTrigger>
              <SelectValue placeholder="Choose campaign..." />
            </SelectTrigger>
            <SelectContent>
              {campaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.campaign_name} - {campaign.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSendOutreach}
              disabled={!selectedCampaign}
              className="flex-1"
            >
              <Mail className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
