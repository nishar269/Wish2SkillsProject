import { getUserProfile } from "@/actions/settings";
import ClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getUserProfile();
  if (!user) return null;
  
  return <ClientPage user={user} />;
}
