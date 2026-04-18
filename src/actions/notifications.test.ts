import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, revalidatePath, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  revalidatePath: vi.fn(),
  db: {
    student: {
      findUnique: vi.fn(),
    },
    notification: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("next/cache", () => ({ revalidatePath }));

import { getStudentNotifications, markAsRead } from "./notifications";

describe("notifications actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads notifications for the current student", async () => {
    auth.mockResolvedValue({ user: { id: "student-user", role: "STUDENT" } });
    db.student.findUnique.mockResolvedValue({ id: "student-1", batchId: "batch-1" });
    db.notification.findMany.mockResolvedValue([{ id: "note-1" }]);
    await expect(getStudentNotifications()).resolves.toEqual([{ id: "note-1" }]);
  });

  it("throws for unauthorized roles in getStudentNotifications", async () => {
      auth.mockResolvedValue({ user: { role: "FACULTY" } });
      await expect(getStudentNotifications()).rejects.toThrow("Unauthorized");
  });

  it("throws when student profile is missing in getStudentNotifications", async () => {
      auth.mockResolvedValue({ user: { id: "u1", role: "STUDENT" } });
      db.student.findUnique.mockResolvedValue(null);
      await expect(getStudentNotifications()).rejects.toThrow("Student not found");
  });

  it("marks a notification as read and revalidates", async () => {
    auth.mockResolvedValue({ user: { id: "student-user" } });
    db.notification.update.mockResolvedValue({ id: "note-1" });

    await expect(markAsRead("note-1")).resolves.toEqual({ success: true });
    expect(revalidatePath).toHaveBeenCalledWith("/student/notifications");
  });

  it("returns early from markAsRead if no session", async () => {
      auth.mockResolvedValue(null);
      await expect(markAsRead("note-1")).resolves.toBeUndefined();
  });

  it("returns error from markAsRead if update fails", async () => {
      auth.mockResolvedValue({ user: { id: "u1" } });
      db.notification.update.mockRejectedValue(new Error("Update failed"));
      await expect(markAsRead("note-1")).resolves.toEqual({ error: "Failed to mark as read." });
  });
});
