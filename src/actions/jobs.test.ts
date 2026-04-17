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

import { applyForJob } from "./jobs";
import { applyToJob } from "./student-jobs";

describe("job application actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue({ id: "student-1" });
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

  it("applies to a student jobs listing successfully", async () => {
    db.jobApplication.create.mockResolvedValue({ id: "application-2" });

    await expect(applyToJob("job-2", "https://example.com/resume")).resolves.toEqual({
      success: true,
    });
    expect(revalidatePath).toHaveBeenCalledWith("/student/jobs");
  });
});
