import { NextRequest, NextResponse } from "next/server";
import { db } from "@/utils/db";
import { CourseworkTemplate } from "@/utils/schema";
import { eq } from "drizzle-orm";

// Helper to check isActive (handles both boolean and string)
const isActiveTrue = (value: string | boolean | null | undefined): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value === "true";
  return false;
};

// Public API - get single template by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const templates = await db
      .select()
      .from(CourseworkTemplate)
      .where(eq(CourseworkTemplate.slug, params.slug))
      .limit(1);

    if (templates.length === 0) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    const template = templates[0];

    // Check if template is active
    if (!isActiveTrue(template.isActive)) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Transform to match expected format
    const formattedTemplate = {
      name: template.name,
      desc: template.description || "",
      icon: template.icon || "https://img.icons8.com/color/96/file.png",
      category: template.category || "General",
      slug: template.slug,
      aiPrompt: template.aiPrompt,
      form: parseFormFields(template.formFields),
    };

    return NextResponse.json(formattedTemplate);
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      { error: "Failed to fetch template" },
      { status: 500 }
    );
  }
}

function parseFormFields(formFields: string | any[] | null): any[] {
  if (!formFields) return [];
  // If already an array, return as is
  if (Array.isArray(formFields)) return formFields;
  // If string, try to parse
  if (typeof formFields === "string") {
    try {
      return JSON.parse(formFields);
    } catch {
      return [];
    }
  }
  return [];
}
