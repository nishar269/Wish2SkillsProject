import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, revalidatePath, sendNotificationEmail, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  revalidatePath: vi.fn(),
  sendNotificationEmail: vi.fn(),
  db: {
    classSession: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    batch: {
      findUnique: vi.fn(),
    },
    subject: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/lib/mail", () => ({ sendNotificationEmail }));

describe("schedule admin actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXTAUTH_URL = "https://campus.example.com";
    sendNotificationEmail.mockResolvedValue({ success: true });
  });

  it("returns class sessions for authenticated users", async () => {
    const sessions = [{ id: "session-1" }];
    auth.mockResolvedValue({ user: { id: "coord-1", role: "COORDINATOR" } });
    db.classSession.findMany.mockResolvedValue(sessions);

    const { getClassSessions } = await import("./schedule-admin");

    await expect(getClassSessions("batch-1")).resolves.toEqual(sessions);
    expect(db.classSession.findMany).toHaveBeenCalledWith({
      where: { batchId: "batch-1" },
      orderBy: { date: "asc" },
      include: {
        batch: true,
        subject: true,
        faculty: {
          include: { user: true },
        },
      },
    });
  });

  it("schedules a class session and sends notifications", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.batch.findUnique.mockResolvedValue({
      students: [
        { user: { email: "student1@example.com" } },
        { user: { email: "student2@example.com" } },
      ],
      course: { name: "BSc" },
    });
    db.subject.findUnique.mockResolvedValue({ id: "subject-1", name: "Physics" });

    const { createClassSession } = await import("./schedule-admin");

    await expect(
      createClassSession({
        batchId: "batch-1",
        subjectId: "subject-1",
        facultyId: "faculty-1",
        date: "2026-05-15",
        startTime: "09:00",
        endTime: "10:00",
        room: "Lab 2",
        topic: "Motion",
      })
    ).resolves.toEqual({ success: true });

    expect(db.classSession.create).toHaveBeenCalledWith({
      data: {
        batchId: "batch-1",
        subjectId: "subject-1",
        facultyId: "faculty-1",
        date: new Date("2026-05-15"),
        startTime: new Date("2026-05-15T09:00"),
        endTime: new Date("2026-05-15T10:00"),
        room: "Lab 2",
        meetLink: undefined,
        topic: "Motion",
        status: "SCHEDULED",
      },
    });
    expect(sendNotificationEmail).toHaveBeenCalledTimes(2);
    expect(revalidatePath).toHaveBeenCalledWith("/admin/schedule");
    expect(revalidatePath).toHaveBeenCalledWith("/coordinator/schedule");
  });

  it("deletes scheduled classes for authorized roles", async () => {
    auth.mockResolvedValue({ user: { id: "coord-1", role: "COORDINATOR" } });
    db.classSession.findUnique.mockResolvedValue({
      id: "session-1",
      date: new Date("2026-05-15"),
      startTime: new Date("2026-05-15T09:00"),
      endTime: new Date("2026-05-15T10:00"),
      topic: "Motion",
      batch: {
        students: [
          { user: { email: "student1@example.com" } },
          { user: { email: "student2@example.com" } },
        ],
      },
      subject: { name: "Physics" },
    });

    const { deleteClassSession } = await import("./schedule-admin");

    await expect(deleteClassSession("session-1")).resolves.toEqual({ success: true });
    expect(db.classSession.findUnique).toHaveBeenCalledWith({
      where: { id: "session-1" },
      include: {
        batch: {
          include: {
            students: {
              include: { user: { select: { email: true } } },
            },
          },
        },
        subject: true,
      },
    });
    expect(db.classSession.delete).toHaveBeenCalledWith({ where: { id: "session-1" } });
    expect(sendNotificationEmail).toHaveBeenCalledTimes(2);
  });

  it("updates scheduled classes and notifies the new batch", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.classSession.findUnique.mockResolvedValue({
      id: "session-1",
      batch: {
        id: "batch-1",
        students: [{ user: { email: "oldstudent@example.com" } }],
      },
      subject: { name: "Physics" },
      date: new Date("2026-05-15"),
      startTime: new Date("2026-05-15T09:00"),
      endTime: new Date("2026-05-15T10:00"),
      topic: "Motion",
    });
    db.batch.findUnique.mockResolvedValue({
      id: "batch-2",
      students: [
        { user: { email: "student1@example.com" } },
        { user: { email: "student2@example.com" } },
      ],
    });
    db.subject.findUnique.mockResolvedValue({ id: "subject-2", name: "Chemistry" });

    const { updateClassSession } = await import("./schedule-admin");

    await expect(
      updateClassSession("session-1", {
        batchId: "batch-2",
        subjectId: "subject-2",
        facultyId: "faculty-2",
        date: "2026-05-16",
        startTime: "11:00",
        endTime: "12:00",
        room: "Lab 5",
        topic: "Atoms",
      })
    ).resolves.toEqual({ success: true });

    expect(db.classSession.update).toHaveBeenCalledWith({
      where: { id: "session-1" },
      data: {
        batchId: "batch-2",
        subjectId: "subject-2",
        facultyId: "faculty-2",
        date: new Date("2026-05-16"),
        startTime: new Date("2026-05-16T11:00"),
        endTime: new Date("2026-05-16T12:00"),
        room: "Lab 5",
        meetLink: undefined,
        topic: "Atoms",
      },
    });
    expect(sendNotificationEmail).toHaveBeenCalledTimes(3);
    expect(revalidatePath).toHaveBeenCalledWith("/admin/schedule");
    expect(revalidatePath).toHaveBeenCalledWith("/coordinator/schedule");
  });
});
