import { NextResponse } from "next/server";
import { db } from "@/utils/db";
import {
  AIOutput,
  Tutor,
  Message,
  UserSubscription,
  AdminUser,
} from "@/utils/schema";
import { count, eq } from "drizzle-orm";
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

    // Fetch all stats
    const [aiOutputCount] = await db.select({ count: count() }).from(AIOutput);
    const [tutorCount] = await db.select({ count: count() }).from(Tutor);
    const [messageCount] = await db.select({ count: count() }).from(Message);
    const [subscriptionCount] = await db
      .select({ count: count() })
      .from(UserSubscription);
    const [activeSubscriptionCount] = await db
      .select({ count: count() })
      .from(UserSubscription)
      .where(eq(UserSubscription.stripeStatus, "active"));

    // Get unique users count from subscriptions
    const uniqueUsers = await db
      .selectDistinct({ userId: UserSubscription.userId })
      .from(UserSubscription);

    return NextResponse.json({
      totalUsers: uniqueUsers.length,
      totalAiOutputs: aiOutputCount.count,
      totalTutors: tutorCount.count,
      totalSubscriptions: subscriptionCount.count,
      totalMessages: messageCount.count,
      activeSubscriptions: activeSubscriptionCount.count,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
