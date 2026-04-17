import { beforeEach, describe, expect, it, vi } from "vitest";

const { sendEmail, Resend } = vi.hoisted(() => ({
  sendEmail: vi.fn(),
  Resend: vi.fn().mockImplementation(function MockResend() {
    return {
      emails: {
        send: sendEmail,
      },
    };
  }),
}));

vi.mock("resend", () => ({ Resend }));

describe("mail helper", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete process.env.RESEND_API_KEY;
  });

  it("skips sending when RESEND_API_KEY is missing", async () => {
    const { sendNotificationEmail } = await import("./mail");

    await expect(sendNotificationEmail("user@example.com", "Subject", "Title", "Message")).resolves.toBeUndefined();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("sends mail when RESEND_API_KEY is present", async () => {
    process.env.RESEND_API_KEY = "re_test";
    sendEmail.mockResolvedValue({ data: { id: "email-1" }, error: null });

    const { sendNotificationEmail } = await import("./mail");

    await expect(sendNotificationEmail("user@example.com", "Subject", "Title", "Message")).resolves.toEqual({
      success: true,
      id: "email-1",
    });
  });
});
