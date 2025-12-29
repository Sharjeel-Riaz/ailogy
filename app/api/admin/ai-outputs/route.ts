import { NextResponse } from "next/server";
import { db } from "@/utils/db";
import { AIOutput, AdminUser } from "@/utils/schema";
import { desc, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

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

    const outputs = await db
      .select()
      .from(AIOutput)
      .orderBy(desc(AIOutput.id))
      .limit(100);

    return NextResponse.json(outputs);
  } catch (error) {
    console.error("Error fetching AI outputs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
