import { getCalendarEvents } from "@/actions/calendar";
import ClientPage from "./client-page";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const events = await getCalendarEvents();
  
  return <ClientPage initialEvents={events} />;
}
