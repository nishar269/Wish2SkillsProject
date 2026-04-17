import { beforeEach, describe, expect, it } from "vitest";

describe("whatsapp helper", () => {
  beforeEach(() => {
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
});
