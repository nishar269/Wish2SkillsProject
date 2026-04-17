import { beforeEach, describe, expect, it, vi } from "vitest";

const { db } = vi.hoisted(() => ({
  db: {
    student: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/db", () => ({ db }));

import { getPublicPortfolio } from "./portfolio";

describe("portfolio actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when the student portfolio is missing", async () => {
    db.student.findUnique.mockResolvedValue(null);
    await expect(getPublicPortfolio("missing")).resolves.toBeNull();
  });

  it("computes average performance from test results", async () => {
    db.student.findUnique.mockResolvedValue({
      id: "student-1",
      user: { name: "Rahul", email: "rahul@example.com", avatarUrl: null },
      course: { name: "JFS" },
      batch: { name: "B1" },
      results: [
        { marksObtained: 80, test: { totalMarks: 100 } },
        { marksObtained: 40, test: { totalMarks: 50 } },
      ],
      applications: [],
    });

    await expect(getPublicPortfolio("student-1")).resolves.toEqual(
      expect.objectContaining({ avgPerformance: 80 })
    );
  });
});
