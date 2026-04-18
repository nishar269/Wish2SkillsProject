import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  db: {
    student: {
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    faculty: {
      count: vi.fn(),
    },
    course: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    batch: {
      count: vi.fn(),
    },
    result: {
      findMany: vi.fn(),
      aggregate: vi.fn(),
    },
    attendance: {
      count: vi.fn(),
    },
    forumPost: {
      count: vi.fn(),
    },
    forumComment: {
      count: vi.fn(),
    },
    feeRecord: {
      aggregate: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));

import { getAdminReportData, getInstitutionalKPIs } from "./reports";

describe("reports actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized report data for non-admin access", async () => {
    auth.mockResolvedValue({ user: { role: "STUDENT" } });
    await expect(getAdminReportData()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("builds admin report data for admins", async () => {
    auth.mockResolvedValue({ user: { role: "ADMIN" } });
    db.student.count.mockResolvedValue(10);
    db.faculty.count.mockResolvedValue(2);
    db.course.count.mockResolvedValue(3);
    db.batch.count.mockResolvedValue(4);
    db.result.findMany.mockResolvedValue([{ id: "result-1" }]);
    db.student.groupBy.mockResolvedValue([{ courseId: "course-1", _count: { _all: 7 } }]);
    db.course.findMany.mockResolvedValue([{ id: "course-1", name: "Java Full Stack" }]);

    await expect(getAdminReportData()).resolves.toEqual(
      expect.objectContaining({
        summary: {
          students: 10,
          faculty: 2,
          courses: 3,
          batches: 4,
        },
        enrollmentByCourse: [{ name: "Java Full Stack", count: 7 }],
      })
    );
  });

  it("builds institutional KPIs for authority roles", async () => {
    auth.mockResolvedValue({ user: { role: "AUTHORITY" } });
    db.attendance.count.mockResolvedValueOnce(20).mockResolvedValueOnce(15);
    db.result.aggregate.mockResolvedValue({ _avg: { marksObtained: 80 } });
    db.forumPost.count.mockResolvedValue(12);
    db.forumComment.count.mockResolvedValue(10);
    db.feeRecord.aggregate
      .mockResolvedValueOnce({ _sum: { amount: 1000 } })
      .mockResolvedValueOnce({ _sum: { amount: 900 } });

    await expect(getInstitutionalKPIs()).resolves.toEqual({
      institutionalScore: 78,
      attendanceRate: 75,
      healthLabel: "Good",
      totalEngagement: 22,
      collectionEfficiency: 90,
    });
  });

  it("throws for unauthorized users in getInstitutionalKPIs", async () => {
    auth.mockResolvedValue(null);
    await expect(getInstitutionalKPIs()).rejects.toThrow("Unauthorized");
    
    auth.mockResolvedValue({ user: { role: "STUDENT" } });
    await expect(getInstitutionalKPIs()).rejects.toThrow("Unauthorized");
  });

  it("uses fallbacks for KPIs when data is zero", async () => {
    auth.mockResolvedValue({ user: { role: "ADMIN" } });
    db.attendance.count.mockResolvedValue(0);
    db.result.aggregate.mockResolvedValue({ _avg: { marksObtained: null } });
    db.forumPost.count.mockResolvedValue(0);
    db.forumComment.count.mockResolvedValue(0);
    db.feeRecord.aggregate.mockResolvedValue({ _sum: { amount: null } });

    const res = await getInstitutionalKPIs();
    expect(res).toMatchObject({
        attendanceRate: 85,
        institutionalScore: 78,
        healthLabel: "Growing",
        collectionEfficiency: 98
    });
  });

  it("returns unauthorized for getAdminReportData when no session", async () => {
      auth.mockResolvedValue(null);
      await expect(getAdminReportData()).resolves.toEqual({ error: "Unauthorized" });
  });
});
