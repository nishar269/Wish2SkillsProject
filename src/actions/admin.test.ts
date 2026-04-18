import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, revalidatePath, logAction, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  revalidatePath: vi.fn(),
  logAction: vi.fn(),
  db: {
    course: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    batch: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/actions/audit", () => ({ logAction }));

describe("admin actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns courses for coordinator access", async () => {
    auth.mockResolvedValue({ user: { role: "COORDINATOR" } });
    db.course.findMany.mockResolvedValue([{ id: "course-1" }]);

    const { getCourses } = await import("./admin");

    await expect(getCourses()).resolves.toEqual([{ id: "course-1" }]);
  });

  it("rejects course reads for unauthorized users", async () => {
    auth.mockResolvedValue({ user: { role: "STUDENT" } });

    const { getCourses } = await import("./admin");

    await expect(getCourses()).rejects.toThrow("Unauthorized");
  });

  it("creates a course, logs it, and revalidates", async () => {
    auth.mockResolvedValue({ user: { role: "ADMIN" } });
    db.course.create.mockResolvedValue({ id: "course-1", name: "MERN Stack" });
    const formData = new FormData();
    formData.set("name", "MERN Stack");
    formData.set("code", "MERN-01");
    formData.set("description", "Full stack program");
    formData.set("durationMonths", "12");
    formData.set("status", "ACTIVE");

    const { createCourse } = await import("./admin");

    await expect(createCourse(formData)).resolves.toEqual({ success: true });
    expect(db.course.create).toHaveBeenCalledWith({
      data: {
        name: "MERN Stack",
        code: "MERN-01",
        description: "Full stack program",
        durationMonths: 12,
        status: "ACTIVE",
      },
    });
    expect(logAction).toHaveBeenCalledWith("CREATE", "Course", "course-1", "Admin created course: MERN Stack");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/courses");
  });

  it("returns a duplicate error when course creation violates a unique key", async () => {
    auth.mockResolvedValue({ user: { role: "ADMIN" } });
    db.course.create.mockRejectedValue({ code: "P2002" });
    const formData = new FormData();
    formData.set("name", "MERN Stack");
    formData.set("code", "MERN-01");
    formData.set("durationMonths", "12");

    const { createCourse } = await import("./admin");

    await expect(createCourse(formData)).resolves.toEqual({ error: "Course name or code already exists." });
  });

  it("returns a generic error when course creation fails", async () => {
    auth.mockResolvedValue({ user: { role: "ADMIN" } });
    db.course.create.mockRejectedValue(new Error("db error"));
    const formData = new FormData();
    formData.set("name", "MERN Stack");
    formData.set("code", "MERN-01");
    formData.set("durationMonths", "12");

    const { createCourse } = await import("./admin");

    await expect(createCourse(formData)).resolves.toEqual({ error: "Failed to create course." });
  });

  it("deletes a course and revalidates", async () => {
    auth.mockResolvedValue({ user: { role: "ADMIN" } });
    db.course.delete.mockResolvedValue({ id: "course-1", name: "MERN Stack" });

    const { deleteCourse } = await import("./admin");

    await expect(deleteCourse("course-1")).resolves.toEqual({ success: true });
    expect(logAction).toHaveBeenCalledWith("DELETE", "Course", "course-1", "Admin deleted course: MERN Stack");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/courses");
  });

  it("returns a guard message when course deletion fails", async () => {
    auth.mockResolvedValue({ user: { role: "ADMIN" } });
    db.course.delete.mockRejectedValue(new Error("constraint"));

    const { deleteCourse } = await import("./admin");

    await expect(deleteCourse("course-1")).resolves.toEqual({
      error: "Cannot delete course because it has associated batches or students.",
    });
  });

  it("returns a validation error for malformed course input", async () => {
    auth.mockResolvedValue({ user: { role: "ADMIN" } });
    const formData = new FormData();
    formData.set("name", "A");
    formData.set("code", "C");
    formData.set("durationMonths", "0");

    const { createCourse } = await import("./admin");

    await expect(createCourse(formData)).resolves.toEqual({
      error: "Course name is required",
    });
  });

  it("returns batches for faculty access", async () => {
    auth.mockResolvedValue({ user: { role: "FACULTY" } });
    db.batch.findMany.mockResolvedValue([{ id: "batch-1" }]);

    const { getBatches } = await import("./admin");

    await expect(getBatches()).resolves.toEqual([{ id: "batch-1" }]);
    expect(db.batch.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
      include: {
        course: true,
        _count: {
          select: { students: true },
        },
      },
    });
  });

  it("creates a batch with sensible defaults", async () => {
    auth.mockResolvedValue({ user: { role: "ADMIN" } });
    db.batch.create.mockResolvedValue({ id: "batch-1", name: "Batch A" });

    const { createBatch } = await import("./admin");

    await expect(
      createBatch({ name: "Batch A", courseId: "course-1", startDate: "2026-05-01" })
    ).resolves.toEqual({ success: true });

    expect(db.batch.create).toHaveBeenCalledWith({
      data: {
        name: "Batch A",
        courseId: "course-1",
        capacity: 30,
        startDate: new Date("2026-05-01"),
        endDate: null,
        status: "UPCOMING",
      },
    });
    expect(logAction).toHaveBeenCalledWith("CREATE", "Batch", "batch-1", "Admin created batch: Batch A");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/batches");
  });

  it("rejects batch creation when required fields are missing", async () => {
    auth.mockResolvedValue({ user: { role: "ADMIN" } });

    const { createBatch } = await import("./admin");

    await expect(createBatch({ name: "", courseId: "course-1", startDate: "" })).resolves.toEqual({
      error: "Required fields are missing.",
    });
    expect(db.batch.create).not.toHaveBeenCalled();
  });

  it("returns a duplicate error when batch creation violates a unique key", async () => {
    auth.mockResolvedValue({ user: { role: "ADMIN" } });
    db.batch.create.mockRejectedValue({ code: "P2002" });

    const { createBatch } = await import("./admin");

    await expect(createBatch({ name: "Batch A", courseId: "course-1", startDate: "2026-05-01" })).resolves.toEqual({
      error: "Batch name already exists.",
    });
  });

  it("returns a generic error when batch creation fails", async () => {
    auth.mockResolvedValue({ user: { role: "ADMIN" } });
    db.batch.create.mockRejectedValue(new Error("db error"));

    const { createBatch } = await import("./admin");

    await expect(createBatch({ name: "Batch A", courseId: "course-1", startDate: "2026-05-01" })).resolves.toEqual({
      error: "Failed to create batch.",
    });
  });

  it("returns the expected delete guard message for batch removal failures", async () => {
    auth.mockResolvedValue({ user: { role: "ADMIN" } });
    db.batch.delete.mockRejectedValue(new Error("constraint"));

    const { deleteBatch } = await import("./admin");

    await expect(deleteBatch("batch-1")).resolves.toEqual({
      error: "Cannot delete batch because it has associated students or classes.",
    });
  });

  it("deletes a batch and revalidates", async () => {
    auth.mockResolvedValue({ user: { role: "ADMIN" } });
    db.batch.delete.mockResolvedValue({ id: "batch-1", name: "Batch A" });

    const { deleteBatch } = await import("./admin");

    await expect(deleteBatch("batch-1")).resolves.toEqual({ success: true });
    expect(logAction).toHaveBeenCalledWith("DELETE", "Batch", "batch-1", "Admin deleted batch: Batch A");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/batches");
  });
});
