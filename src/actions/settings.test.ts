import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, revalidatePath, compare, hash, logAction, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  revalidatePath: vi.fn(),
  compare: vi.fn(),
  hash: vi.fn(),
  logAction: vi.fn(),
  db: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    systemSetting: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/actions/audit", () => ({ logAction }));
vi.mock("bcryptjs", () => ({
  default: { compare, hash },
  compare,
  hash,
}));

import {
  getSystemSettings,
  getUserProfile,
  updatePassword,
  updateProfile,
  updateSystemSettings,
} from "./settings";

describe("settings actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.mockResolvedValue({ user: { id: "user-1" } });
  });

  it("returns the signed-in user profile", async () => {
    db.user.findUnique.mockResolvedValue({ id: "user-1", name: "Rahul" });

    await expect(getUserProfile()).resolves.toEqual({ id: "user-1", name: "Rahul" });
    expect(db.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
      include: {
        student: true,
        faculty: true,
      },
    });
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

  it("returns an error when profile updates fail", async () => {
    db.user.update.mockRejectedValue(new Error("db error"));

    await expect(updateProfile({ name: "Rahul" })).resolves.toEqual({
      error: "Failed to update profile.",
    });
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

  it("throws when the user record is missing for a password change", async () => {
    db.user.findUnique.mockResolvedValue(null);

    await expect(updatePassword({ current: "Password123", new: "NewPassword123" })).rejects.toThrow("User not found");
  });

  it("returns an error when password hashing or persistence fails", async () => {
    db.user.findUnique.mockResolvedValue({ id: "user-1", passwordHash: "hash" });
    compare.mockResolvedValue(true);
    hash.mockRejectedValue(new Error("hash error"));

    await expect(updatePassword({ current: "Password123", new: "NewPassword123" })).resolves.toEqual({
      error: "Failed to update password.",
    });
  });

  it("returns system settings with sensible defaults", async () => {
    db.systemSetting.findMany.mockResolvedValue([]);

    await expect(getSystemSettings()).resolves.toEqual({
      instituteName: "Wish2Skill Academy",
      contactEmail: "admin@wish2skill.com",
      academicYear: "2026-2027",
      timezone: "Asia/Kolkata",
      campusLat: 12.9716,
      campusLng: 77.5946,
    });
  });

  it("maps stored system settings values", async () => {
    db.systemSetting.findMany.mockResolvedValue([
      { key: "instituteName", value: "Wish2Skill CampusOS" },
      { key: "campusLat", value: "13.0971499" },
      { key: "campusLng", value: "77.5835994" },
    ]);

    await expect(getSystemSettings()).resolves.toMatchObject({
      instituteName: "Wish2Skill CampusOS",
      campusLat: 13.0971499,
      campusLng: 77.5835994,
    });
  });

  it("updates system settings for admins and logs the change", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });

    await expect(
      updateSystemSettings([
        { key: "instituteName", value: "Wish2Skill CampusOS" },
        { key: "timezone", value: "Asia/Kolkata" },
      ])
    ).resolves.toEqual({ success: true });

    expect(db.systemSetting.upsert).toHaveBeenCalledTimes(2);
    expect(logAction).toHaveBeenCalledWith(
      "UPDATE",
      "SystemSetting",
      "GLOBAL",
      "Admin updated global system settings"
    );
    expect(revalidatePath).toHaveBeenCalledWith("/admin/settings");
  });

  it("returns an error when updating system settings fails", async () => {
    auth.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
    db.systemSetting.upsert.mockRejectedValue(new Error("db error"));

    await expect(updateSystemSettings([{ key: "timezone", value: "Asia/Kolkata" }])).resolves.toEqual({
      error: "Failed to update system settings.",
    });
  });
});
