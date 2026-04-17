import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChatClient } from "./client-page";

export const metadata = {
  title: "Live Chat | CampusOS",
  description: "Real-time communication terminal",
};

export default async function ChatPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Live Communications</h1>
        <p className="text-muted-foreground">
          Real-time encrypted signal transmission and team channels.
        </p>
      </div>
      <ChatClient currentUserId={session.user.id} />
    </div>
  );
}
