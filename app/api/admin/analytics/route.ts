import { NextResponse } from "next/server";
import { db } from "@/utils/db";
import {
  AIOutput,
  AdminUser,
  UserSubscription,
  Tutor,
  Message,
} from "@/utils/schema";
import { eq, sql, desc } from "drizzle-orm";
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

    // Get template usage
    const templateUsage = await db
      .select({
        template: AIOutput.templateSlug,
        count: sql<number>`count(*)::int`,
      })
      .from(AIOutput)
      .groupBy(AIOutput.templateSlug)
      .orderBy(desc(sql`count(*)`));

    // Get daily outputs (simplified - using createdAt string field)
    const allOutputs = await db.select().from(AIOutput);

    // Group by date
    const dailyMap = new Map<string, number>();
    allOutputs.forEach((output) => {
      const date = output.createdAt?.split(" ")[0] || "Unknown";
      dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
    });

    const dailyOutputs = Array.from(dailyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 7);

    // Get unique users who created content
    const uniqueUsers = await db
      .selectDistinct({ createdBy: AIOutput.createdBy })
      .from(AIOutput);

    // Get subscription stats
    const subscriptions = await db.select().from(UserSubscription);
    const activeSubscriptions = subscriptions.filter(
      (s) => s.stripeStatus === "active"
    ).length;
    const monthlyRevenue =
      subscriptions.filter(
        (s) => s.plan === "monthly" && s.stripeStatus === "active"
      ).length * 9.99;
    const yearlyRevenue =
      subscriptions.filter(
        (s) => s.plan === "yearly" && s.stripeStatus === "active"
      ).length *
      (99.99 / 12);

    // Get total tutors
    const tutors = await db.select().from(Tutor);

    // Get total messages
    const messages = await db.select().from(Message);
    const userMessages = messages.filter((m) => m.role === "user").length;

    // Get signups over time (based on subscriptions created)
    const signupsByMonth = new Map<string, number>();
    subscriptions.forEach((sub) => {
      // Using a default date since we don't have createdAt
      const date = new Date().toISOString().slice(0, 7); // Current month
      signupsByMonth.set(date, (signupsByMonth.get(date) || 0) + 1);
    });

    return NextResponse.json({
      templateUsage,
      dailyOutputs,
      userGrowth: uniqueUsers.map((u) => ({
        date: "Active",
        count: 1,
      })),
      // Additional stats
      overview: {
        totalUsers: subscriptions.length,
        activeSubscriptions,
        totalTutors: tutors.length,
        totalMessages: messages.length,
        userMessages,
        totalAiOutputs: allOutputs.length,
        monthlyRevenue: monthlyRevenue + yearlyRevenue,
        activeUsers: uniqueUsers.length,
      },
      subscriptionBreakdown: {
        free: subscriptions.filter((s) => s.plan === "free" || !s.plan).length,
        monthly: subscriptions.filter((s) => s.plan === "monthly").length,
        yearly: subscriptions.filter((s) => s.plan === "yearly").length,
        active: activeSubscriptions,
        inactive: subscriptions.filter((s) => s.stripeStatus === "inactive")
          .length,
        canceled: subscriptions.filter((s) => s.stripeStatus === "canceled")
          .length,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
