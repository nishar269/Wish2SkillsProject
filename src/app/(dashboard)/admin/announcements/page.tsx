import { getAnnouncements } from "@/actions/announcements";
import { auth } from "@/lib/auth";
import ClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const announcements = await getAnnouncements();
  
  return <ClientPage initialAnnouncements={announcements} />;
}
