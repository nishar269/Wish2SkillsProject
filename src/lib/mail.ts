import nodemailer from "nodemailer";

// Create a reusable transporter using Gmail SMTP
function getTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
}

export async function sendNotificationEmail(
  to: string,
  subject: string,
  title: string,
  message: string,
  actionLabel?: string,
  actionUrl?: string
) {
  const transporter = getTransporter();

  if (!transporter) {
    console.log("Email Notification Skipped (No SMTP credentials):", { to, subject, message });
    return;
  }

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #2563eb, #3b82f6); padding: 32px 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 700;">🎓 Wish2Skill CampusOS</h1>
        <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.85;">AI-Powered Institute Management</p>
      </div>
      <div style="padding: 32px 24px; color: #333;">
        <h2 style="margin-top: 0; color: #1e293b; font-size: 20px;">${title}</h2>
        <p style="font-size: 15px; line-height: 1.7; color: #475569;">${message}</p>
        ${actionUrl ? `
          <div style="margin-top: 32px; text-align: center;">
            <a href="${actionUrl}" style="background-color: #2563eb; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
              ${actionLabel || "View Details"}
            </a>
          </div>
        ` : ""}
      </div>
      <div style="background-color: #f8fafc; padding: 16px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        &copy; ${new Date().getFullYear()} Wish2Skill CampusOS — Built for educational excellence.
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Wish2Skill CampusOS" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);
    return { success: true, id: info.messageId };
  } catch (error) {
    console.error("Email Error:", error);
    return { error };
  }
}
