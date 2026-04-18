import { describe, expect, it, vi, beforeEach } from "vitest";

// Hoist Prisma mocking before imports
const mockDb = vi.hoisted(() => ({
  student: { findUnique: vi.fn(), count: vi.fn() },
  faculty: { findUnique: vi.fn(), count: vi.fn() },
  course: { count: vi.fn() },
  batch: { findMany: vi.fn() },
  classSession: { count: vi.fn() },
  auditLog: { findMany: vi.fn() }
}));

vi.mock("@/lib/db", () => ({
  db: mockDb
}));

// Hoist authentication mocking before imports
const mockAuth = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({
  auth: mockAuth
}));

import { 
  getStudentDashboardData, 
  getFacultyDashboardData,
  getAuthorityDashboardData, 
  getCoordinatorDashboardData 
} from "./dashboard";

describe("Dashboard Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getStudentDashboardData", () => {
    it("throws unauthorized if not logged in", async () => {
      mockAuth.mockResolvedValue(null);
      await expect(getStudentDashboardData()).rejects.toThrow("Unauthorized");
    });

    it("throws unauthorized if role is not STUDENT", async () => {
      mockAuth.mockResolvedValue({ user: { id: "1", role: "FACULTY" } });
      await expect(getStudentDashboardData()).rejects.toThrow("Unauthorized");
    });

    it("throws when the student profile is missing", async () => {
      mockAuth.mockResolvedValue({ user: { id: "1", role: "STUDENT" } });
      mockDb.student.findUnique.mockResolvedValue(null);

      await expect(getStudentDashboardData()).rejects.toThrow("Student profile not found");
    });

    it("returns student dashboard data with computed gamification", async () => {
      mockAuth.mockResolvedValue({ user: { id: "1", role: "STUDENT" } });
      const attendances = Array.from({ length: 11 }, () => ({ status: "PRESENT" }));
      mockDb.student.findUnique.mockResolvedValue({
        id: "student-1",
        attendances,
        results: [],
        batch: {
          classSessions: [{ id: "session-1" }],
          notifications: [{ id: "note-1" }],
        },
      });

      const result = await getStudentDashboardData();

      expect(result.attendancePercentage).toBe(100);
      expect(result.latestResult).toBeNull();
      expect(result.upcomingClasses).toEqual([{ id: "session-1" }]);
      expect(result.notifications).toEqual([{ id: "note-1" }]);
      expect(result.gamification).toMatchObject({
        xp: 550,
        streak: 3,
      });
      expect(result.gamification.badges.map((b: { name: string }) => b.name)).toEqual(
        expect.arrayContaining(["First Login", "Scholar", "Iron Will"])
      );
      expect(result.gamification.progress).toBeGreaterThanOrEqual(0);
      expect(result.gamification.progress).toBeLessThanOrEqual(100);
    });

    it("returns 0% attendance when there are no classes", async () => {
      mockAuth.mockResolvedValue({ user: { id: "1", role: "STUDENT" } });
      mockDb.student.findUnique.mockResolvedValue({
        id: "student-1",
        attendances: [],
        results: [],
        batch: { classSessions: [], notifications: [] },
      });

      const result = await getStudentDashboardData();

      expect(result.attendancePercentage).toBe(0);
      expect(result.gamification).toMatchObject({ xp: 0, level: 1, streak: 0 });
    });
  });

  describe("getFacultyDashboardData", () => {
    it("throws unauthorized if not logged in", async () => {
      mockAuth.mockResolvedValue(null);
      await expect(getFacultyDashboardData()).rejects.toThrow("Unauthorized");
    });

    it("throws unauthorized if role is not FACULTY", async () => {
      mockAuth.mockResolvedValue({ user: { id: "1", role: "STUDENT" } });
      await expect(getFacultyDashboardData()).rejects.toThrow("Unauthorized");
    });

    it("throws when the faculty profile is missing", async () => {
      mockAuth.mockResolvedValue({ user: { id: "1", role: "FACULTY" } });
      mockDb.faculty.findUnique.mockResolvedValue(null);

      await expect(getFacultyDashboardData()).rejects.toThrow("Faculty profile not found");
    });

    it("returns faculty dashboard aggregates", async () => {
      mockAuth.mockResolvedValue({ user: { id: "1", role: "FACULTY" } });
      mockDb.faculty.findUnique.mockResolvedValue({
        classSessions: [{ id: "session-1" }],
        uploadedMaterials: [{ id: "m1" }, { id: "m2" }],
        facultyAssignments: [{ id: "fa1" }],
        createdAssignments: [{ id: "a1" }, { id: "a2" }, { id: "a3" }],
      });

      await expect(getFacultyDashboardData()).resolves.toEqual({
        upcomingClasses: [{ id: "session-1" }],
        totalMaterials: 2,
        activeAssignments: 3,
        loadCount: 1,
      });
    });
  });

  describe("getAuthorityDashboardData", () => {
    it("returns counts and logs for ADMIN", async () => {
      mockAuth.mockResolvedValue({ user: { id: "1", role: "ADMIN" } });
      mockDb.student.count.mockResolvedValue(1500);
      mockDb.faculty.count.mockResolvedValue(80);
      mockDb.course.count.mockResolvedValue(10);
      mockDb.auditLog.findMany.mockResolvedValue([]);

      const result = await getAuthorityDashboardData();
      expect(result).toEqual({
        studentCount: 1500,
        facultyCount: 80,
        courseCount: 10,
        recentLogs: []
      });
    });

    it("throws unauthorized for STUDENT", async () => {
      mockAuth.mockResolvedValue({ user: { id: "1", role: "STUDENT" } });
      await expect(getAuthorityDashboardData()).rejects.toThrow("Unauthorized");
    });

    it("returns counts and logs for COORDINATOR", async () => {
      mockAuth.mockResolvedValue({ user: { id: "1", role: "COORDINATOR" } });
      mockDb.student.count.mockResolvedValue(1500);
      mockDb.faculty.count.mockResolvedValue(80);
      mockDb.course.count.mockResolvedValue(10);
      mockDb.auditLog.findMany.mockResolvedValue([]);

      await expect(getAuthorityDashboardData()).resolves.toEqual({
        studentCount: 1500,
        facultyCount: 80,
        courseCount: 10,
        recentLogs: [],
      });
    });

    it("rethrows when the database fetch fails", async () => {
      mockAuth.mockResolvedValue({ user: { id: "1", role: "ADMIN" } });
      mockDb.student.count.mockRejectedValue(new Error("db error"));

      await expect(getAuthorityDashboardData()).rejects.toThrow("db error");
    });
  });

  describe("getCoordinatorDashboardData", () => {
    it("returns active batch analytics for COORDINATOR", async () => {
      mockAuth.mockResolvedValue({ user: { id: "1", role: "COORDINATOR" } });
      mockDb.batch.findMany.mockResolvedValue([
        { id: "b1", status: "ACTIVE", course: { code: "CS101" }, _count: { students: 30 } }
      ]);
      mockDb.classSession.count.mockResolvedValue(5);
      mockDb.student.count.mockResolvedValue(300);

      const result = await getCoordinatorDashboardData();
      expect(result).toEqual({
        activeBatches: 1,
        classesToday: 5,
        totalStudents: 300,
        batchesList: [
          { id: "b1", status: "ACTIVE", course: { code: "CS101" }, _count: { students: 30 } }
        ]
      });
    });

    it("throws unauthorized for FACULTY", async () => {
      mockAuth.mockResolvedValue({ user: { id: "1", role: "FACULTY" } });
      await expect(getCoordinatorDashboardData()).rejects.toThrow("Unauthorized");
    });

    it("throws a friendly error when dashboard fetch fails", async () => {
      mockAuth.mockResolvedValue({ user: { id: "1", role: "COORDINATOR" } });
      mockDb.batch.findMany.mockRejectedValue(new Error("db error"));

      await expect(getCoordinatorDashboardData()).rejects.toThrow("Failed to fetch dashboard data");
    });
  });
});
