import { NextResponse } from "next/server";
import { db } from "@/utils/db";
import { Tutor, Category, AdminUser } from "@/utils/schema";
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

    const tutors = await db
      .select({
        id: Tutor.id,
        userId: Tutor.userId,
        userName: Tutor.userName,
        src: Tutor.src,
        name: Tutor.name,
        description: Tutor.description,
        instructions: Tutor.instructions,
        seed: Tutor.seed,
        createdAt: Tutor.createdAt,
        updatedAt: Tutor.updatedAt,
        categoryId: Tutor.categoryId,
        categoryName: Category.name,
      })
      .from(Tutor)
      .leftJoin(Category, eq(Tutor.categoryId, Category.id))
      .orderBy(desc(Tutor.createdAt));

    return NextResponse.json(tutors);
  } catch (error) {
    console.error("Error fetching tutors:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
