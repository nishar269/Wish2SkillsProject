import { beforeEach, describe, expect, it, vi } from "vitest";

const { sendMail, createTransport } = vi.hoisted(() => {
  const sendMailMock = vi.fn();
  return {
    sendMail: sendMailMock,
    createTransport: vi.fn().mockReturnValue({
      sendMail: sendMailMock,
    }),
  };
});

const { resendSend, Resend } = vi.hoisted(() => {
  const resendSendMock = vi.fn();
  function ResendMock() {
    return {
      emails: {
        send: resendSendMock,
      },
    };
  }
  return {
    resendSend: resendSendMock,
    Resend: vi.fn(ResendMock),
  };
});

vi.mock("nodemailer", () => ({ default: { createTransport } }));
vi.mock("resend", () => ({ Resend }));

describe("mail helper", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_SECURE;
    delete process.env.SMTP_SERVICE;
    delete process.env.SMTP_FROM_EMAIL;
    delete process.env.MAIL_FROM_EMAIL;
    delete process.env.MAIL_FROM_NAME;
    delete process.env.MAIL_DELIVERY_MODE;
    delete process.env.RESEND_API_KEY;
  });

  it("suppresses delivery by default outside production", async () => {
    process.env.SMTP_USER = "test@example.com";
    process.env.SMTP_PASS = "password123";

    const { sendNotificationEmail } = await import("./mail");

    await expect(sendNotificationEmail("user@example.com", "Subject", "Title", "Message")).resolves.toEqual({
      success: true,
      id: null,
      provider: "suppressed",
    });
    expect(sendMail).not.toHaveBeenCalled();
    expect(resendSend).not.toHaveBeenCalled();
  });

  it("skips sending in live mode when no provider is configured", async () => {
    process.env.MAIL_DELIVERY_MODE = "live";

    const { sendNotificationEmail } = await import("./mail");

    await expect(sendNotificationEmail("user@example.com", "Subject", "Title", "Message")).resolves.toBeUndefined();
    expect(sendMail).not.toHaveBeenCalled();
    expect(resendSend).not.toHaveBeenCalled();
  });

  it("prefers resend when the api key is configured", async () => {
    process.env.MAIL_DELIVERY_MODE = "live";
    process.env.RESEND_API_KEY = "re_test_123";
    process.env.MAIL_FROM_EMAIL = "test@example.com";

    resendSend.mockResolvedValue({ data: { id: "resend-1" }, error: null });

    const { sendNotificationEmail } = await import("./mail");

    await expect(sendNotificationEmail("user@example.com", "Subject", "Title", "Message")).resolves.toEqual({
      success: true,
      id: "resend-1",
      provider: "resend",
    });

    expect(resendSend).toHaveBeenCalledTimes(1);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("falls back to SMTP when resend is not configured", async () => {
    process.env.MAIL_DELIVERY_MODE = "live";
    process.env.SMTP_USER = "test@example.com";
    process.env.SMTP_PASS = "password123";
    
    sendMail.mockResolvedValue({ messageId: "email-1" });

    const { sendNotificationEmail } = await import("./mail");

    await expect(sendNotificationEmail("user@example.com", "Subject", "Title", "Message")).resolves.toEqual({
      success: true,
      id: "email-1",
      provider: "smtp",
    });

    expect(createTransport).toHaveBeenCalledTimes(1);
  });

  it("swallows transient SMTP failures and logs a warning", async () => {
    process.env.MAIL_DELIVERY_MODE = "live";
    process.env.SMTP_USER = "test@example.com";
    process.env.SMTP_PASS = "password123";

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    sendMail.mockRejectedValue({ responseCode: 451, message: "Temporarily rejected" });

    const { sendNotificationEmail } = await import("./mail");

    await expect(sendNotificationEmail("user@example.com", "Subject", "Title", "Message")).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
