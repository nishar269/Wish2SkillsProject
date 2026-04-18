import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, revalidatePath, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  revalidatePath: vi.fn(),
  db: {
    jobPost: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    jobApplication: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("next/cache", () => ({ revalidatePath }));

describe("career actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns open job posts for any signed-in user", async () => {
    const posts = [{ id: "job-1", title: "Frontend Developer" }];
    auth.mockResolvedValue({ user: { id: "student-1", role: "STUDENT" } });
    db.jobPost.findMany.mockResolvedValue(posts);

    const { getJobPosts } = await import("./career");

    await expect(getJobPosts()).resolves.toEqual(posts);
    expect(db.jobPost.findMany).toHaveBeenCalledWith({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { applications: true } } },
    });
  });

  it("rejects job post listing when the user is not signed in", async () => {
    auth.mockResolvedValue(null);

    const { getJobPosts } = await import("./career");

    await expect(getJobPosts()).rejects.toThrow("Unauthorized");
  });

  it("creates a job post for admins and coordinators", async () => {
    auth.mockResolvedValue({ user: { id: "coord-1", role: "COORDINATOR" } });

    const { createJobPost } = await import("./career");

    await expect(
      createJobPost({
        title: "Backend Engineer",
        company: "Wish2Skill",
        location: "Remote",
        type: "Full-time",
        salaryRange: "8-10 LPA",
        description: "Build internal products.",
        requirements: "Node.js, Prisma",
      })
    ).resolves.toEqual({ success: true });

    expect(db.jobPost.create).toHaveBeenCalledWith({
      data: {
        title: "Backend Engineer",
        company: "Wish2Skill",
        location: "Remote",
        type: "Full-time",
        salaryRange: "8-10 LPA",
        description: "Build internal products.",
        requirements: "Node.js, Prisma",
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/career");
  });

  it("returns an error when job post creation fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.jobPost.create.mockRejectedValue(new Error("db error"));

    const { createJobPost } = await import("./career");

    await expect(
      createJobPost({
        title: "Backend Engineer",
        company: "Wish2Skill",
        location: "Remote",
        type: "Full-time",
        salaryRange: "8-10 LPA",
        description: "Build internal products.",
        requirements: "Node.js, Prisma",
      })
    ).resolves.toEqual({ error: "Failed to create job post." });
    expect(errorSpy).toHaveBeenCalled();
  });

  it("deletes job posts for authorized users", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });

    const { deleteJobPost } = await import("./career");

    await expect(deleteJobPost("job-1")).resolves.toEqual({ success: true });
    expect(db.jobPost.delete).toHaveBeenCalledWith({ where: { id: "job-1" } });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/career");
  });

  it("returns an error when job post deletion fails", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.jobPost.delete.mockRejectedValue(new Error("constraint"));

    const { deleteJobPost } = await import("./career");

    await expect(deleteJobPost("job-1")).resolves.toEqual({ error: "Failed to delete job post." });
  });

  it("loads applications for a specific job", async () => {
    const applications = [{ id: "app-1" }];
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.jobApplication.findMany.mockResolvedValue(applications);

    const { getJobApplications } = await import("./career");

    await expect(getJobApplications("job-1")).resolves.toEqual(applications);
    expect(db.jobApplication.findMany).toHaveBeenCalledWith({
      where: { jobId: "job-1" },
      include: { student: { include: { user: { select: { name: true, email: true } } } } },
      orderBy: { createdAt: "desc" },
    });
  });

  it("updates application status for authorized users", async () => {
    auth.mockResolvedValue({ user: { id: "coord-1", role: "COORDINATOR" } });

    const { updateApplicationStatus } = await import("./career");

    await expect(updateApplicationStatus("app-1", "REVIEWED")).resolves.toEqual({ success: true });
    expect(db.jobApplication.update).toHaveBeenCalledWith({
      where: { id: "app-1" },
      data: { status: "REVIEWED" },
    });
  });

  it("returns an error when status updates fail", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.jobApplication.update.mockRejectedValue(new Error("db error"));

    const { updateApplicationStatus } = await import("./career");

    await expect(updateApplicationStatus("app-1", "REVIEWED")).resolves.toEqual({ error: "Failed to update status." });
  });
});
