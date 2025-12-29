import { NextResponse } from "next/server";
import { db } from "@/utils/db";
import { CourseworkTemplate } from "@/utils/schema";
import { asc } from "drizzle-orm";

// Helper to check isActive (handles both boolean and string)
const isActiveTrue = (value: string | boolean | null | undefined): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value === "true";
  return false;
};

// Public API - no auth required, only returns active templates
export async function GET() {
  try {
    // Fetch all templates and filter in code to handle boolean/string isActive
    const allTemplates = await db
      .select()
      .from(CourseworkTemplate)
      .orderBy(asc(CourseworkTemplate.sortOrder));

    // Filter active templates
    const templates = allTemplates.filter((t) => isActiveTrue(t.isActive));

    // Transform to match the expected format for user dashboard
    const formattedTemplates = templates.map((template) => ({
      name: template.name,
      desc: template.description || "",
      icon: template.icon || "https://img.icons8.com/color/96/file.png",
      category: template.category || "General",
      slug: template.slug,
      aiPrompt: template.aiPrompt,
      form: parseFormFields(template.formFields),
    }));

    return NextResponse.json(formattedTemplates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

function parseFormFields(formFields: string | null): any[] {
  if (!formFields) return [];
  try {
    return JSON.parse(formFields);
  } catch {
    return [];
  }
}
