"use server";

import { Resend } from "resend";

export async function sendEmail({ to, subject, react }) {
  const apiKey = process.env.RESEND_API_KEY;
  
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
      response: error.response,
      to,
      subject
    });
    return { success: false, error: error.message };
  }
}
