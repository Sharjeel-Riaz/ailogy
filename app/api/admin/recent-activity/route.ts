import { NextResponse } from "next/server";
import { db } from "@/utils/db";
import { AIOutput, AdminUser } from "@/utils/schema";
import { desc, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const adminUser = await db
      .select()
      .from(AdminUser)
      .where(eq(AdminUser.userId, userId))
      .limit(1);

    if (adminUser.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch recent AI outputs as activities
    const recentOutputs = await db
      .select({
        id: AIOutput.id,
        templateSlug: AIOutput.templateSlug,
        createdBy: AIOutput.createdBy,
        createdAt: AIOutput.createdAt,
      })
      .from(AIOutput)
      .orderBy(desc(AIOutput.id))
      .limit(10);

    const activities = recentOutputs.map((output) => ({
      id: output.id,
      type: "ai_output",
      description: `New AI output generated using "${output.templateSlug}" template`,
      createdBy: output.createdBy?.slice(0, 15) + "..." || "Unknown",
      createdAt: output.createdAt || "Unknown",
    }));

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
