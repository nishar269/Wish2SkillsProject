import nodemailer from "nodemailer";
import { Resend } from "resend";

type MailProvider = "resend" | "smtp" | "suppressed";
type MailDeliveryMode = "live" | "log" | "disabled";

type MailSender = {
  email: string;
  name: string;
};

type MailDispatchResult = {
  id: string | null;
  provider: MailProvider;
};

type MailTransport = {
  provider: MailProvider;
  send: (payload: {
    to: string;
    subject: string;
    html: string;
    sender: MailSender;
  }) => Promise<MailDispatchResult>;
  verify?: () => Promise<boolean>;
};

function getSender() {
  const email = process.env.MAIL_FROM_EMAIL ?? process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER;

  if (!email) {
    return null;
  }

  return {
    email,
    name: process.env.MAIL_FROM_NAME ?? "Wish2Skill CampusOS",
  };
}

function getDeliveryMode(): MailDeliveryMode {
  const configuredMode = process.env.MAIL_DELIVERY_MODE;

  if (configuredMode === "live" || configuredMode === "log" || configuredMode === "disabled") {
    return configuredMode;
  }

  return process.env.NODE_ENV === "production" ? "live" : "log";
}

function createResendTransport() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }

  const client = new Resend(apiKey);

  return {
    provider: "resend" as const,
    async send({ to, subject, html, sender }) {
      const { data, error } = await client.emails.send({
        from: `"${sender.name}" <${sender.email}>`,
        to,
        subject,
        html,
      });

      if (error) {
        throw error;
      }

      return {
        id: data?.id ?? null,
        provider: "resend" as const,
      };
    },
    async verify() {
      return true;
    }
  } satisfies MailTransport;
}

function createSmtpTransport() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const service = process.env.SMTP_SERVICE ?? (host ? undefined : "gmail");

  const transporter = nodemailer.createTransport(
    service
      ? {
          service,
          auth: { user, pass },
        }
      : {
          host,
          port,
          secure,
          auth: { user, pass },
        }
  );

  return {
    provider: "smtp" as const,
    async send({ to, subject, html, sender }) {
      const info = await transporter.sendMail({
        from: `"${sender.name}" <${sender.email}>`,
        to,
        subject,
        html,
      });

      return {
        id: info.messageId ?? null,
        provider: "smtp" as const,
      };
    },
    async verify() {
      return await transporter.verify();
    }
  } satisfies MailTransport;
}

function getTransport() {
  return createResendTransport() ?? createSmtpTransport();
}

export async function checkMailHealth() {
  const deliveryMode = getDeliveryMode();
  if (deliveryMode !== "live") {
    return { status: "healthy", mode: deliveryMode, message: `Mail delivery is in ${deliveryMode} mode.` };
  }

  const transport = getTransport();
  if (!transport) {
    return { status: "unhealthy", mode: deliveryMode, error: "No transport configured." };
  }

  try {
    if (transport.verify) {
      await transport.verify();
    }
    return { status: "healthy", provider: transport.provider };
  } catch (error) {
    return { status: "unhealthy", provider: transport.provider, error: getErrorMessage(error) };
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown mail transport error";
}

function getErrorCode(error: unknown) {
  if (!error || typeof error !== "object") {
    return null;
  }

  const withCode = error as {
    code?: string;
    statusCode?: number;
    responseCode?: number;
  };

  return withCode.responseCode ?? withCode.statusCode ?? withCode.code ?? null;
}

function isRetryableEmailError(error: unknown) {
  const code = getErrorCode(error);

  if (typeof code === "number") {
    return [421, 425, 429, 450, 451, 452, 454].includes(code);
  }

  if (typeof code === "string") {
    return ["ECONNECTION", "ECONNRESET", "ETIMEDOUT", "ESOCKET"].includes(code);
  }

  return false;
}

export async function sendNotificationEmail(
  to: string,
  subject: string,
  title: string,
  message: string,
  actionLabel?: string,
  actionUrl?: string
) {
  const deliveryMode = getDeliveryMode();
  const sender = getSender();
  const transport = getTransport();

  if (deliveryMode !== "live") {
    console.log(`Email delivery ${deliveryMode === "disabled" ? "disabled" : "suppressed"}:`, {
      to,
      subject,
    });
    return { success: true, id: null, provider: "suppressed" as const };
  }

  if (!sender || !transport) {
    console.log("Email Notification Skipped (No email provider configured):", { to, subject });
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

  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const result = await transport.send({
        to,
        subject,
        html,
        sender,
      });

      console.log(`[MAIL_SUCCESS] Email sent via ${result.provider} (Attempt ${attempt + 1}/${MAX_RETRIES}): ${result.id ?? "(no id)"} | To: ${to} | Subject: "${subject}"`);
      return { success: true, id: result.id, provider: result.provider, attempt: attempt + 1 };
    } catch (error) {
      attempt++;
      const isRetryable = isRetryableEmailError(error);
      const code = getErrorCode(error);
      const messageError = getErrorMessage(error);

      if (attempt >= MAX_RETRIES || !isRetryable) {
        console.error(`[MAIL_FAILED] Final failure via ${transport.provider} (Attempt ${attempt}/${MAX_RETRIES}):`, {
          code,
          error: messageError,
          to,
          subject,
          isRetryable
        });
        return { success: false, error: messageError, provider: transport.provider };
      }

      const backoffMs = Math.pow(2, attempt) * 1000;
      console.warn(`[MAIL_RETRY] Delivery error via ${transport.provider} (Attempt ${attempt}/${MAX_RETRIES}). Retrying in ${backoffMs}ms...`, {
        code,
        error: messageError,
        to
      });
      
      await new Promise(res => setTimeout(res, backoffMs));
    }
  }
}
