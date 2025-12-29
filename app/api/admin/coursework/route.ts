import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/utils/db";
import { CourseworkTemplate, AdminUser } from "@/utils/schema";
import { eq, asc } from "drizzle-orm";

// Check if user is admin
async function isAdmin(userId: string) {
  const adminUser = await db
    .select()
    .from(AdminUser)
    .where(eq(AdminUser.userId, userId))
    .limit(1);
  return adminUser.length > 0;
}

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await isAdmin(userId);
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const templates = await db
      .select()
      .from(CourseworkTemplate)
      .orderBy(asc(CourseworkTemplate.sortOrder));

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    if (!name || !slug || !aiPrompt) {
      return NextResponse.json(
        { error: "Name, slug, and AI prompt are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingTemplate = await db
      .select()
      .from(CourseworkTemplate)
      .where(eq(CourseworkTemplate.slug, slug))
      .limit(1);

    if (existingTemplate.length > 0) {
      return NextResponse.json(
        { error: "A template with this slug already exists" },
        { status: 400 }
      );
    }

    const newTemplate = await db
      .insert(CourseworkTemplate)
      .values({
        name,
        description: description || null,
        icon: icon || null,
        category: category || null,
        slug,
        aiPrompt,
        formFields: formFields || "[]",
        isActive: isActive !== undefined ? String(isActive) : "true",
        sortOrder: sortOrder || 0,
        createdBy: userId,
      })
      .returning();

    return NextResponse.json(newTemplate[0], { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
