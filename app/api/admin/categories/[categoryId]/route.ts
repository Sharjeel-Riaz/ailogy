import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/utils/db";
import { Category, AdminUser, Tutor } from "@/utils/schema";
import { eq } from "drizzle-orm";

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
  { params }: { params: { categoryId: string } }
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

    const category = await db
      .select()
      .from(Category)
      .where(eq(Category.id, params.categoryId))
      .limit(1);

    if (category.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Get tutors count for this category
    const tutors = await db
      .select()
      .from(Tutor)
      .where(eq(Tutor.categoryId, params.categoryId));

    return NextResponse.json({
      ...category[0],
      tutorsCount: tutors.length,
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
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
    const { name } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const updatedCategory = await db
      .update(Category)
      .set({ name: name.trim() })
      .where(eq(Category.id, params.categoryId))
      .returning();

    if (updatedCategory.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCategory[0]);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
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

    // Check if category has tutors
    const tutors = await db
      .select()
      .from(Tutor)
      .where(eq(Tutor.categoryId, params.categoryId))
      .limit(1);

    if (tutors.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with associated tutors" },
        { status: 400 }
      );
    }

    const deletedCategory = await db
      .delete(Category)
      .where(eq(Category.id, params.categoryId))
      .returning();

    if (deletedCategory.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
