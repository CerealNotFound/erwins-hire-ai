// utils/brevo/emailService.ts
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface OutreachEmailParams {
  candidate: {
    id: string;
    full_name: string;
    email: string;
    matching_skills?: string[];
  };
  campaign: {
    id: string;
    role: string;
    campaign_name: string;
    description: string;
    email_config?: {
      sender_email?: string;
      sender_name?: string;
    };
  };
  interviewLink: string;
  conversationId: string;
}

// Direct HTTP approach - cleaner, more reliable, no dependency issues
async function callBrevoAPI(endpoint: string, data: any): Promise<any> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    throw new Error("BREVO_API_KEY environment variable is required");
  }

  const response = await fetch(`https://api.brevo.com/v3${endpoint}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Brevo API error: ${response.status} - ${
        errorData.message || "Unknown error"
      }`
    );
  }

  return response.json();
}

export async function sendOutreachEmail({
  candidate,
  campaign,
  interviewLink,
  conversationId,
}: OutreachEmailParams): Promise<EmailResult> {
  try {
    // Extract first name for personalization
    const firstName = candidate.full_name.split(" ")[0];

    // Build skills section (take top 3 matching skills or fallback to first 3 skills)
    const skillsToHighlight = candidate.matching_skills?.slice(0, 3) || [];
    const skillsText =
      skillsToHighlight.length > 0
        ? skillsToHighlight.join(", ")
        : "your technical expertise";

    // Build email content
    const subject = `${campaign.role} @ ${campaign.campaign_name} - Let's build something amazing`;

    // HTML email template with beautiful design
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        * { box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #1a1a1a; 
            margin: 0; 
            padding: 0; 
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }
        
        .email-wrapper { 
            max-width: 680px; 
            margin: 40px auto; 
            background: #ffffff; 
            border-radius: 16px; 
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
        }
        
        .header {
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
            padding: 40px 40px 30px;
            text-align: center;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 50%, #3b82f6 100%);
        }
        
        .logo {
            font-size: 32px;
            font-weight: 800;
            color: #ffffff;
            margin-bottom: 8px;
            letter-spacing: -0.02em;
        }
        
        .tagline {
            color: #a1a1aa;
            font-size: 14px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .content {
            padding: 40px;
        }
        
        .greeting {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 24px;
            color: #000000;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .intro-text {
            font-size: 16px;
            margin-bottom: 24px;
            color: #374151;
            line-height: 1.7;
        }
        
        .skills-highlight {
            display: inline-block;
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            color: #1d4ed8;
            padding: 2px 8px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 15px;
        }
        
        .opportunity-card {
            background: #000000;
            color: #ffffff;
            padding: 32px;
            border-radius: 12px;
            margin: 32px 0;
            position: relative;
            overflow: hidden;
        }
        
        .opportunity-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
        }
        
        .role-title {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 16px;
            color: #3b82f6;
        }
        
        .role-description {
            font-size: 15px;
            line-height: 1.6;
            color: #d1d5db;
            margin-bottom: 0;
        }
        
        .cta-section {
            text-align: center;
            margin: 40px 0;
        }
        
        .cta-button {
            display: inline-block;
            color: #ffffff;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 700;
            font-size: 16px;
            letter-spacing: 0.02em;
            transition: all 0.3s ease;
            box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
            border: 2px solid #3b82f6;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
        }
        
        .interview-info {
            background: #f8fafc;
            padding: 24px;
            border-radius: 8px;
            margin: 24px 0;
            border-left: 4px solid #3b82f6;
        }
        
        .interview-info h4 {
            margin: 0 0 12px 0;
            color: #1f2937;
            font-size: 16px;
            font-weight: 600;
        }
        
        .interview-info p {
            margin: 0;
            color: #6b7280;
            font-size: 14px;
        }
        
        .footer {
            background: #f8fafc;
            padding: 32px 40px;
            border-top: 1px solid #e5e7eb;
        }
        
        .signature {
            margin-bottom: 24px;
        }
        
        .signature p {
            margin: 4px 0;
            color: #374151;
            font-size: 15px;
        }
        
        .signature .name {
            font-weight: 600;
            color: #000000;
        }
        
        .signature .title {
            color: #6b7280;
            font-size: 14px;
        }
        
        .disclaimer {
            font-size: 12px;
            color: #9ca3af;
            line-height: 1.5;
            border-top: 1px solid #e5e7eb;
            padding-top: 16px;
        }
        
        .wave {
            font-size: 24px;
            animation: wave 2s ease-in-out infinite;
        }
        
        @keyframes wave {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(20deg); }
            75% { transform: rotate(-10deg); }
        }
        
        @media (max-width: 600px) {
            .email-wrapper { 
                margin: 20px; 
                border-radius: 12px; 
            }
            .content { padding: 24px; }
            .header { padding: 24px; }
            .footer { padding: 24px; }
            .greeting { font-size: 20px; }
            .opportunity-card { padding: 24px; }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="header">
            <div class="logo">HireAI</div>
            <div class="tagline">AI-Powered Recruitment</div>
        </div>
        
        <div class="content">
            <div class="greeting">
                Hi ${firstName}! <span class="wave">👋</span>
            </div>
            
            <p class="intro-text">
                I discovered your profile and was genuinely impressed by your expertise in 
                <span class="skills-highlight">${skillsText}</span>. 
                Your background caught our attention, and I think you'd be perfect for something special we're building.
            </p>
            
            <div class="opportunity-card">
                <div class="role-title">${campaign.role}</div>
                <div class="role-description">
                    ${campaign.description}
                </div>
            </div>
            
            <p class="intro-text">
                Here's what makes this different: instead of lengthy back-and-forth emails, 
                we've created an AI-powered interview experience that respects your time. 
                Complete it whenever works for you, at your own pace.
            </p>
            
            <div class="cta-section">
                <a href="${interviewLink}" class="cta-button">
                    Start Your Interview Journey
                </a>
            </div>
            
            <div class="interview-info">
                <h4>What to Expect</h4>
                <p>
                    • 15-20 minutes of your time<br>
                    • Technical questions tailored to your background<br>
                    • Cultural fit assessment<br>
                    • Quick feedback from our side
                </p>
            </div>
        </div>
        
        <div class="footer">
            <div class="signature">
                <p class="name">The ${campaign.campaign_name} Team</p>
                <p class="title">Building the future of recruitment</p>
            </div>
            
            <div class="disclaimer">
                This email was sent regarding the ${campaign.role} position. 
                Not interested? No worries – you can safely ignore this message. 
                We respect your time and won't spam your inbox.
            </div>
        </div>
    </div>
</body>
</html>`;

    // Enhanced plain text version
    const textContent = `Hi ${firstName}!

I discovered your profile and was genuinely impressed by your expertise in ${skillsText}. Your background caught our attention, and I think you'd be perfect for something special we're building.

🚀 ${campaign.role} Opportunity

${campaign.description}

Here's what makes this different: instead of lengthy back-and-forth emails, we've created an AI-powered interview experience that respects your time. Complete it whenever works for you, at your own pace.

👉 Start Your Interview: ${interviewLink}

What to Expect:
• 15-20 minutes of your time
• Technical questions tailored to your background  
• Cultural fit assessment
• Immediate feedback and next steps

Best regards,
The ${campaign.campaign_name} Team
Building the future of recruitment

---
This email was sent regarding the ${campaign.role} position. Not interested? No worries – you can safely ignore this message. We respect your time and won't spam your inbox.`;

    // Configure sender
    const senderEmail =
      campaign.email_config?.sender_email ||
      process.env.BREVO_SENDER_EMAIL ||
      "team@hireai.com";
    const senderName =
      campaign.email_config?.sender_name ||
      process.env.BREVO_SENDER_NAME ||
      "HireAI Team";

    // Build Brevo API payload
    const emailPayload = {
      sender: {
        email: senderEmail,
        name: senderName,
      },
      to: [
        {
          email: candidate.email,
          name: candidate.full_name,
        },
      ],
      subject: subject,
      htmlContent: htmlContent,
      textContent: textContent,
      // Enhanced tracking tags
      tags: [
        "hireai-outreach",
        `campaign-${campaign.id}`,
        `role-${campaign.role.toLowerCase().replace(/\s+/g, "-")}`,
        "ai-interview",
      ],
      // Custom headers for tracking
      headers: {
        "X-Campaign-ID": campaign.id,
        "X-Candidate-ID": candidate.id,
        "X-Conversation-ID": conversationId,
        "X-Email-Type": "outreach",
      },
    };

    console.log(
      `🚀 Sending beautifully crafted email to ${candidate.email} for ${campaign.role} position`
    );

    const response = await callBrevoAPI("/smtp/email", emailPayload);

    console.log(
      `✨ Email sent successfully to ${candidate.full_name}:`,
      response.messageId
    );

    return {
      success: true,
      messageId: response.messageId,
    };
  } catch (error: any) {
    console.error(`❌ Failed to send email to ${candidate.full_name}:`, error);

    return {
      success: false,
      error: error.message || "Failed to send email",
    };
  }
}

// Batch email sending for high-volume campaigns
export async function sendBulkOutreachEmails(
  emails: OutreachEmailParams[]
): Promise<EmailResult[]> {
  const results: EmailResult[] = [];

  // Brevo has rate limits, so we process in small batches
  const batchSize = 10; // Adjust based on your Brevo plan limits

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);

    console.log(
      `📧 Processing email batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        emails.length / batchSize
      )}`
    );

    const batchPromises = batch.map((emailParams) =>
      sendOutreachEmail(emailParams).catch((error) => ({
        success: false,
        error: error.message || "Batch processing failed",
      }))
    );

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Brief pause between batches to respect rate limits
    if (i + batchSize < emails.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

// Template validation helper
export function validateEmailTemplate(campaign: any): string[] {
  const errors: string[] = [];

  if (!campaign.campaign_name) {
    errors.push("Campaign name is required for email subject");
  }

  if (!campaign.description) {
    errors.push("Campaign description is required for email content");
  }

  if (!campaign.role) {
    errors.push("Role is required for email content");
  }

  return errors;
}
