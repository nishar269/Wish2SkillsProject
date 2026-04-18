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

  // ----- getMaterials -----

  it("returns all materials when no subjectId is provided", async () => {
    const materials = [{ id: "m1", title: "Notes" }];
    db.material.findMany.mockResolvedValue(materials);

    const { getMaterials } = await import("./materials");

    await expect(getMaterials()).resolves.toEqual(materials);
    expect(db.material.findMany).toHaveBeenCalledWith({
      where: {},
      include: {
        subject: true,
        uploader: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  });

  it("filters materials by subjectId when provided", async () => {
    db.material.findMany.mockResolvedValue([]);

    const { getMaterials } = await import("./materials");

    await expect(getMaterials("subject-1")).resolves.toEqual([]);
    expect(db.material.findMany).toHaveBeenCalledWith({
      where: { subjectId: "subject-1" },
      include: {
        subject: true,
        uploader: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  });

  // ----- createMaterial -----

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

  it("creates a material with an explicit batchId (skips inference)", async () => {
    auth.mockResolvedValue({ user: { id: "faculty-user", role: "FACULTY" } });
    db.faculty.findUnique.mockResolvedValue({ id: "faculty-1" });
    db.material.create.mockResolvedValue({ id: "material-2" });

    const { createMaterial } = await import("./materials");

    await expect(
      createMaterial({
        title: "Vue Notes",
        fileUrl: "https://example.com/vue.pdf",
        fileType: "PDF",
        subjectId: "subject-2",
        batchId: "explicit-batch",
      })
    ).resolves.toEqual({ success: true });

    expect(db.subject.findUnique).not.toHaveBeenCalled();
    expect(db.material.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ batchId: "explicit-batch" }),
    });
  });

  it("creates a material as admin (no faculty lookup)", async () => {
    auth.mockResolvedValue({ user: { id: "admin-user", role: "ADMIN" } });
    db.subject.findUnique.mockResolvedValue({
      course: { batches: [{ id: "batch-1" }] },
    });
    db.material.create.mockResolvedValue({ id: "material-3" });

    const { createMaterial } = await import("./materials");

    await expect(
      createMaterial({
        title: "Admin Notes",
        fileUrl: "https://example.com/admin.pdf",
        fileType: "PDF",
        subjectId: "subject-1",
      })
    ).resolves.toEqual({ success: true });

    expect(db.faculty.findUnique).not.toHaveBeenCalled();
    expect(db.material.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ uploadedBy: "" }),
    });
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

  it("returns an error when material creation db call throws", async () => {
    auth.mockResolvedValue({ user: { id: "faculty-user", role: "FACULTY" } });
    db.faculty.findUnique.mockResolvedValue({ id: "faculty-1" });
    db.subject.findUnique.mockResolvedValue({
      course: { batches: [{ id: "batch-1" }] },
    });
    db.material.create.mockRejectedValue(new Error("db error"));

    const { createMaterial } = await import("./materials");

    await expect(
      createMaterial({
        title: "React Notes",
        fileUrl: "https://example.com/react-notes.pdf",
        fileType: "PDF",
        subjectId: "subject-1",
      })
    ).resolves.toEqual({ error: "Failed to upload material record." });
  });

  it("rejects createMaterial for unauthorized roles", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });

    const { createMaterial } = await import("./materials");

    await expect(
      createMaterial({
        title: "Notes",
        fileUrl: "https://example.com/notes.pdf",
        fileType: "PDF",
        subjectId: "subject-1",
      })
    ).rejects.toThrow("Unauthorized");
  });

  it("rejects createMaterial when there is no session", async () => {
    auth.mockResolvedValue(null);

    const { createMaterial } = await import("./materials");

    await expect(
      createMaterial({
        title: "Notes",
        fileUrl: "https://example.com/notes.pdf",
        fileType: "PDF",
        subjectId: "subject-1",
      })
    ).rejects.toThrow("Unauthorized");
  });

  it("handles faculty without a profile (uploadedBy falls back to empty)", async () => {
    auth.mockResolvedValue({ user: { id: "faculty-user", role: "FACULTY" } });
    db.faculty.findUnique.mockResolvedValue(null);
    db.subject.findUnique.mockResolvedValue({
      course: { batches: [{ id: "batch-1" }] },
    });
    db.material.create.mockResolvedValue({ id: "material-4" });

    const { createMaterial } = await import("./materials");

    await expect(
      createMaterial({
        title: "Notes",
        fileUrl: "https://example.com/notes.pdf",
        fileType: "PDF",
        subjectId: "subject-1",
      })
    ).resolves.toEqual({ success: true });

    expect(db.material.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ uploadedBy: "" }),
    });
  });

  // ----- deleteMaterial -----

  it("deletes a material and revalidates", async () => {
    auth.mockResolvedValue({ user: { id: "faculty-user", role: "FACULTY" } });

    const { deleteMaterial } = await import("./materials");

    await expect(deleteMaterial("material-1")).resolves.toEqual({ success: true });
    expect(db.material.delete).toHaveBeenCalledWith({ where: { id: "material-1" } });
    expect(revalidatePath).toHaveBeenCalledWith("/faculty/resources");
  });

  it("returns an error when deleteMaterial db call throws", async () => {
    auth.mockResolvedValue({ user: { id: "faculty-user", role: "FACULTY" } });
    db.material.delete.mockRejectedValue(new Error("db error"));

    const { deleteMaterial } = await import("./materials");

    await expect(deleteMaterial("material-1")).resolves.toEqual({ error: "Failed to delete material." });
  });

  // ----- summarizeMaterial -----

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

  it("rejects summarizeMaterial when there is no session", async () => {
    auth.mockResolvedValue(null);

    const { summarizeMaterial } = await import("./materials");

    await expect(summarizeMaterial("material-1")).rejects.toThrow("Unauthorized");
  });

  it("throws when material is not found", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.material.findUnique.mockResolvedValue(null);

    const { summarizeMaterial } = await import("./materials");

    await expect(summarizeMaterial("missing-id")).rejects.toThrow("Material not found");
  });

  it("returns an AI summary when Gemini API key is set", async () => {
    process.env.GEMINI_API_KEY = "test-key";

    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.material.findUnique.mockResolvedValue({
      title: "React Notes",
      description: null,
      subject: { name: "Frontend" },
    });

    const generateContent = vi.fn().mockResolvedValue({
      response: { text: () => "• Point 1\n• Point 2" },
    });
    getGenerativeModel.mockReturnValue({ generateContent });

    const { summarizeMaterial } = await import("./materials");

    await expect(summarizeMaterial("material-1")).resolves.toEqual({
      summary: "• Point 1\n• Point 2",
    });
    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  it("returns an error when Gemini call fails", async () => {
    process.env.GEMINI_API_KEY = "test-key";

    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.material.findUnique.mockResolvedValue({
      title: "React Notes",
      description: "overview",
      subject: { name: "Frontend" },
    });

    const generateContent = vi.fn().mockRejectedValue(new Error("API down"));
    getGenerativeModel.mockReturnValue({ generateContent });

    const { summarizeMaterial } = await import("./materials");

    await expect(summarizeMaterial("material-1")).resolves.toEqual({
      error: "Failed to generate summary.",
    });
  });
});
