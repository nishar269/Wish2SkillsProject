import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, getGenerativeModel, GoogleGenerativeAI } = vi.hoisted(() => ({
  auth: vi.fn(),
  getGenerativeModel: vi.fn(),
  GoogleGenerativeAI: vi.fn().mockImplementation(function MockGoogleGenerativeAI() {
    return {
      getGenerativeModel,
    };
  }),
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@google/generative-ai", () => ({ GoogleGenerativeAI }));

describe("ai actions", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    auth.mockResolvedValue({ user: { id: "user-1", role: "ADMIN", name: "System Admin" } });
    delete process.env.GEMINI_API_KEY;
  });

  it("returns offline mode when GEMINI_API_KEY is missing", async () => {
    const { chatWithCampusAI } = await import("./ai");

    await expect(chatWithCampusAI("hello")).resolves.toEqual(
      expect.objectContaining({ isOffline: true })
    );
  });

  it("returns model text when Gemini responds", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    getGenerativeModel.mockReturnValue({
      startChat: () => ({
        sendMessage: vi.fn().mockResolvedValue({
          response: {
            text: () => "AI response",
          },
        }),
      }),
    });

    const { chatWithCampusAI } = await import("./ai");

    await expect(chatWithCampusAI("hello")).resolves.toEqual({ text: "AI response" });
  });
});
