import { NextRequest, NextResponse } from "next/server";
import { db } from "@/utils/db";
import { Tutor, AdminUser, Category } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

// Check if user is admin
async function isAdmin(userId: string) {
  const adminUser = await db
    .select()
    .from(AdminUser)
    .where(eq(AdminUser.userId, userId))
    .limit(1);
  return adminUser.length > 0;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { tutorId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await isAdmin(userId);
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const tutor = await db
      .select()
      .from(Tutor)
      .where(eq(Tutor.id, params.tutorId))
      .limit(1);

    if (tutor.length === 0) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }

    // Get category name
    let categoryName = null;
    if (tutor[0].categoryId) {
      const category = await db
        .select()
        .from(Category)
        .where(eq(Category.id, tutor[0].categoryId))
        .limit(1);
      categoryName = category[0]?.name || null;
    }

    return NextResponse.json({
      ...tutor[0],
      categoryName,
    });
  } catch (error) {
    console.error("Error fetching tutor:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { tutorId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await isAdmin(userId);
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, categoryId } = body;

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (categoryId !== undefined) updateData.categoryId = categoryId || null;

    const updatedTutor = await db
      .update(Tutor)
      .set(updateData)
      .where(eq(Tutor.id, params.tutorId))
      .returning();

    if (updatedTutor.length === 0) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTutor[0]);
  } catch (error) {
    console.error("Error updating tutor:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { tutorId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await isAdmin(userId);
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.delete(Tutor).where(eq(Tutor.id, params.tutorId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tutor:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
