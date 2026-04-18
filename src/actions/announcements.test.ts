import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, revalidatePath, sendNotificationEmail, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  revalidatePath: vi.fn(),
  sendNotificationEmail: vi.fn(),
  db: {
    notification: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/lib/mail", () => ({ sendNotificationEmail }));

describe("announcements actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXTAUTH_URL = "https://campus.example.com";
  });

  it("loads public announcements with creator details", async () => {
    const announcements = [{ id: "note-1", title: "Welcome" }];
    db.notification.findMany.mockResolvedValue(announcements);

    const { getAnnouncements } = await import("./announcements");

    await expect(getAnnouncements()).resolves.toEqual(announcements);
    expect(db.notification.findMany).toHaveBeenCalledWith({
      where: {
        targetBatchId: null,
        targetRole: null,
      },
      orderBy: { createdAt: "desc" },
      include: { creator: { select: { name: true } } },
    });
  });

  it("creates an announcement and fans out email notifications", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.user.findMany.mockResolvedValue([
      { email: "student@example.com" },
      { email: "faculty@example.com" },
    ]);

    const { createAnnouncement } = await import("./announcements");

    await expect(
      createAnnouncement({
        title: "Exam Notice",
        content: "Midterms start next Monday.",
        type: "URGENT",
      })
    ).resolves.toEqual({ success: true });

    expect(db.notification.create).toHaveBeenCalledWith({
      data: {
        title: "Exam Notice",
        message: "Midterms start next Monday.",
        type: "URGENT",
        createdBy: "admin-1",
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/announcements");
    expect(revalidatePath).toHaveBeenCalledWith("/student/notifications");
    expect(revalidatePath).toHaveBeenCalledWith("/student");
    expect(sendNotificationEmail).toHaveBeenCalledTimes(2);
    expect(sendNotificationEmail).toHaveBeenCalledWith(
      "student@example.com",
      "New Announcement: Exam Notice",
      "Platform Announcement",
      "Midterms start next Monday.",
      "View Dashboard",
      "https://campus.example.com/dashboard"
    );
  });

  it("rejects announcement creation for non-admin users", async () => {
    auth.mockResolvedValue({ user: { id: "student-1", role: "STUDENT" } });

    const { createAnnouncement } = await import("./announcements");

    await expect(
      createAnnouncement({ title: "Hi", content: "Nope", type: "GENERAL" })
    ).rejects.toThrow("Unauthorized");
  });

  it("maps GENERAL and ACADEMIC tones to notification types", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.user.findMany.mockResolvedValue([]);

    const { createAnnouncement } = await import("./announcements");

    await expect(createAnnouncement({ title: "General", content: "FYI", type: "GENERAL" })).resolves.toEqual({
      success: true,
    });
    expect(db.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ type: "INFO" }),
      })
    );

    await expect(createAnnouncement({ title: "Academic", content: "Good news", type: "ACADEMIC" })).resolves.toEqual({
      success: true,
    });
    expect(db.notification.create).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ type: "SUCCESS" }),
      })
    );
  });

  it("returns an error when announcement creation fails", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.notification.create.mockRejectedValue(new Error("db error"));

    const { createAnnouncement } = await import("./announcements");

    await expect(
      createAnnouncement({ title: "Exam Notice", content: "Midterms start soon.", type: "URGENT" })
    ).resolves.toEqual({ error: "Failed to post announcement." });
    expect(sendNotificationEmail).not.toHaveBeenCalled();
  });

  it("deletes announcements and revalidates dashboards", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });

    const { deleteAnnouncement } = await import("./announcements");

    await expect(deleteAnnouncement("note-1")).resolves.toEqual({ success: true });
    expect(db.notification.delete).toHaveBeenCalledWith({ where: { id: "note-1" } });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/announcements");
    expect(revalidatePath).toHaveBeenCalledWith("/student/notifications");
    expect(revalidatePath).toHaveBeenCalledWith("/student");
  });

  it("returns an error when announcement deletion fails", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.notification.delete.mockRejectedValue(new Error("db error"));

    const { deleteAnnouncement } = await import("./announcements");

    await expect(deleteAnnouncement("note-1")).resolves.toEqual({ error: "Failed to delete announcement." });
  });
});
