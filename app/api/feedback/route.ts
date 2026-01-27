import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Resend } from "resend";

// Rate limiting map (in-memory, resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // Max requests per window
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "unknown";
  return ip;
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Sanitize input to prevent injection
function sanitize(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitKey = getRateLimitKey(request);
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    // Parse request body
    const body = await request.json();
    const { type, title, description, email, priority, userAgent, timestamp } =
      body;

    // Validate required fields
    if (!type || !title || !description) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: type, title, and description are required",
        },
        { status: 400 },
      );
    }

    // Validate feedback type
    const validTypes = ["bug", "feature", "general"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid feedback type" },
        { status: 400 },
      );
    }

    // Validate lengths
    if (title.length > 100) {
      return NextResponse.json(
        { error: "Title must be 100 characters or less" },
        { status: 400 },
      );
    }

    if (description.length > 1000) {
      return NextResponse.json(
        { error: "Description must be 1000 characters or less" },
        { status: 400 },
      );
    }

    // Validate email if provided
    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Check which email service to use
    const resendApiKey = process.env.RESEND_API_KEY;
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    const feedbackRecipient =
      process.env.FEEDBACK_RECIPIENT_EMAIL || gmailUser || "";

    const useResend = !!resendApiKey;
    const useGmail = !useResend && !!gmailUser && !!gmailAppPassword;

    if (!useResend && !useGmail) {
      console.error(
        "No email service configured. Set RESEND_API_KEY or GMAIL_USER + GMAIL_APP_PASSWORD",
      );
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 },
      );
    }

    // Sanitize inputs
    const sanitizedTitle = sanitize(title);
    const sanitizedDescription = sanitize(description);
    const sanitizedEmail = email ? sanitize(email) : "Not provided";

    // Build email subject
    const typeEmoji = type === "bug" ? "🐛" : type === "feature" ? "💡" : "💬";
    const typeLabel =
      type === "bug"
        ? "Bug Report"
        : type === "feature"
          ? "Feature Request"
          : "General Feedback";
    const subject = `${typeEmoji} [Qorvex ${typeLabel}] ${sanitizedTitle}`;

    // Build priority badge for bugs
    const priorityBadge =
      type === "bug" && priority
        ? `<span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background-color: ${
            priority === "critical"
              ? "#ef4444"
              : priority === "high"
                ? "#f97316"
                : priority === "medium"
                  ? "#eab308"
                  : "#22c55e"
          }; color: white; margin-left: 8px;">${priority.toUpperCase()}</span>`
        : "";

    // Build HTML email
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f0f23;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">
        ${typeEmoji} New ${typeLabel}
      </h1>
      <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">
        Qorvex Productivity Flow
      </p>
    </div>

    <!-- Content -->
    <div style="background-color: #1a1a2e; border-radius: 0 0 16px 16px; padding: 32px;">
      <!-- Title -->
      <div style="margin-bottom: 24px;">
        <h2 style="margin: 0 0 8px; color: white; font-size: 20px; font-weight: 600;">
          ${sanitizedTitle}
          ${priorityBadge}
        </h2>
      </div>

      <!-- Description -->
      <div style="margin-bottom: 24px; padding: 20px; background-color: rgba(255,255,255,0.05); border-radius: 12px; border-left: 4px solid #6366f1;">
        <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 15px; line-height: 1.6; white-space: pre-wrap;">
${sanitizedDescription}
        </p>
      </div>

      <!-- Meta Info -->
      <div style="padding: 20px; background-color: rgba(255,255,255,0.03); border-radius: 12px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: rgba(255,255,255,0.5); font-size: 13px; width: 120px;">Type</td>
            <td style="padding: 8px 0; color: white; font-size: 13px;">${typeLabel}</td>
          </tr>
          ${
            type === "bug" && priority
              ? `
          <tr>
            <td style="padding: 8px 0; color: rgba(255,255,255,0.5); font-size: 13px;">Priority</td>
            <td style="padding: 8px 0; color: ${
              priority === "critical"
                ? "#ef4444"
                : priority === "high"
                  ? "#f97316"
                  : priority === "medium"
                    ? "#eab308"
                    : "#22c55e"
            }; font-size: 13px; font-weight: 600;">${priority.charAt(0).toUpperCase() + priority.slice(1)}</td>
          </tr>
          `
              : ""
          }
          <tr>
            <td style="padding: 8px 0; color: rgba(255,255,255,0.5); font-size: 13px;">User Email</td>
            <td style="padding: 8px 0; color: white; font-size: 13px;">
              ${email ? `<a href="mailto:${sanitizedEmail}" style="color: #818cf8;">${sanitizedEmail}</a>` : "Not provided"}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: rgba(255,255,255,0.5); font-size: 13px;">Submitted</td>
            <td style="padding: 8px 0; color: white; font-size: 13px;">${new Date(timestamp || Date.now()).toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: rgba(255,255,255,0.5); font-size: 13px; vertical-align: top;">User Agent</td>
            <td style="padding: 8px 0; color: rgba(255,255,255,0.6); font-size: 11px; word-break: break-all;">${userAgent || "Not available"}</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 24px; color: rgba(255,255,255,0.4); font-size: 12px;">
      <p style="margin: 0;">
        This feedback was submitted through <strong style="color: rgba(255,255,255,0.6);">Qorvex</strong>
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // Plain text fallback
    const textContent = `
${typeLabel.toUpperCase()}
${"=".repeat(50)}

Title: ${sanitizedTitle}
${type === "bug" && priority ? `Priority: ${priority.toUpperCase()}` : ""}

Description:
${sanitizedDescription}

---
User Email: ${sanitizedEmail}
Submitted: ${new Date(timestamp || Date.now()).toLocaleString()}
User Agent: ${userAgent || "Not available"}

---
This feedback was submitted through Qorvex Productivity Flow
    `;

    // Send email using the configured service
    if (useResend) {
      // Use Resend
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: "Qorvex Feedback <onboarding@resend.dev>",
        to: feedbackRecipient,
        replyTo: email || undefined,
        subject: subject,
        text: textContent,
        html: htmlContent,
      });
      console.log("Email sent via Resend");
    } else {
      // Use Gmail SMTP
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: gmailUser,
          pass: gmailAppPassword,
        },
      });

      await transporter.sendMail({
        from: `"Qorvex Feedback" <${gmailUser}>`,
        to: feedbackRecipient,
        replyTo: email || undefined,
        subject: subject,
        text: textContent,
        html: htmlContent,
      });
      console.log("Email sent via Gmail SMTP");
    }

    return NextResponse.json(
      { success: true, message: "Feedback sent successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error sending feedback:", error);
    return NextResponse.json(
      { error: "Failed to send feedback. Please try again later." },
      { status: 500 },
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
