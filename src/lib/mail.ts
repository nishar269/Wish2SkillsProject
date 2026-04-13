import { Resend } from 'resend';

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");
  }
  return _resend;
}

export async function sendNotificationEmail(
  to: string, 
  subject: string, 
  title: string, 
  message: string, 
  actionLabel?: string, 
  actionUrl?: string
) {
  if (!process.env.RESEND_API_KEY) {
    console.log("Email Notification Skipped (No API Key):", { to, subject, message });
    return;
  }

  try {
    const data = await getResend().emails.send({
      from: 'Wish2Skill CampusOS <notifications@resend.dev>', // Update with verified domain in production
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(to right, #0891b2, #2563eb); padding: 40px 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Wish2Skill CampusOS</h1>
          </div>
          <div style="padding: 40px 20px; color: #333;">
            <h2 style="margin-top: 0; color: #1e293b;">${title}</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #475569;">${message}</p>
            ${actionUrl ? `
              <div style="margin-top: 40px;">
                <a href="${actionUrl}" style="background-color: #0891b2; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                  ${actionLabel || 'View Details'}
                </a>
              </div>
            ` : ''}
          </div>
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b;">
            &copy; ${new Date().getFullYear()} Wish2Skill CampusOS. Built for educational excellence.
          </div>
        </div>
      `,
    });

    return { success: true, id: data.id };
  } catch (error) {
    console.error("Resend Error:", error);
    return { error };
  }
}
