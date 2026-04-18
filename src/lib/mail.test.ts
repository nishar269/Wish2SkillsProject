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
      attempt: 1,
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
      attempt: 1,
    });

    expect(createTransport).toHaveBeenCalledTimes(1);
  });

  it("retries transient SMTP failures, backs off, and eventually fails gracefully", async () => {
    vi.useFakeTimers();
    process.env.MAIL_DELIVERY_MODE = "live";
    process.env.SMTP_USER = "test@example.com";
    process.env.SMTP_PASS = "password123";

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const errObj = new Error("Temporarily rejected") as any;
    errObj.responseCode = 451;
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    sendMail.mockRejectedValue(errObj);

    const { sendNotificationEmail } = await import("./mail");

    const promise = sendNotificationEmail("user@example.com", "Subject", "Title", "Message");

    // First attempt fails, waits 1000ms
    await vi.advanceTimersByTimeAsync(1001);
    
    // Second attempt fails, waits 2000ms
    await vi.advanceTimersByTimeAsync(2001);
    
    // Third attempt fails, returns error
    await vi.advanceTimersByTimeAsync(4001);

    await expect(promise).resolves.toEqual({
      success: false,
      error: "Temporarily rejected",
      provider: "smtp"
    });
    
    expect(warn).toHaveBeenCalledTimes(2);
    expect(err).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledTimes(3);

    warn.mockRestore();
    err.mockRestore();
    vi.useRealTimers();
  });

  it("checks mail health correctly", async () => {
    const { checkMailHealth } = await import("./mail");
    
    // Non-live mode
    process.env.MAIL_DELIVERY_MODE = "log";
    await expect(checkMailHealth()).resolves.toMatchObject({ status: "healthy", mode: "log" });

    // Live mode, no provider
    process.env.MAIL_DELIVERY_MODE = "live";
    delete process.env.SMTP_USER;
    delete process.env.RESEND_API_KEY;
    await expect(checkMailHealth()).resolves.toMatchObject({ status: "unhealthy", error: "No transport configured." });
  });
});
