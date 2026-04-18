import { expect, test } from "@playwright/test";

const roles = [
  {
    name: "admin",
    email: "admin@wish2skill.com",
    password: "Password123",
    routes: ["/admin", "/admin/announcements", "/admin/schedule"],
  },
  {
    name: "faculty",
    email: "faculty@wish2skill.com",
    password: "Password123",
    routes: ["/faculty", "/faculty/classes", "/faculty/assignments"],
  },
  {
    name: "student",
    email: "student@wish2skill.com",
    password: "Password123",
    routes: ["/student", "/student/attendance", "/student/assignments"],
  },
  {
    name: "coordinator",
    email: "coord@wish2skill.com",
    password: "Password123",
    routes: ["/coordinator", "/coordinator/batches", "/coordinator/attendance", "/coordinator/schedule"],
  },
  {
    name: "authority",
    email: "authority@wish2skill.com",
    password: "Password123",
    routes: ["/authority", "/authority/analytics", "/authority/feedback", "/authority/overview"],
  },
  {
    name: "records",
    email: "records@wish2skill.com",
    password: "Password123",
    routes: ["/records", "/records/export", "/records/reports", "/records/archives"],
  },
];

for (const role of roles) {
  test(`${role.name} smoke flow`, async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email Address").fill(role.email);
    await page.getByLabel("Password").fill(role.password);
    await page.getByRole("button", { name: /enter dashboard/i }).click();

    await page.waitForURL((url) => !url.pathname.includes("/login"));

    for (const route of role.routes) {
      const response = await page.goto(route);
      expect(response?.ok()).toBeTruthy();
      await expect(page).not.toHaveURL(/\/login/);
    }
  });
}
