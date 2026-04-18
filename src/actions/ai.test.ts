import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, getGenerativeModel, GoogleGenerativeAI, fetchMock } = vi.hoisted(() => ({
  auth: vi.fn(),
  getGenerativeModel: vi.fn(),
  fetchMock: vi.fn(),
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
    vi.stubGlobal("fetch", fetchMock);
    auth.mockResolvedValue({ user: { id: "user-1", role: "ADMIN", name: "System Admin" } });
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.GEMINI_API_KEY;
  });

  it("rejects unauthenticated users", async () => {
    auth.mockResolvedValue(null);

    const { chatWithCampusAI } = await import("./ai");

    await expect(chatWithCampusAI("hello")).rejects.toThrow("Unauthorized");
  });

  it("returns offline mode when GEMINI_API_KEY is missing", async () => {
    const { chatWithCampusAI } = await import("./ai");

    await expect(chatWithCampusAI("hello")).resolves.toEqual(
      expect.objectContaining({ isOffline: true })
    );
  });

  it("prefers OpenRouter when OPENROUTER_API_KEY is configured", async () => {
    process.env.OPENROUTER_API_KEY = "openrouter-key";
    process.env.GEMINI_API_KEY = "gemini-key";
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        choices: [{ message: { content: "OpenRouter response" } }],
      }),
    });

    const { chatWithCampusAI } = await import("./ai");

    await expect(
      chatWithCampusAI("What is my schedule?", [{ role: "user", parts: [{ text: "Hi" }] }])
    ).resolves.toEqual({ text: "OpenRouter response" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer openrouter-key",
        }),
      })
    );
    expect(GoogleGenerativeAI).not.toHaveBeenCalled();
  });

  it("returns a graceful message when OpenRouter responds with an error", async () => {
    process.env.OPENROUTER_API_KEY = "openrouter-key";
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      text: vi.fn().mockResolvedValue("provider failed"),
    });

    const { chatWithCampusAI } = await import("./ai");

    await expect(chatWithCampusAI("hello")).resolves.toEqual({
      text: "Sorry, I'm having trouble processing your request right now. Please try again in a moment.",
    });
    expect(errorSpy).toHaveBeenCalled();
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

  it("returns a graceful message when Gemini fails", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    getGenerativeModel.mockReturnValue({
      startChat: () => ({
        sendMessage: vi.fn().mockRejectedValue(new Error("Gemini failed")),
      }),
    });

    const { chatWithCampusAI } = await import("./ai");

    await expect(chatWithCampusAI("hello")).resolves.toEqual({
      text: "Sorry, I'm having trouble processing your request right now. Please try again in a moment.",
    });
    expect(errorSpy).toHaveBeenCalled();
  });
});
