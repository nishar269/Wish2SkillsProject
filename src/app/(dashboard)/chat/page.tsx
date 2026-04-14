import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { ChatClient } from "./client-page";

export const metadata = {
  title: "Live Chat | CampusOS",
  description: "Real-time communication terminal",
};

export default async function ChatPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Live Communications"
        text="Real-time encrypted signal transmission and team channels."
      />
      <div className="flex-1 w-full p-4 lg:p-8">
        <ChatClient currentUserId={session.user.id} />
      </div>
    </DashboardShell>
  );
}
