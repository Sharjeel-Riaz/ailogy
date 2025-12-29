import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/utils/db";
import { CourseworkTemplate, AdminUser } from "@/utils/schema";
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
  { params }: { params: { templateId: string } }
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

    const template = await db
      .select()
      .from(CourseworkTemplate)
      .where(eq(CourseworkTemplate.id, params.templateId))
      .limit(1);

    if (template.length === 0) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(template[0]);
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      { error: "Failed to fetch template" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { templateId: string } }
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
    const {
      name,
      description,
      icon,
      category,
      slug,
      aiPrompt,
      formFields,
      isActive,
      sortOrder,
    } = body;

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (category !== undefined) updateData.category = category;
    if (slug !== undefined) updateData.slug = slug;
    if (aiPrompt !== undefined) updateData.aiPrompt = aiPrompt;
    if (formFields !== undefined) updateData.formFields = formFields;
    if (isActive !== undefined) updateData.isActive = String(isActive);
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const updatedTemplate = await db
      .update(CourseworkTemplate)
      .set(updateData)
      .where(eq(CourseworkTemplate.id, params.templateId))
      .returning();

    if (updatedTemplate.length === 0) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTemplate[0]);
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { templateId: string } }
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

    const deletedTemplate = await db
      .delete(CourseworkTemplate)
      .where(eq(CourseworkTemplate.id, params.templateId))
      .returning();

    if (deletedTemplate.length === 0) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
