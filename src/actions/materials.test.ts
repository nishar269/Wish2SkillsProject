import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, revalidatePath, db, getGenerativeModel, GoogleGenerativeAI } = vi.hoisted(() => ({
  auth: vi.fn(),
  revalidatePath: vi.fn(),
  db: {
    faculty: {
      findUnique: vi.fn(),
    },
    subject: {
      findUnique: vi.fn(),
    },
    material: {
      create: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
  getGenerativeModel: vi.fn(),
  GoogleGenerativeAI: vi.fn().mockImplementation(function MockGoogleGenerativeAI() {
    return {
      getGenerativeModel,
    };
  }),
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@google/generative-ai", () => ({ GoogleGenerativeAI }));

describe("materials actions", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete process.env.GEMINI_API_KEY;
  });

  it("creates a material using the inferred course batch", async () => {
    auth.mockResolvedValue({ user: { id: "faculty-user", role: "FACULTY" } });
    db.faculty.findUnique.mockResolvedValue({ id: "faculty-1" });
    db.subject.findUnique.mockResolvedValue({
      course: { batches: [{ id: "batch-1" }] },
    });
    db.material.create.mockResolvedValue({ id: "material-1" });

    const { createMaterial } = await import("./materials");

    await expect(
      createMaterial({
        title: "React Notes",
        fileUrl: "https://example.com/react-notes.pdf",
        fileType: "PDF",
        subjectId: "subject-1",
      })
    ).resolves.toEqual({ success: true });

    expect(db.material.create).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith("/faculty/resources");
    expect(revalidatePath).toHaveBeenCalledWith("/student/resources");
  });

  it("returns a batch-linking error when no batch can be inferred", async () => {
    auth.mockResolvedValue({ user: { id: "admin-user", role: "ADMIN" } });
    db.subject.findUnique.mockResolvedValue({ course: { batches: [] } });

    const { createMaterial } = await import("./materials");

    await expect(
      createMaterial({
        title: "React Notes",
        fileUrl: "https://example.com/react-notes.pdf",
        fileType: "PDF",
        subjectId: "subject-1",
      })
    ).resolves.toEqual({ error: "No batch is linked to this subject's course." });
  });

  it("returns a fallback summary when Gemini is unavailable", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.material.findUnique.mockResolvedValue({
      title: "React Notes",
      description: "Hooks overview",
      subject: { name: "Frontend" },
    });

    const { summarizeMaterial } = await import("./materials");

    await expect(summarizeMaterial("material-1")).resolves.toEqual({
      summary: "AI Summarization is currently unavailable. Please check your API key configuration.",
    });
  });
});
