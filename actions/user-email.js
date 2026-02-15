"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function addUserEmail(newEmail) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Check if email already exists
    const existingEmail = await db.userEmail.findUnique({
      where: {
        userId_email: {
          userId: user.id,
          email: newEmail.toLowerCase(),
        },
      },
    });

    if (existingEmail) {
      return { success: false, error: "Email already added" };
    }

    // Check if it's the primary email
    if (newEmail.toLowerCase() === user.email.toLowerCase()) {
      return { success: false, error: "This is your primary email" };
    }

    const userEmail = await db.userEmail.create({
      data: {
        email: newEmail.toLowerCase(),
        userId: user.id,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: userEmail };
  } catch (error) {
    console.error("[addUserEmail] Error:", error);
    return { success: false, error: error.message };
  }
}

export async function removeUserEmail(emailId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Verify the email belongs to this user
    const userEmail = await db.userEmail.findUnique({
      where: { id: emailId },
    });

    if (!userEmail || userEmail.userId !== user.id) {
      throw new Error("Unauthorized");
    }

    await db.userEmail.delete({
      where: { id: emailId },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[removeUserEmail] Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserEmails() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        emails: {
          select: { id: true, email: true, createdAt: true },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      success: true,
      data: {
        primaryEmail: user.email,
        additionalEmails: user.emails,
      },
    };
  } catch (error) {
    console.error("[getUserEmails] Error:", error);
    return { success: false, error: error.message };
  }
}
