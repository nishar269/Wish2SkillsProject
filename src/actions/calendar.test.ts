import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  db: {
    classSession: {
      findMany: vi.fn(),
    },
    test: {
      findMany: vi.fn(),
    },
    notification: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));

describe("calendar actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated access", async () => {
    auth.mockResolvedValue(null);

    const { getCalendarEvents } = await import("./calendar");

    await expect(getCalendarEvents()).rejects.toThrow("Unauthorized");
  });

  it("merges classes, exams, and announcements for a student", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.classSession.findMany.mockResolvedValue([
      {
        id: "session-1",
        date: new Date("2026-04-20T09:00:00.000Z"),
        room: "Lab 1",
        subject: { name: "Physics" },
        batch: { name: "BSc A" },
      },
    ]);
    db.test.findMany.mockResolvedValue([
      {
        id: "test-1",
        date: new Date("2026-04-22T10:00:00.000Z"),
        title: "Unit Test",
        subject: { name: "Physics" },
        batch: { name: "BSc A" },
      },
    ]);
    db.notification.findMany.mockResolvedValue([
      {
        id: "note-1",
        title: "Holiday",
        createdAt: new Date("2026-04-18T08:00:00.000Z"),
      },
    ]);

    const { getCalendarEvents } = await import("./calendar");

    await expect(getCalendarEvents()).resolves.toEqual([
      {
        id: "session-1",
        title: "Class: Physics",
        date: new Date("2026-04-20T09:00:00.000Z"),
        type: "SESSION",
        batch: "BSc A",
        location: "Lab 1",
      },
      {
        id: "test-1",
        title: "Exam: Unit Test",
        date: new Date("2026-04-22T10:00:00.000Z"),
        type: "EXAM",
        batch: "BSc A",
      },
      {
        id: "note-1",
        title: "Announcement: Holiday",
        date: new Date("2026-04-18T08:00:00.000Z"),
        type: "ANNOUNCEMENT",
        location: "CampusOS",
      },
    ]);

    expect(db.classSession.findMany).toHaveBeenCalledWith({
      include: { subject: true, batch: true },
      where: { batch: { students: { some: { userId: "student-user" } } } },
    });
    expect(db.test.findMany).toHaveBeenCalledWith({
      include: { subject: true, batch: true },
      where: { batch: { students: { some: { userId: "student-user" } } } },
    });
    expect(db.notification.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { targetRole: "STUDENT" },
          { targetRole: null, targetBatchId: null },
        ],
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    });
  });
});
