// utils/brevo/selectionEmailService.ts
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface SelectionEmailParams {
  candidate: {
    id: string;
    full_name: string;
    email: string;
  };
  campaign: {
    id: string;
    role: string;
    campaign_name: string;
    email_config?: {
      sender_email?: string;
      sender_name?: string;
    };
  };
  email_config: {
    sender_email: string;
    sender_name: string;
  };
}

// Direct HTTP approach - matching your existing pattern
async function callBrevoAPI(endpoint: string, data: any): Promise<any> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    throw new Error("BREVO_API_KEY environment variable is required");
  }

  console.log(data);

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

export async function sendSelectionEmail({
  candidate,
  campaign,
  email_config,
}: SelectionEmailParams): Promise<EmailResult> {
  try {
    // Extract first name for personalization
    const firstName = candidate.full_name.split(" ")[0];

    // Build email content
    const subject = `🎉 Great news! You've been selected for the next round - ${campaign.role}`;

    // HTML email template with celebration design
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
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
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
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
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
            background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%);
        }
        
        .celebration-icon {
            font-size: 48px;
            margin-bottom: 16px;
            animation: bounce 2s ease-in-out infinite;
        }
        
        .logo {
            font-size: 32px;
            font-weight: 800;
            color: #ffffff;
            margin-bottom: 8px;
            letter-spacing: -0.02em;
        }
        
        .tagline {
            color: #d1fae5;
            font-size: 14px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .content {
            padding: 40px;
        }
        
        .congratulations-banner {
            background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
            border: 2px solid #fbbf24;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            margin-bottom: 32px;
            position: relative;
            overflow: hidden;
        }
        
        .congratulations-banner::before {
            content: '🎊';
            position: absolute;
            top: -10px;
            left: -10px;
            font-size: 24px;
            animation: float 3s ease-in-out infinite;
        }
        
        .congratulations-banner::after {
            content: '🎊';
            position: absolute;
            top: -10px;
            right: -10px;
            font-size: 24px;
            animation: float 3s ease-in-out infinite reverse;
        }
        
        .congratulations-title {
            font-size: 24px;
            font-weight: 800;
            color: #dc2626;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .congratulations-subtitle {
            font-size: 16px;
            color: #92400e;
            font-weight: 600;
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
        
        .success-highlight {
            display: inline-block;
            background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
            color: #166534;
            padding: 2px 8px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 15px;
        }
        
        .next-steps-card {
            background: #000000;
            color: #ffffff;
            padding: 32px;
            border-radius: 12px;
            margin: 32px 0;
            position: relative;
            overflow: hidden;
        }
        
        .next-steps-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        }
        
        .next-steps-title {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 16px;
            color: #10b981;
        }
        
        .next-steps-list {
            font-size: 15px;
            line-height: 1.8;
            color: #d1d5db;
            margin: 0;
            padding-left: 0;
            list-style: none;
        }
        
        .next-steps-list li {
            margin-bottom: 8px;
            padding-left: 24px;
            position: relative;
        }
        
        .next-steps-list li::before {
            content: '✅';
            position: absolute;
            left: 0;
            top: 0;
            font-size: 14px;
        }
        
        .timeline-card {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border: 1px solid #3b82f6;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
            text-align: center;
        }
        
        .timeline-title {
            font-size: 18px;
            font-weight: 700;
            color: #1d4ed8;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .timeline-text {
            font-size: 16px;
            color: #1e40af;
            font-weight: 600;
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
        
        .party-emoji {
            font-size: 24px;
            animation: spin 2s linear infinite;
        }
        
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(180deg); }
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
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
            .next-steps-card { padding: 24px; }
            .congratulations-banner { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="header">
            <div class="celebration-icon">🎉</div>
            <div class="logo">HireAI</div>
            <div class="tagline">Celebrating Your Success</div>
        </div>
        
        <div class="content">
            <div class="congratulations-banner">
                <div class="congratulations-title">Congratulations!</div>
                <div class="congratulations-subtitle">You've been selected for the next round</div>
            </div>
            
            <div class="greeting">
                Hi ${firstName}! <span class="party-emoji">🎊</span>
            </div>
            
            <p class="intro-text">
                Fantastic news! After reviewing your <span class="success-highlight">outstanding performance</span> 
                in our initial assessment, we're thrilled to invite you to the next stage of our 
                recruitment process for the <strong>${campaign.role}</strong> position.
            </p>
            
            <p class="intro-text">
                Your responses demonstrated exactly the kind of talent and thinking we're looking for. 
                We're genuinely excited about the possibility of you joining our team!
            </p>
            
            <div class="next-steps-card">
                <div class="next-steps-title">What happens next?</div>
                <ul class="next-steps-list">
                    <li>Our recruitment team will contact you shortly</li>
                    <li>We'll schedule your next interview round</li>
                    <li>This will be a deeper dive into your technical expertise and culture fit</li>
                    <li>You'll get to meet potential teammates and ask any questions</li>
                    <li>We'll provide quick feedback and next steps</li>
                </ul>
            </div>
            
            <div class="timeline-card">
                <div class="timeline-title">
                    <span>⏰</span> Next Steps
                </div>
                <div class="timeline-text">
                    You'll hear from our team very soon!
                </div>
            </div>
            
            <p class="intro-text">
                In the meantime, feel free to research our company culture, check out our recent projects, 
                or prepare any questions you'd like to ask during the interview. We want this to be 
                as much about you evaluating us as it is about us getting to know you better.
            </p>
            
            <p class="intro-text">
                <strong>Pro tip:</strong> Come prepared with examples of your best work and questions 
                about our technical challenges. We love candidates who are curious and engaged!
            </p>
        </div>
        
        <div class="footer">
            <div class="signature">
                <p class="name">The ${campaign.campaign_name} Team</p>
                <p class="title">Excited to continue this journey with you</p>
            </div>
            
            <div class="disclaimer">
                Congratulations on advancing to the next round for the ${campaign.role} position! 
                We're looking forward to our upcoming conversation. If you have any questions 
                before we connect, feel free to reach out.
            </div>
        </div>
    </div>
</body>
</html>`;

    // Enhanced plain text version
    const textContent = `🎉 CONGRATULATIONS, ${firstName}!

You've been selected for the next round!

Fantastic news! After reviewing your outstanding performance in our initial assessment, we're thrilled to invite you to the next stage of our recruitment process for the ${campaign.role} position.

Your responses demonstrated exactly the kind of talent and thinking we're looking for. We're genuinely excited about the possibility of you joining our team!

🚀 What happens next?

✅ Our recruitment team will contact you shortly
✅ We'll schedule your next interview round
✅ This will be a deeper dive into your technical expertise and culture fit
✅ You'll get to meet potential teammates and ask any questions
✅ We'll provide quick feedback and next steps

⏰ Next Steps: You'll hear from our team very soon!

In the meantime, feel free to research our company culture, check out our recent projects, or prepare any questions you'd like to ask during the interview. We want this to be as much about you evaluating us as it is about us getting to know you better.

Pro tip: Come prepared with examples of your best work and questions about our technical challenges. We love candidates who are curious and engaged!

Best regards,
The ${campaign.campaign_name} Team
Excited to continue this journey with you

---
Congratulations on advancing to the next round for the ${campaign.role} position! We're looking forward to our upcoming conversation. If you have any questions before we connect, feel free to reach out.`;

    // Configure sender
    const senderEmail = email_config.sender_email;
    const senderName = email_config.sender_name;

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
        "hireai-selection",
        `campaign-${campaign.id}`,
        `role-${campaign.role.toLowerCase().replace(/\s+/g, "-")}`,
        "next-round",
        "congratulations",
      ],
      // Custom headers for tracking
      headers: {
        "X-Campaign-ID": campaign.id,
        "X-Candidate-ID": candidate.id,
        "X-Email-Type": "selection",
      },
    };

    console.log(
      `🎉 Sending congratulations email to ${candidate.email} for ${campaign.role} next round`
    );

    const response = await callBrevoAPI("/smtp/email", emailPayload);

    console.log(
      `✨ Selection email sent successfully to ${candidate.full_name}:`,
      response.messageId
    );

    return {
      success: true,
      messageId: response.messageId,
    };
  } catch (error: any) {
    console.error(
      `❌ Failed to send selection email to ${candidate.full_name}:`,
      error
    );

    return {
      success: false,
      error: error.message || "Failed to send selection email",
    };
  }
}

// Batch selection email sending
export async function sendBulkSelectionEmails(
  emails: SelectionEmailParams[]
): Promise<EmailResult[]> {
  const results: EmailResult[] = [];

  // Process in small batches to respect rate limits
  const batchSize = 10;

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);

    console.log(
      `🎊 Processing selection email batch ${
        Math.floor(i / batchSize) + 1
      }/${Math.ceil(emails.length / batchSize)}`
    );

    const batchPromises = batch.map((emailParams) =>
      sendSelectionEmail(emailParams).catch((error) => ({
        success: false,
        error: error.message || "Batch processing failed",
      }))
    );

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Brief pause between batches
    if (i + batchSize < emails.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

// Template validation helper
export function validateSelectionEmailTemplate(campaign: any): string[] {
  const errors: string[] = [];

  if (!campaign.campaign_name) {
    errors.push("Campaign name is required for email content");
  }

  if (!campaign.role) {
    errors.push("Role is required for email content");
  }

  return errors;
}

// Usage example:
/*
const selectionResult = await sendSelectionEmail({
  candidate: {
    id: "candidate-123",
    full_name: "John Doe",
    email: "john@example.com"
  },
  campaign: {
    id: "campaign-456",
    role: "Full Stack Developer",
    campaign_name: "Tech Team Q1 2025"
  },
  conversationId: "conv-789"
});
*/
