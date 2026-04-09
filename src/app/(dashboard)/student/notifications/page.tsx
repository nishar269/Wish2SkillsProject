import { getStudentNotifications } from "@/actions/notifications";
import { auth } from "@/lib/auth";
import NotificationsClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function StudentNotificationsPage() {
  const session = await auth();
  const notifications = await getStudentNotifications();

  return (
    <NotificationsClientPage 
        initialNotifications={notifications} 
        userId={session?.user.id || ""} 
    />
  );
}
