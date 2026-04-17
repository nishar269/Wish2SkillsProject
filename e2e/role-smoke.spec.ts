import { expect, test } from "@playwright/test";

const roles = [
  { name: "admin", email: "admin@wish2skill.com", password: "Password123", route: "/admin" },
  { name: "faculty", email: "faculty@wish2skill.com", password: "Password123", route: "/faculty" },
  { name: "student", email: "student@wish2skill.com", password: "Password123", route: "/student" },
  { name: "coordinator", email: "coord@wish2skill.com", password: "Password123", route: "/coordinator" },
  { name: "authority", email: "authority@wish2skill.com", password: "Password123", route: "/authority" },
];

for (const role of roles) {
  test(`${role.name} smoke flow`, async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email Address").fill(role.email);
    await page.getByLabel("Password").fill(role.password);
    await page.getByRole("button", { name: "Continue" }).click();

    await page.waitForURL((url) => !url.pathname.includes("/login"));

    const response = await page.goto(role.route);
    expect(response?.ok()).toBeTruthy();
    await expect(page).not.toHaveURL(/\/login/);
  });
}
