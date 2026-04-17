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
  });
});
