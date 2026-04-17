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

vi.mock("nodemailer", () => ({ default: { createTransport } }));

describe("mail helper", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
  });

  it("skips sending when SMTP credentials are missing", async () => {
    const { sendNotificationEmail } = await import("./mail");

    await expect(sendNotificationEmail("user@example.com", "Subject", "Title", "Message")).resolves.toBeUndefined();
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("sends mail when SMTP credentials are present", async () => {
    process.env.SMTP_USER = "test@example.com";
    process.env.SMTP_PASS = "password123";
    
    sendMail.mockResolvedValue({ messageId: "email-1" });

    const { sendNotificationEmail } = await import("./mail");

    await expect(sendNotificationEmail("user@example.com", "Subject", "Title", "Message")).resolves.toEqual({
      success: true,
      id: "email-1",
    });
  });
});
