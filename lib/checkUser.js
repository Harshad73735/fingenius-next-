import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  try {
    const { userId } = await auth();
    console.log("[checkUser] Clerk userId:", userId);
    if (!userId) {
      console.error("[checkUser] No authenticated user found. auth() result:", await auth());
      throw new Error("No authenticated user found");
    }

    // Try to find existing user in DB
    let loggedInUser = null;
    try {
      loggedInUser = await db.user.findUnique({
        where: { clerkUserId: userId },
      });
      console.log("[checkUser] Prisma user found:", loggedInUser);
    } catch (dbFindErr) {
      console.error("[checkUser] Error finding user in DB:", dbFindErr);
    }

    // If user doesn't exist, create with default values (client-side update needed for real info)
    if (!loggedInUser) {
      console.log("[checkUser] Creating new user for userId:", userId);
      // TODO: Update user info from client after sign-up/login
      try {
        loggedInUser = await db.user.create({
          data: {
            clerkUserId: userId,
            name: "New User",
            imageUrl: "",
            email: "",
          },
        });
        console.log("[checkUser] New user created:", loggedInUser);
      } catch (dbCreateErr) {
        console.error("[checkUser] Error creating user in DB:", dbCreateErr);
      }
    }

    return loggedInUser;
  } catch (error) {
    console.error("[checkUser] Error:", error);
    throw new Error("Failed to verify or create user");
  }
};
