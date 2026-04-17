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
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("next/cache", () => ({ revalidatePath }));

import { markAttendanceBulk, selfMarkAttendance } from "./attendance";

describe("attendance actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
