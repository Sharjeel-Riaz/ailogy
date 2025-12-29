import { NextResponse } from "next/server";
import { db } from "@/utils/db";
import { UserSubscription, AdminUser, User } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { auth, clerkClient } from "@clerk/nextjs/server";

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

    // Get all subscriptions
    const subscriptions = await db.select().from(UserSubscription);

    // Get all users from our User table
    const dbUsers = await db.select().from(User);

    // Create a map of clerkId to user data for quick lookup
    const userMap = new Map(dbUsers.map((u) => [u.clerkId, u]));

    // For users not in our DB, try to fetch from Clerk
    const usersWithProfile = await Promise.all(
      subscriptions.map(async (sub) => {
        const dbUser = userMap.get(sub.userId || "");

        if (dbUser) {
          // User exists in our DB
          return {
            ...sub,
            firstName: dbUser.firstName,
            lastName: dbUser.lastName,
            email: dbUser.email,
            imageUrl: dbUser.imageUrl,
          };
        }

        // Try to fetch from Clerk for existing users not in User table
        if (sub.userId) {
          try {
            const clerkUser = await clerkClient.users.getUser(sub.userId);

            // Optionally save to our DB for future
            try {
              await db
                .insert(User)
                .values({
                  clerkId: sub.userId,
                  email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
                  firstName: clerkUser.firstName || null,
                  lastName: clerkUser.lastName || null,
                  imageUrl: clerkUser.imageUrl || null,
                })
                .onConflictDoNothing()
                .execute();
            } catch (e) {
              // Ignore if insert fails (user might already exist)
            }

            return {
              ...sub,
              firstName: clerkUser.firstName,
              lastName: clerkUser.lastName,
              email: clerkUser.emailAddresses?.[0]?.emailAddress || null,
              imageUrl: clerkUser.imageUrl,
            };
          } catch (e) {
            // User might not exist in Clerk anymore
            return {
              ...sub,
              firstName: null,
              lastName: null,
              email: null,
              imageUrl: null,
            };
          }
        }

        return {
          ...sub,
          firstName: null,
          lastName: null,
          email: null,
          imageUrl: null,
        };
      })
    );

    return NextResponse.json(usersWithProfile);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
