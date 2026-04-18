import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  db: {
    user: { findMany: vi.fn() },
    directMessage: {
      groupBy: vi.fn(),
      updateMany: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));

describe("chat actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns contacts with unread counts", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });
    db.user.findMany.mockResolvedValue([
      { id: "user-2", name: "Asha", role: "STUDENT", avatarUrl: null },
      { id: "user-3", name: "Rahul", role: "FACULTY", avatarUrl: null },
    ]);
    db.directMessage.groupBy.mockResolvedValue([
      { senderId: "user-2", _count: { id: 3 } },
    ]);

    const { getChatContacts } = await import("./chat");

    await expect(getChatContacts()).resolves.toEqual([
      { id: "user-2", name: "Asha", role: "STUDENT", avatarUrl: null, unreadCount: 3 },
      { id: "user-3", name: "Rahul", role: "FACULTY", avatarUrl: null, unreadCount: 0 },
    ]);
  });

  it("marks messages as read and returns the conversation", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });
    db.directMessage.findMany.mockResolvedValue([{ id: "msg-1" }]);

    const { getChatMessages } = await import("./chat");

    await expect(getChatMessages("user-2")).resolves.toEqual([{ id: "msg-1" }]);
    expect(db.directMessage.updateMany).toHaveBeenCalledWith({
      where: { senderId: "user-2", receiverId: "user-1", readStatus: false },
      data: { readStatus: true },
    });
  });

  it("trims and creates a chat message", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });
    db.directMessage.create.mockResolvedValue({ id: "msg-1" });

    const { sendChatMessage } = await import("./chat");

    await expect(sendChatMessage("user-2", "  hello there  ")).resolves.toEqual({ id: "msg-1" });
    expect(db.directMessage.create).toHaveBeenCalledWith({
      data: {
        content: "hello there",
        senderId: "user-1",
        receiverId: "user-2",
        readStatus: false,
      },
    });
  });

  it("rejects empty messages", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });

    const { sendChatMessage } = await import("./chat");

    await expect(sendChatMessage("user-2", "   ")).rejects.toThrow("Empty message");
  });
});
