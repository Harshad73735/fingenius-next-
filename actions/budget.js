"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { sendEmail } from "./send-email";
import BudgetAlertEmail from "@/emails/budget-alert";

export async function getCurrentBudget(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const budget = await db.budget.findFirst({
      where: {
        userId: user.id,
      },
    });

    // Get current month's expenses
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const expenses = await db.transaction.aggregate({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        accountId,
      },
      _sum: {
        amount: true,
      },
    });

    const currentExpenses = expenses._sum.amount
      ? expenses._sum.amount.toNumber()
      : 0;

    // Check if budget is exceeded and send alert
    if (budget && currentExpenses > budget.amount.toNumber()) {
      console.log("[Budget Alert] Expenses exceeded budget:", {
        budgetAmount: budget.amount.toNumber(),
        currentExpenses,
        userEmail: user.email,
      });

      const now = new Date();
      const lastAlert = budget.lastAlertSent
        ? new Date(budget.lastAlertSent)
        : null;
      const hoursSinceLastAlert = lastAlert
        ? (now - lastAlert) / (1000 * 60 * 60)
        : null;

      // Send alert only if last alert was more than 24 hours ago
      if (!lastAlert || hoursSinceLastAlert > 24) {
        try {
          // Get all emails for the user (primary + additional emails)
          const userEmails = await db.userEmail.findMany({
            where: { userId: user.id },
            select: { email: true },
          });

          // Combine primary email with additional emails
          const emailsList = [
            user.email,
            ...userEmails.map((ue) => ue.email),
          ].filter((email) => email && email.trim() !== "");

          if (emailsList.length === 0) {
            console.warn("[Budget Alert] No emails found for user. Skipping email alert.");
            return {
              budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
              currentExpenses,
            };
          }

          console.log("[Budget Alert] Sending email to:", emailsList);
          const emailResponse = await sendEmail({
            to: emailsList,
            subject: "Budget Alert: You've exceeded your budget!",
            react: BudgetAlertEmail({
              userName: user.name,
              budgetAmount: budget.amount.toNumber(),
              currentExpenses,
              percentageExceeded: Math.round(
                ((currentExpenses - budget.amount.toNumber()) /
                  budget.amount.toNumber()) *
                  100
              ),
            }),
          });

          if (!emailResponse.success) {
            console.error("[Budget Alert] Email send failed:", emailResponse.error);
            return {
              budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
              currentExpenses,
              emailError: emailResponse.error,
            };
          }

          // Update last alert sent time
          await db.budget.update({
            where: { userId: user.id },
            data: { lastAlertSent: now },
          });
          console.log("[Budget Alert] Email sent successfully:", emailResponse.data);
        } catch (emailError) {
          console.error("[Budget Alert] Error sending email:", emailError);
        }
      } else {
        console.log("[Budget Alert] Alert already sent in the last 24 hours");
      }
    }

    return {
      budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
      currentExpenses,
    };
  } catch (error) {
    console.error("Error fetching budget:", error);
    throw error;
  }
}

export async function updateBudget(amount) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Update or create budget
    const budget = await db.budget.upsert({
      where: {
        userId: user.id,
      },
      update: {
        amount,
        lastAlertSent: null, // Reset alert timer so new alert can be sent
      },
      create: {
        userId: user.id,
        amount,
      },
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      data: { ...budget, amount: budget.amount.toNumber() },
    };
  } catch (error) {
    console.error("Error updating budget:", error);
    return { success: false, error: error.message };
  }
}
