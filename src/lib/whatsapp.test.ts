import { beforeEach, describe, expect, it, vi } from "vitest";

describe("whatsapp helper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.TWILIO_ACCOUNT_SID;
  });

  it("returns mocked success when Twilio is not configured", async () => {
    const { sendWhatsAppNotification } = await import("./whatsapp");

    await expect(sendWhatsAppNotification("+911234567890", "Hello")).resolves.toEqual({
      success: true,
      mocked: true,
    });
  });

  it("returns success when Twilio path is enabled", async () => {
    process.env.TWILIO_ACCOUNT_SID = "sid";
    const { sendWhatsAppNotification } = await import("./whatsapp");

    await expect(sendWhatsAppNotification("+911234567890", "Hello")).resolves.toEqual({
      success: true,
    });
  });

  it("handles errors gracefully", async () => {
    process.env.TWILIO_ACCOUNT_SID = "sid";
    // Force a throw by mocking console.log
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {
      throw new Error("Log failed");
    });
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { sendWhatsAppNotification } = await import("./whatsapp");

    const result = await sendWhatsAppNotification("+911234567890", "Hello");
    expect(result).toHaveProperty("error");
    expect(errSpy).toHaveBeenCalled();

    logSpy.mockRestore();
    errSpy.mockRestore();
  });
});
