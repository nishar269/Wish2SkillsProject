import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, revalidatePath, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  revalidatePath: vi.fn(),
  db: {
    faculty: {
      findUnique: vi.fn(),
    },
    student: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    classSession: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    attendance: {
      upsert: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    batch: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("next/cache", () => ({ revalidatePath }));

import {
  getCoordinatorAttendanceOverview,
  getFacultySessions,
  getSessionStudents,
  getStudentAttendance,
  markAttendanceBulk,
  selfMarkAttendance,
} from "./attendance";

describe("attendance actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns faculty sessions for the signed-in faculty member", async () => {
    auth.mockResolvedValue({ user: { id: "faculty-user", role: "FACULTY" } });
    db.faculty.findUnique.mockResolvedValue({ id: "faculty-1" });
    db.classSession.findMany.mockResolvedValue([{ id: "session-1" }]);

    await expect(getFacultySessions()).resolves.toEqual([{ id: "session-1" }]);
    expect(db.classSession.findMany).toHaveBeenCalledWith({
      where: { facultyId: "faculty-1" },
      orderBy: { date: "desc" },
      include: {
        batch: true,
        subject: true,
      },
    });
  });

  it("returns students for a specific session", async () => {
    auth.mockResolvedValue({ user: { id: "admin-user", role: "ADMIN" } });
    db.classSession.findUnique.mockResolvedValue({ batchId: "batch-1" });
    db.student.findMany.mockResolvedValue([{ id: "student-1" }]);

    await expect(getSessionStudents("session-1")).resolves.toEqual([{ id: "student-1" }]);
    expect(db.student.findMany).toHaveBeenCalledWith({
      where: { batchId: "batch-1" },
      include: {
        user: true,
        attendances: {
          where: { sessionId: "session-1" },
        },
      },
    });
  });

  it("marks attendance in bulk for faculty", async () => {
    auth.mockResolvedValue({ user: { id: "faculty-user", role: "FACULTY" } });
    db.attendance.upsert.mockResolvedValue({});
    db.$transaction.mockResolvedValue([]);

    const records = [
      { studentId: "stu-1", status: "PRESENT" as const },
      { studentId: "stu-2", status: "ABSENT" as const },
    ];

    await expect(markAttendanceBulk("session-1", records)).resolves.toEqual({ success: true });
    expect(db.attendance.upsert).toHaveBeenCalledTimes(2);
    expect(db.$transaction).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith("/faculty/attendance/session-1");
  });

  it("returns an error when bulk attendance save fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    auth.mockResolvedValue({ user: { id: "faculty-user", role: "FACULTY" } });
    db.$transaction.mockRejectedValue(new Error("db error"));

    await expect(
      markAttendanceBulk("session-1", [{ studentId: "stu-1", status: "PRESENT" }])
    ).resolves.toEqual({
      error: "Failed to save attendance records.",
    });
    expect(errorSpy).toHaveBeenCalled();
  });

  it("returns student attendance history", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue({ id: "student-1" });
    db.attendance.findMany.mockResolvedValue([{ id: "attendance-1" }]);

    await expect(getStudentAttendance()).resolves.toEqual([{ id: "attendance-1" }]);
    expect(db.attendance.findMany).toHaveBeenCalledWith({
      where: { studentId: "student-1" },
      include: {
        session: {
          include: {
            subject: true,
            faculty: { include: { user: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  });

  it("marks self attendance when session is valid and student is on campus", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue({ id: "student-1", batchId: "batch-1" });
    db.classSession.findUnique.mockResolvedValue({ id: "session-1", batchId: "batch-1", date: new Date() });
    db.attendance.upsert.mockResolvedValue({});

    await expect(
      selfMarkAttendance("session-1", { lat: 13.0971499, lng: 77.5835994 })
    ).resolves.toEqual({ success: true });
    expect(db.attendance.upsert).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith("/student/attendance");
  });

  it("rejects self attendance when geolocation is missing", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue({ id: "student-1", batchId: "batch-1" });
    db.classSession.findUnique.mockResolvedValue({ id: "session-1", batchId: "batch-1", date: new Date() });

    await expect(selfMarkAttendance("session-1")).resolves.toEqual({
      error: "Geolocation access is required to verify your presence.",
    });
    expect(db.attendance.upsert).not.toHaveBeenCalled();
  });

  it("rejects self attendance for sessions outside the student's batch", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue({ id: "student-1", batchId: "batch-1" });
    db.classSession.findUnique.mockResolvedValue({ id: "session-1", batchId: "batch-2", date: new Date() });

    await expect(
      selfMarkAttendance("session-1", { lat: 13.0971499, lng: 77.5835994 })
    ).resolves.toEqual({
      error: "Invalid session for your batch.",
    });
  });

  it("rejects self attendance on the wrong day", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue({ id: "student-1", batchId: "batch-1" });
    db.classSession.findUnique.mockResolvedValue({
      id: "session-1",
      batchId: "batch-1",
      date: new Date("2026-01-01T10:00:00Z"),
    });

    await expect(
      selfMarkAttendance("session-1", { lat: 13.0971499, lng: 77.5835994 })
    ).resolves.toEqual({
      error: "You can only mark attendance on the scheduled day.",
    });
  });

  it("rejects self attendance when the student is outside the campus radius", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue({ id: "student-1", batchId: "batch-1" });
    db.classSession.findUnique.mockResolvedValue({ id: "session-1", batchId: "batch-1", date: new Date() });

    await expect(
      selfMarkAttendance("session-1", { lat: 13.2, lng: 77.7 })
    ).resolves.toEqual({
      error: expect.stringContaining("You are too far from the campus"),
    });
  });

  it("returns an error when student attendance persistence fails", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue({ id: "student-1", batchId: "batch-1" });
    db.classSession.findUnique.mockResolvedValue({ id: "session-1", batchId: "batch-1", date: new Date() });
    db.attendance.upsert.mockRejectedValue(new Error("db error"));

    await expect(
      selfMarkAttendance("session-1", { lat: 13.0971499, lng: 77.5835994 })
    ).resolves.toEqual({
      error: "Failed to mark attendance.",
    });
  });

  it("returns the coordinator attendance overview", async () => {
    auth.mockResolvedValue({ user: { id: "coordinator-user", role: "COORDINATOR" } });
    db.classSession.findMany.mockResolvedValue([{ id: "session-1" }]);
    db.batch.findMany.mockResolvedValue([{ id: "batch-1" }]);
    db.attendance.count
      .mockResolvedValueOnce(12)
      .mockResolvedValueOnce(9);

    await expect(getCoordinatorAttendanceOverview()).resolves.toEqual({
      sessionsToday: [{ id: "session-1" }],
      activeBatches: [{ id: "batch-1" }],
      attendanceMarkedToday: 12,
      presentMarkedToday: 9,
    });
  });
});
