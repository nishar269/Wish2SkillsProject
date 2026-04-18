import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, revalidatePath, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  revalidatePath: vi.fn(),
  db: {
    jobPost: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    student: {
      findUnique: vi.fn(),
    },
    jobApplication: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("next/cache", () => ({ revalidatePath }));

import { applyForJob, createJobPost, getJobs, getStudentApplications } from "./jobs";
import { applyToJob } from "./student-jobs";

describe("job application actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue({ id: "student-1" });
  });

  it("creates a job post for coordinator access", async () => {
    auth.mockResolvedValue({ user: { id: "coordinator-user", role: "COORDINATOR" } });
    db.jobPost.create.mockResolvedValue({ id: "job-1" });

    await expect(
      createJobPost({
        title: "Frontend Developer",
        company: "Wish2Skill",
        location: "Bengaluru",
        type: "Full-time",
        salaryRange: "8-12 LPA",
        description: "Build product features.",
        requirements: "React, TypeScript",
      })
    ).resolves.toEqual({ success: true });

    expect(db.jobPost.create).toHaveBeenCalledWith({
      data: {
        title: "Frontend Developer",
        company: "Wish2Skill",
        location: "Bengaluru",
        type: "Full-time",
        salaryRange: "8-12 LPA",
        description: "Build product features.",
        requirements: "React, TypeScript",
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/career");
  });

  it("returns an error when job post creation fails", async () => {
    auth.mockResolvedValue({ user: { id: "admin-user", role: "ADMIN" } });
    db.jobPost.create.mockRejectedValue(new Error("db error"));

    await expect(
      createJobPost({
        title: "Backend Developer",
        company: "Wish2Skill",
        location: "Remote",
        type: "Contract",
        description: "Own APIs.",
        requirements: "Node.js",
      })
    ).resolves.toEqual({ error: "Failed to post job." });
  });

  it("returns published jobs ordered with application counts", async () => {
    db.jobPost.findMany.mockResolvedValue([{ id: "job-1", _count: { applications: 3 } }]);

    await expect(getJobs()).resolves.toEqual([{ id: "job-1", _count: { applications: 3 } }]);
    expect(db.jobPost.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { applications: true } } },
    });
  });

  it("applies to a career job successfully", async () => {
    db.jobApplication.create.mockResolvedValue({ id: "application-1" });

    await expect(applyForJob("job-1", "https://example.com/resume")).resolves.toEqual({
      success: true,
    });
    expect(revalidatePath).toHaveBeenCalledWith("/career");
  });

  it("returns a duplicate application error for career jobs", async () => {
    db.jobApplication.create.mockRejectedValue({ code: "P2002" });

    await expect(applyForJob("job-1", "https://example.com/resume")).resolves.toEqual({
      error: "You have already applied for this job.",
    });
  });

  it("returns a generic apply error for non-duplicate failures", async () => {
    db.jobApplication.create.mockRejectedValue(new Error("timeout"));

    await expect(applyForJob("job-1")).resolves.toEqual({
      error: "Failed to apply.",
    });
  });

  it("rejects apply requests from non-students", async () => {
    auth.mockResolvedValue({ user: { id: "faculty-user", role: "FACULTY" } });

    await expect(applyForJob("job-1")).rejects.toThrow("Unauthorized");
  });

  it("rejects apply requests when the student profile is missing", async () => {
    db.student.findUnique.mockResolvedValue(null);

    await expect(applyForJob("job-1")).rejects.toThrow("Student profile not found");
  });

  it("returns the current student's applications", async () => {
    db.jobApplication.findMany.mockResolvedValue([{ id: "application-1", job: { title: "Frontend Developer" } }]);

    await expect(getStudentApplications()).resolves.toEqual([
      { id: "application-1", job: { title: "Frontend Developer" } },
    ]);
    expect(db.jobApplication.findMany).toHaveBeenCalledWith({
      where: { studentId: "student-1" },
      include: { job: true },
      orderBy: { createdAt: "desc" },
    });
  });

  it("returns an empty applications list when the student profile does not exist", async () => {
    db.student.findUnique.mockResolvedValue(null);

    await expect(getStudentApplications()).resolves.toEqual([]);
  });

  it("applies to a student jobs listing successfully", async () => {
    db.jobApplication.create.mockResolvedValue({ id: "application-2" });

    await expect(applyToJob("job-2", "https://example.com/resume")).resolves.toEqual({
      success: true,
    });
    expect(revalidatePath).toHaveBeenCalledWith("/student/jobs");
  });
});
