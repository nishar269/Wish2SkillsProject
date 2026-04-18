import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const { auth, revalidatePath, db, generateContent, GoogleGenerativeAI } = vi.hoisted(() => {
  const generateContentMock = vi.fn();
  const getGenerativeModelMock = vi.fn(() => ({ generateContent: generateContentMock }));

  function MockGoogleGenerativeAI() {
    return { getGenerativeModel: getGenerativeModelMock };
  }

  return {
    auth: vi.fn(),
    revalidatePath: vi.fn(),
    db: {
      student: { findUnique: vi.fn() },
      feedback: { create: vi.fn(), findMany: vi.fn() },
    },
    generateContent: generateContentMock,
    getGenerativeModel: getGenerativeModelMock,
    GoogleGenerativeAI: vi.fn(MockGoogleGenerativeAI),
  };
});

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@google/generative-ai", () => ({ GoogleGenerativeAI }));

describe("feedback actions", () => {
  const originalGeminiKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.GEMINI_API_KEY;
  });

  afterAll(() => {
    process.env.GEMINI_API_KEY = originalGeminiKey;
  });

  it("rejects feedback from unauthenticated users", async () => {
    auth.mockResolvedValue(null);

    const { submitFeedback } = await import("./feedback");

    await expect(submitFeedback({ message: "This is useful feedback", rating: 5 })).resolves.toEqual({
      error: "Unauthorized",
    });
  });

  it("validates feedback length before writing", async () => {
    auth.mockResolvedValue({ user: { id: "student-user" } });

    const { submitFeedback } = await import("./feedback");

    await expect(submitFeedback({ message: "short", rating: 5 })).resolves.toEqual({
      error: "Feedback message must be at least 10 characters long.",
    });
  });

  it("creates feedback for a registered student", async () => {
    auth.mockResolvedValue({ user: { id: "student-user" } });
    db.student.findUnique.mockResolvedValue({ id: "student-1" });

    const { submitFeedback } = await import("./feedback");

    await expect(
      submitFeedback({ message: "The faculty sessions were very clear.", rating: 4, facultyId: "faculty-1" })
    ).resolves.toEqual({ success: true });

    expect(db.feedback.create).toHaveBeenCalledWith({
      data: {
        studentId: "student-1",
        facultyId: "faculty-1",
        message: "The faculty sessions were very clear.",
        rating: 4,
        sentiment: "NEUTRAL",
        isAnonymous: false,
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/feedback");
  });

  it("falls back to rule-based sentiment when Gemini fails", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    auth.mockResolvedValue({ user: { id: "student-user" } });
    db.student.findUnique.mockResolvedValue({ id: "student-1" });
    generateContent.mockRejectedValue(new Error("Gemini unavailable"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { submitFeedback } = await import("./feedback");

    await expect(
      submitFeedback({ message: "Excellent guidance from the faculty and staff.", rating: 5 })
    ).resolves.toEqual({ success: true });

    expect(db.feedback.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ sentiment: "POSITIVE" }),
      })
    );
    expect(errorSpy).toHaveBeenCalled();
  });

  it("aggregates authority feedback analytics", async () => {
    auth.mockResolvedValue({ user: { id: "authority-1", role: "AUTHORITY" } });
    db.feedback.findMany.mockResolvedValue([
      {
        id: "f1",
        isAnonymous: false,
        student: { user: { name: "Rahul" } },
        subject: { name: "React" },
        rating: 5,
        message: "Great",
        sentiment: "POSITIVE",
        createdAt: new Date("2026-01-01T00:00:00Z"),
      },
      {
        id: "f2",
        isAnonymous: true,
        student: { user: { name: "Ignored" } },
        subject: null,
        rating: 2,
        message: "Needs improvement",
        sentiment: "NEGATIVE",
        createdAt: new Date("2026-01-02T00:00:00Z"),
      },
    ]);

    const { getAuthorityFeedbackData } = await import("./feedback");

    await expect(getAuthorityFeedbackData()).resolves.toEqual({
      sentimentDistribution: {
        positive: 50,
        neutral: 0,
        negative: 50,
      },
      averageRating: 3.5,
      recentFeedbacks: [
        {
          id: "f1",
          studentName: "Rahul",
          subject: "React",
          rating: 5,
          message: "Great",
          sentiment: "POSITIVE",
          createdAt: new Date("2026-01-01T00:00:00Z"),
        },
        {
          id: "f2",
          studentName: "Anonymous Student",
          subject: "General Facility",
          rating: 2,
          message: "Needs improvement",
          sentiment: "NEGATIVE",
          createdAt: new Date("2026-01-02T00:00:00Z"),
        },
      ],
    });
  });

  it("returns all feedback for admins and [] for others", async () => {
    auth.mockResolvedValue({ user: { role: "ADMIN" } });
    db.feedback.findMany.mockResolvedValue([{ id: "f1" }]);

    const { getAllFeedback } = await import("./feedback");

    await expect(getAllFeedback()).resolves.toEqual([{ id: "f1" }]);

    auth.mockResolvedValue({ user: { role: "STUDENT" } });
    await expect(getAllFeedback()).resolves.toEqual([]);
  });
});
