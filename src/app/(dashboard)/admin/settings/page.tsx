import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSystemSettings } from "@/actions/settings";
import AdminSettingsClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const settings = await getSystemSettings();

  return <AdminSettingsClientPage initialSettings={settings} />;
}
