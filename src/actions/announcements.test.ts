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
});
