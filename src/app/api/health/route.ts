import { NextResponse } from "next/server";
import { checkMailHealth } from "@/lib/mail";

export const dynamic = "force-dynamic";

export async function GET() {
  const mailHealth = await checkMailHealth();

  if (mailHealth.status === "unhealthy") {
    return NextResponse.json(
      { status: "unhealthy", details: { mail: mailHealth } },
      { status: 503 }
    );
  }

  return NextResponse.json(
    { status: "healthy", details: { mail: mailHealth } },
    { status: 200 }
  );
}
