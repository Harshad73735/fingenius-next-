"use server";

// import { Resend } from "resend";
import nodemailer from "nodemailer";
import { render } from "@react-email/render";

export async function sendEmail({ to, subject, react }) {
  // Convert single email to array for consistent handling
  const recipients = Array.isArray(to) ? to : [to];

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const smtpFrom = process.env.SMTP_FROM || smtpUser;
  const apiKey = process.env.RESEND_API_KEY;

  console.log("[sendEmail] Attempting to send email:", {
    recipients,
    subject,
    smtpConfigured: !!(smtpUser && smtpPass),
    smtpHost,
    smtpPort,
    resendApiKeyExists: !!apiKey,
  });

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const html = react ? await render(react) : undefined;
      const data = await transporter.sendMail({
        from: smtpFrom,
        to: recipients,
        subject,
        html,
      });

      console.log("[sendEmail] Email sent successfully via SMTP:", {
        messageId: data.messageId,
        response: data.response,
      });
      return { success: true, data };
    } catch (error) {
      const errorDetails = {
        message: error?.message,
        code: error?.code,
        name: error?.name,
        stack: error?.stack,
        recipients,
        subject,
      };
      console.error("[sendEmail] SMTP send failed:", errorDetails);

      // if (apiKey) {
      //   console.warn("[sendEmail] Falling back to Resend after SMTP failure");
      //   try {
      //     const resend = new Resend(apiKey);
      //     const data = await resend.emails.send({
      //       from: "Finance App <onboarding@resend.dev>",
      //       to,
      //       subject,
      //       react,
      //     });
      //
      //     console.log("[sendEmail] Email sent successfully via Resend:", data);
      //     return { success: true, data };
      //   } catch (resendError) {
      //     console.error("[sendEmail] Resend send failed after SMTP error:", {
      //       message: resendError?.message,
      //       code: resendError?.code,
      //       name: resendError?.name,
      //       status: resendError?.statusCode,
      //     });
      //   }
      // }

      return { success: false, error: error?.message || "SMTP send failed" };
    }
  }

  // if (!apiKey) {
  //   console.error("[sendEmail] ERROR: No SMTP credentials or RESEND_API_KEY configured");
  //   return { success: false, error: "Email provider not configured" };
  // }
  //
  // const resend = new Resend(apiKey);
  //
  // try {
  //   const data = await resend.emails.send({
  //     from: "Finance App <onboarding@resend.dev>",
  //     to,
  //     subject,
  //     react,
  //   });
  //
  //   console.log("[sendEmail] Email sent successfully via Resend:", data);
  //   return { success: true, data };
  // } catch (error) {
  //   console.error("[sendEmail] Resend send failed:", {
  //     error: error.message,
  //     status: error.statusCode,
  //     details: error,
  //     to,
  //     subject,
  //   });
  //   return { success: false, error: error.message };
  // }

  console.error("[sendEmail] ERROR: No SMTP credentials configured");
  return { success: false, error: "Email provider not configured" };
}
