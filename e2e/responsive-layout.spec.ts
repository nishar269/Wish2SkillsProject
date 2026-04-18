import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const roles = [
  {
    name: "admin",
    email: "admin@wish2skill.com",
    password: "Password123",
    routes: ["/admin", "/admin/announcements", "/admin/schedule", "/admin/students"],
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

async function seedDemoData(request: APIRequestContext) {
  const response = await request.get("/api/seed");
  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  expect(body.success).toBeTruthy();
}

async function loginAs(page: Page, credentials: { email: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel("Email Address").fill(credentials.email);
  await page.getByLabel("Password").fill(credentials.password);
  await page.getByRole("button", { name: /enter dashboard/i }).click();
  await page.waitForURL((url) => !url.pathname.includes("/login"));
  await expect(page).not.toHaveURL(/\/login/);
}

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const maxWidth = Math.max(doc.scrollWidth, body?.scrollWidth ?? 0);
    return maxWidth - window.innerWidth;
  });

  expect(overflow, "Page has horizontal overflow; layout is not mobile-safe.").toBeLessThanOrEqual(1);
}

async function openMobileNavIfPresent(page: Page) {
  const menuButton = page.getByRole("button", { name: /open navigation menu/i });
  if (await menuButton.isVisible()) {
    await menuButton.click();
    const sheet = page.locator('[data-slot="sheet-content"]');
    await expect(sheet).toBeVisible();
    await expect(sheet.getByText("Wish2Skill")).toBeVisible();
    await expectNoHorizontalScroll(page);
  }
}

test.describe("responsive layout safety", () => {
  test.beforeAll(async ({ request }) => {
    await seedDemoData(request);
  });

  for (const role of roles) {
    test(`${role.name} pages do not overflow horizontally`, async ({ page }) => {
      await loginAs(page, { email: role.email, password: role.password });

      for (const route of role.routes) {
        const response = await page.goto(route);
        expect(response?.ok()).toBeTruthy();
        await expect(page).not.toHaveURL(/\/login/);

        await openMobileNavIfPresent(page);
        await expectNoHorizontalScroll(page);
      }
    });
  }
});
