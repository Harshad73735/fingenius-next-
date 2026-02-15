"use server";

import { Resend } from "resend";

export async function sendEmail({ to, subject, react }) {
  const apiKey = process.env.RESEND_API_KEY;
  const verifiedEmail = "harshadhadule0@gmail.com"; // Your verified Resend email
  
  console.log("[sendEmail] Attempting to send email:", {
    to,
    subject,
    apiKeyExists: !!apiKey,
    apiKeyPreview: apiKey ? apiKey.substring(0, 10) + "..." : "MISSING"
  });

  if (!apiKey) {
    console.error("[sendEmail] ERROR: RESEND_API_KEY is not set in .env");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  // Check if recipient email is verified in Resend
  if (to !== verifiedEmail) {
    console.warn("[sendEmail] WARNING: Email recipient is not verified in Resend.", {
      to,
      verifiedEmail,
      instruction: "In development, only verified emails can receive. To send to other emails, verify a domain at resend.com/domains"
    });
    // Still attempt to send - Resend will handle the validation
  }

  const resend = new Resend(apiKey);

  try {
    const data = await resend.emails.send({
      from: "Finance App <onboarding@resend.dev>",
      to,
      subject,
      react,
    });

    console.log("[sendEmail] Email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("[sendEmail] FAILED TO SEND:", {
      error: error.message,
      status: error.statusCode,
      details: error,
      to,
      subject,
      instruction: to !== verifiedEmail ? `Only ${verifiedEmail} can receive emails in test mode. Verify your domain at https://resend.com/domains to send to other emails.` : null
    });
    return { success: false, error: error.message };
  }
}
