// @ts-nocheck
import { db } from "@/utils/db";
import { AIOutput, CourseworkTemplate } from "@/utils/schema";
import { currentUser } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import HistoryTable from "./_components/HistoryTable";

async function History() {
  const user = await currentUser();

  // Fetch user's AI outputs
  const historyList = await db
    .select()
    .from(AIOutput)
    .where(
      eq(AIOutput?.createdBy ?? "", user?.primaryEmailAddress?.emailAddress)
    )
    .orderBy(desc(AIOutput.id));

  // Fetch all templates from database
  const templates = await db.select().from(CourseworkTemplate);

  // Pre-process the history list with template information
  const processedHistoryList = historyList.map((item) => {
    const template = templates.find((t) => t.slug === item.templateSlug);

    return {
      ...item,
      templateName: template?.name || "Unknown Template",
      templateIcon:
        template?.icon || "https://img.icons8.com/color/96/file.png",
    };
  });

  return <HistoryTable initialHistoryList={processedHistoryList} />;
}

export default History;
