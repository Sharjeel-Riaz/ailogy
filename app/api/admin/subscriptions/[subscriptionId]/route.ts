import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/utils/db";
import { UserSubscription, AdminUser } from "@/utils/schema";
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
  { params }: { params: { subscriptionId: string } }
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

    const subscription = await db
      .select()
      .from(UserSubscription)
      .where(eq(UserSubscription.id, parseInt(params.subscriptionId)))
      .limit(1);

    if (subscription.length === 0) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(subscription[0]);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { subscriptionId: string } }
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
    const { plan, credits, stripeStatus, stripeCurrentPeriodEnd } = body;

    const updateData: any = {};

    if (plan !== undefined) updateData.plan = plan;
    if (credits !== undefined) updateData.credits = credits;
    if (stripeStatus !== undefined) updateData.stripeStatus = stripeStatus;
    if (stripeCurrentPeriodEnd !== undefined) {
      updateData.stripeCurrentPeriodEnd = new Date(stripeCurrentPeriodEnd);
    }

    const updatedSubscription = await db
      .update(UserSubscription)
      .set(updateData)
      .where(eq(UserSubscription.id, parseInt(params.subscriptionId)))
      .returning();

    if (updatedSubscription.length === 0) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSubscription[0]);
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
