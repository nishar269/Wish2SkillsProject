import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, revalidatePath, compare, hash, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  revalidatePath: vi.fn(),
  compare: vi.fn(),
  hash: vi.fn(),
  db: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("bcryptjs", () => ({
  default: { compare, hash },
  compare,
  hash,
}));

import { updatePassword, updateProfile } from "./settings";

describe("settings actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.mockResolvedValue({ user: { id: "user-1" } });
  });

  it("updates profile and revalidates settings", async () => {
    db.user.update.mockResolvedValue({ id: "user-1" });

    await expect(updateProfile({ name: "Rahul", phone: "+911234567890" })).resolves.toEqual({ success: true });
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { name: "Rahul", phone: "+911234567890" },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/settings");
  });

  it("returns a validation error when current password is wrong", async () => {
    db.user.findUnique.mockResolvedValue({ id: "user-1", passwordHash: "hash" });
    compare.mockResolvedValue(false);

    await expect(updatePassword({ current: "bad-pass", new: "NewPassword123" })).resolves.toEqual({
      error: "Current password is incorrect.",
    });
    expect(db.user.update).not.toHaveBeenCalled();
  });

  it("updates password when current password is valid", async () => {
    db.user.findUnique.mockResolvedValue({ id: "user-1", passwordHash: "hash" });
    compare.mockResolvedValue(true);
    hash.mockResolvedValue("new-hash");
    db.user.update.mockResolvedValue({ id: "user-1" });

    await expect(updatePassword({ current: "Password123", new: "NewPassword123" })).resolves.toEqual({
      success: true,
    });
    expect(hash).toHaveBeenCalledWith("NewPassword123", 12);
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { passwordHash: "new-hash" },
    });
  });
});
