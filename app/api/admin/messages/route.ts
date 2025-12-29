import { NextResponse } from "next/server";
import { db } from "@/utils/db";
import { Message, Tutor, AdminUser } from "@/utils/schema";
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

    const messages = await db
      .select({
        id: Message.id,
        role: Message.role,
        content: Message.content,
        createdAt: Message.createdAt,
        tutorId: Message.tutorId,
        userId: Message.userId,
        tutorName: Tutor.name,
      })
      .from(Message)
      .leftJoin(Tutor, eq(Message.tutorId, Tutor.id))
      .orderBy(desc(Message.createdAt))
      .limit(100);

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
