import { expect, test, type APIRequestContext, type Locator, type Page } from "@playwright/test";

const adminUser = { email: "admin@wish2skill.com", password: "Password123" };
const facultyUser = { email: "faculty@wish2skill.com", password: "Password123" };
const studentUser = { email: "student@wish2skill.com", password: "Password123" };
const coordinatorUser = { email: "coord@wish2skill.com", password: "Password123" };
const authorityUser = { email: "authority@wish2skill.com", password: "Password123" };

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

async function selectFirstAvailableOption(select: Locator) {
  const value = await select.locator("option").evaluateAll((options) => {
    const available = options.find((option) => option.value && !option.disabled);
    return available?.value ?? "";
  });

  expect(value).not.toBe("");
  await select.selectOption(value);
}

function cardByText(page: Page, text: string) {
  return page.locator('[data-slot="card"]').filter({ hasText: text }).first();
}

function dialog(page: Page) {
  return page.locator('[data-slot="dialog-content"]');
}

async function openDialog(trigger: Locator, page: Page) {
  await expect(trigger).toBeVisible();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await trigger.click();

    try {
      await expect(dialog(page)).toBeVisible({ timeout: 2_000 });
      return;
    } catch {
      // Retry when the first click lands before the client listener is attached.
    }
  }

  await expect(dialog(page)).toBeVisible();
}

test.describe.serial("role workflows", () => {
  const runId = `e2e-${Date.now()}`;
  const announcementTitle = `E2E Notice ${runId}`;
  const announcementMessage = `Admin broadcast created during ${runId}.`;
  const assignmentTitle = `E2E Assignment ${runId}`;
  const assignmentDescription = `Build and submit the workflow artifact for ${runId}.`;
  const submissionUrl = `https://github.com/example/${runId}`;
  const gradeFeedback = `Reviewed in ${runId}. Strong implementation.`;
  const leaveReason = `Leave request created during ${runId}.`;
  const leaveRemarks = `Approved during ${runId}.`;

  test.beforeAll(async ({ request }) => {
    await seedDemoData(request);
  });

  test("admin creates an announcement", async ({ page }) => {
    await loginAs(page, adminUser);
    await page.goto("/admin/announcements");

    await expect(page.getByRole("heading", { name: /global announcements/i })).toBeVisible();

    await openDialog(page.getByRole("button", { name: /post announcement/i }), page);

    await page.getByLabel("Title").fill(announcementTitle);
    await page.locator('select[name="type"]').selectOption("URGENT");
    await page.getByLabel("Message Content").fill(announcementMessage);
    await page.getByRole("button", { name: /post now/i }).click();

    await expect(dialog(page)).toBeHidden();

    await page.goto("/admin/announcements");
    await expect(cardByText(page, announcementTitle)).toBeVisible();
    await expect(cardByText(page, announcementMessage)).toBeVisible();
  });

  test("faculty creates an assignment", async ({ page }) => {
    await loginAs(page, facultyUser);
    await page.goto("/faculty/assignments");

    await expect(page.getByRole("heading", { name: /^assignments$/i })).toBeVisible();

    await openDialog(page.getByRole("button", { name: /new assignment/i }), page);

    await page.getByLabel("Title").fill(assignmentTitle);
    await selectFirstAvailableOption(page.locator('select[name="batchId"]'));
    await selectFirstAvailableOption(page.locator('select[name="subjectId"]'));

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    await page.getByLabel("Due Date").fill(dueDate.toISOString().split("T")[0]);
    await page.getByLabel("Total Points").fill("100");
    await page.getByLabel("Task Instructions").fill(assignmentDescription);
    await page.getByLabel("Reference Document Link (Optional)").fill("https://example.com/e2e-brief");
    await page.getByRole("button", { name: /post assignment/i }).click();

    await expect(dialog(page)).toBeHidden();

    await page.goto("/faculty/assignments");
    await expect(cardByText(page, assignmentTitle)).toBeVisible();
    await expect(cardByText(page, "JFS-B12")).toBeVisible();
  });

  test("student sees the announcement and submits the assignment", async ({ page }) => {
    await loginAs(page, studentUser);

    await page.goto("/student/notifications");
    await expect(page.getByRole("heading", { name: /your inbox/i })).toBeVisible();
    await expect(cardByText(page, announcementTitle)).toBeVisible();
    await expect(cardByText(page, announcementMessage)).toBeVisible();

    await page.goto("/student/assignments");
    await expect(page.getByRole("heading", { name: /your assignments/i })).toBeVisible();

    const assignmentCard = cardByText(page, assignmentTitle);
    await expect(assignmentCard).toBeVisible();
    await openDialog(assignmentCard.getByRole("button", { name: /submit work|update work/i }), page);
    await page.getByLabel("Submission Link").fill(submissionUrl);
    await page.getByRole("button", { name: /confirm submission/i }).click();

    await expect(dialog(page)).toBeHidden();

    await page.goto("/student/assignments");
    const updatedCard = cardByText(page, assignmentTitle);
    await expect(updatedCard).toBeVisible();
    await expect(updatedCard.getByRole("button", { name: /update work/i })).toBeVisible();
    await expect(updatedCard.getByText(/submitted/i).first()).toBeVisible();
  });

  test("faculty grades the submitted assignment and student sees the result", async ({ page }) => {
    await loginAs(page, facultyUser);
    await page.goto("/faculty/assignments");

    const assignmentCard = cardByText(page, assignmentTitle);
    await expect(assignmentCard).toBeVisible();
    const submissionsHref = await assignmentCard.getByRole("link", { name: /view submissions/i }).getAttribute("href");
    expect(submissionsHref).toBeTruthy();
    await page.goto(submissionsHref!);

    await expect(page.getByRole("heading", { name: /grade submissions/i })).toBeVisible();

    const studentRow = page.locator("tr").filter({ hasText: "Rahul Kumar" }).first();
    await expect(studentRow).toBeVisible();
    await openDialog(studentRow.getByRole("button", { name: /grade|edit grade/i }), page);
    await page.getByLabel(/score \(out of/i).fill("92");
    await page.getByLabel("Feedback (Optional)").fill(gradeFeedback);
    await page.getByRole("button", { name: /save grade/i }).click();

    await expect(dialog(page)).toBeHidden();

    await page.reload();
    const gradedRow = page.locator("tr").filter({ hasText: "Rahul Kumar" }).first();
    await expect(gradedRow).toContainText("GRADED");
    await expect(gradedRow).toContainText("92/100");

    await loginAs(page, studentUser);
    await page.goto("/student/assignments");

    const gradedAssignmentCard = cardByText(page, assignmentTitle);
    await expect(gradedAssignmentCard).toBeVisible();
    await expect(gradedAssignmentCard).toContainText("Your Score");
    await expect(gradedAssignmentCard).toContainText("92/100");
    await expect(gradedAssignmentCard).toContainText(gradeFeedback);
  });

  test("student requests leave and admin approves it", async ({ page }) => {
    await loginAs(page, studentUser);
    await page.goto("/student/leave");

    await expect(page.getByRole("heading", { name: /leave management/i })).toBeVisible();
    await openDialog(page.getByRole("button", { name: /request leave/i }), page);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 2);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    await page.getByLabel("From Date").fill(startDate.toISOString().split("T")[0]);
    await page.getByLabel("To Date").fill(endDate.toISOString().split("T")[0]);
    await page.getByLabel("Reason for Leave").fill(leaveReason);
    await page.getByRole("button", { name: /submit application/i }).click();

    await expect(dialog(page)).toBeHidden();

    await page.goto("/student/leave");
    const leaveCard = cardByText(page, leaveReason);
    await expect(leaveCard).toBeVisible();
    await expect(leaveCard).toContainText("PENDING");

    await loginAs(page, adminUser);
    await page.goto("/admin/leave");

    await expect(page.getByRole("heading", { name: /pending leave requests/i })).toBeVisible();
    const leaveRow = page.locator("tr").filter({ hasText: leaveReason }).first();
    await expect(leaveRow).toBeVisible();
    await openDialog(leaveRow.getByRole("button", { name: /review request/i }), page);
    await page.getByLabel("Decision Remarks (Optional)").fill(leaveRemarks);
    await page.getByRole("button", { name: /approve leave/i }).click();

    await expect(dialog(page)).toBeHidden();

    await loginAs(page, studentUser);
    await page.goto("/student/leave");

    const approvedLeaveCard = cardByText(page, leaveReason);
    await expect(approvedLeaveCard).toBeVisible();
    await expect(approvedLeaveCard).toContainText("APPROVED");
    await expect(approvedLeaveCard).toContainText(leaveRemarks);
  });

  test("coordinator can access the risk panel", async ({ page }) => {
    await loginAs(page, coordinatorUser);
    await page.goto("/coordinator/students");

    await expect(page.getByRole("heading", { name: /academic risk panel/i })).toBeVisible();
    await expect(cardByText(page, "High Risk Alerts")).toBeVisible();
    await expect(cardByText(page, "Rahul Sharma")).toBeVisible();
  });

  test("authority can access feedback analytics", async ({ page }) => {
    await loginAs(page, authorityUser);
    await page.goto("/authority/feedback");

    await expect(page.getByRole("heading", { name: /feedback pulse/i })).toBeVisible();
    await expect(cardByText(page, "Satisfaction Rate")).toBeVisible();
    await expect(page.getByText(/voice of the campus/i)).toBeVisible();
  });
});

test("invalid login stays on the auth screen and shows feedback", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email Address").fill("unknown@wish2skill.com");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: /enter dashboard/i }).click();

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByText(/invalid email or password/i)).toBeVisible();
});
