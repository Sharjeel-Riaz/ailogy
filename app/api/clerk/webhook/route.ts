import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/utils/db";
import { UserSubscription, User } from "@/utils/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new NextResponse("Error occured", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const primaryEmail = email_addresses?.[0]?.email_address || "";

    try {
      // Create user profile record
      await db
        .insert(User)
        .values({
          clerkId: id,
          email: primaryEmail,
          firstName: first_name || null,
          lastName: last_name || null,
          imageUrl: image_url || null,
        })
        .execute();

      // Create a new subscription record for the user
      await db
        .insert(UserSubscription)
        .values({
          userId: id,
          stripeCustomerId: "not_set",
          stripeSubscriptionId: "not_set",
          stripePriceId: "not_set",
          stripeStatus: "inactive",
          plan: "free",
          credits: 10000,
          stripeCurrentPeriodEnd: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ),
        })
        .execute();

      return new NextResponse("User created successfully", { status: 200 });
    } catch (error) {
      console.error("Error creating user:", error);
      return new NextResponse("Error creating user", {
        status: 500,
      });
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const primaryEmail = email_addresses?.[0]?.email_address || "";

    try {
      await db
        .update(User)
        .set({
          email: primaryEmail,
          firstName: first_name || null,
          lastName: last_name || null,
          imageUrl: image_url || null,
          updatedAt: new Date(),
        })
        .where(eq(User.clerkId, id))
        .execute();

      return new NextResponse("User updated successfully", { status: 200 });
    } catch (error) {
      console.error("Error updating user:", error);
      return new NextResponse("Error updating user", {
        status: 500,
      });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    try {
      if (id) {
        await db.delete(User).where(eq(User.clerkId, id)).execute();
      }

      return new NextResponse("User deleted successfully", { status: 200 });
    } catch (error) {
      console.error("Error deleting user:", error);
      return new NextResponse("Error deleting user", {
        status: 500,
      });
    }
  }

  return new NextResponse("Webhook received", { status: 200 });
}
