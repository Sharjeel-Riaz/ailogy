import { NextResponse } from "next/server";
import { db } from "@/utils/db";
import { UserSubscription, AdminUser, User } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

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

    // Get all users from User table with their subscription info
    const users = await db
      .select({
        // User profile data
        id: User.id,
        clerkId: User.clerkId,
        email: User.email,
        firstName: User.firstName,
        lastName: User.lastName,
        imageUrl: User.imageUrl,
        createdAt: User.createdAt,
        // Subscription data
        subscriptionId: UserSubscription.id,
        stripeCustomerId: UserSubscription.stripeCustomerId,
        stripeSubscriptionId: UserSubscription.stripeSubscriptionId,
        stripePriceId: UserSubscription.stripePriceId,
        stripeCurrentPeriodEnd: UserSubscription.stripeCurrentPeriodEnd,
        stripeStatus: UserSubscription.stripeStatus,
        plan: UserSubscription.plan,
        credits: UserSubscription.credits,
      })
      .from(User)
      .leftJoin(UserSubscription, eq(User.clerkId, UserSubscription.userId));

    // Format response
    const formattedUsers = users.map((user) => ({
      id: user.subscriptionId || user.id,
      clerkId: user.clerkId,
      userId: user.clerkId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      imageUrl: user.imageUrl,
      stripeCustomerId: user.stripeCustomerId || "not_set",
      stripeSubscriptionId: user.stripeSubscriptionId || "not_set",
      stripePriceId: user.stripePriceId || "not_set",
      stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
      stripeStatus: user.stripeStatus || "inactive",
      plan: user.plan || "free",
      credits: user.credits || 0,
      createdAt: user.createdAt,
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
