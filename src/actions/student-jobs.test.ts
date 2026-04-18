import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, revalidatePath, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  revalidatePath: vi.fn(),
  db: {
    student: {
      findUnique: vi.fn(),
    },
    jobApplication: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("next/cache", () => ({ revalidatePath }));

describe("student-jobs actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully applies to a job for a valid student", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue({ id: "student-1" });

    const { applyToJob } = await import("./student-jobs");

    await expect(applyToJob("job-1", "https://example.com/resume.pdf")).resolves.toEqual({
      success: true,
    });
    expect(db.jobApplication.create).toHaveBeenCalledWith({
      data: {
        jobId: "job-1",
        studentId: "student-1",
        resumeUrl: "https://example.com/resume.pdf",
        status: "PENDING",
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/student/jobs");
  });

  it("rejects application when user is not a student", async () => {
    auth.mockResolvedValue({ user: { id: "admin-user", role: "ADMIN" } });

    const { applyToJob } = await import("./student-jobs");

    await expect(applyToJob("job-1", "https://example.com/resume.pdf")).rejects.toThrow(
      "Unauthorized"
    );
  });

  it("rejects application when there is no session", async () => {
    auth.mockResolvedValue(null);

    const { applyToJob } = await import("./student-jobs");

    await expect(applyToJob("job-1", "https://example.com/resume.pdf")).rejects.toThrow(
      "Unauthorized"
    );
  });

  it("throws when student profile is not found", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue(null);

    const { applyToJob } = await import("./student-jobs");

    await expect(applyToJob("job-1", "https://example.com/resume.pdf")).rejects.toThrow(
      "Student profile not found"
    );
  });

  it("returns an error when the application db call throws (e.g. duplicate)", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue({ id: "student-1" });
    db.jobApplication.create.mockRejectedValue(new Error("unique constraint"));

    const { applyToJob } = await import("./student-jobs");

    await expect(applyToJob("job-1", "https://example.com/resume.pdf")).resolves.toEqual({
      error: "You have already applied for this position or a system error occurred.",
    });
  });
});
