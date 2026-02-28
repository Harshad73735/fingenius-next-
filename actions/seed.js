"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Realistic college student transactions for 2 months
// Budget: ~₹10,000/month
function generateStudentTransactions(accountId, userId) {
  const transactions = [];

  // ── JANUARY 2026 ──

  // Income: Monthly allowance
  transactions.push({
    type: "INCOME",
    amount: 10000,
    description: "Monthly allowance from parents",
    date: new Date("2026-01-01"),
    category: "salary",
    status: "COMPLETED",
    userId,
    accountId,
  });

  // Expenses - January
  const janExpenses = [
    { date: "2026-01-02", amount: 1500, desc: "Hostel mess fees", cat: "food" },
    { date: "2026-01-03", amount: 250, desc: "Bus pass recharge", cat: "transportation" },
    { date: "2026-01-04", amount: 180, desc: "Notebook and pens", cat: "education" },
    { date: "2026-01-05", amount: 120, desc: "Tea and snacks with friends", cat: "food" },
    { date: "2026-01-07", amount: 350, desc: "Mobile recharge", cat: "utilities" },
    { date: "2026-01-08", amount: 200, desc: "Photocopy and printing", cat: "education" },
    { date: "2026-01-10", amount: 450, desc: "Dinner at restaurant", cat: "food" },
    { date: "2026-01-11", amount: 150, desc: "Auto rickshaw rides", cat: "transportation" },
    { date: "2026-01-12", amount: 500, desc: "Netflix subscription", cat: "entertainment" },
    { date: "2026-01-13", amount: 80, desc: "Coffee at cafe", cat: "food" },
    { date: "2026-01-15", amount: 600, desc: "New book - Data Structures", cat: "education" },
    { date: "2026-01-16", amount: 300, desc: "Grocery - fruits & snacks", cat: "groceries" },
    { date: "2026-01-17", amount: 200, desc: "Haircut", cat: "personal" },
    { date: "2026-01-18", amount: 350, desc: "Movie with friends", cat: "entertainment" },
    { date: "2026-01-20", amount: 150, desc: "Street food - pani puri, chaat", cat: "food" },
    { date: "2026-01-22", amount: 400, desc: "Medicine - cold and fever", cat: "healthcare" },
    { date: "2026-01-23", amount: 100, desc: "Stationery supplies", cat: "education" },
    { date: "2026-01-24", amount: 250, desc: "Uber rides", cat: "transportation" },
    { date: "2026-01-25", amount: 180, desc: "Maggi and biscuits stock", cat: "groceries" },
    { date: "2026-01-26", amount: 500, desc: "Republic Day outing", cat: "entertainment" },
    { date: "2026-01-28", amount: 350, desc: "Pizza party with roommates", cat: "food" },
    { date: "2026-01-29", amount: 120, desc: "Laundry service", cat: "personal" },
    { date: "2026-01-30", amount: 300, desc: "Online course - Udemy", cat: "education" },
    { date: "2026-01-31", amount: 90, desc: "Tea canteen", cat: "food" },
  ];

  for (const e of janExpenses) {
    transactions.push({
      type: "EXPENSE",
      amount: e.amount,
      description: e.desc,
      date: new Date(e.date),
      category: e.cat,
      status: "COMPLETED",
      userId,
      accountId,
    });
  }

  // ── FEBRUARY 2026 ──

  // Income: Monthly allowance
  transactions.push({
    type: "INCOME",
    amount: 10000,
    description: "Monthly allowance from parents",
    date: new Date("2026-02-01"),
    category: "salary",
    status: "COMPLETED",
    userId,
    accountId,
  });

  // Small freelance income
  transactions.push({
    type: "INCOME",
    amount: 2000,
    description: "Freelance logo design project",
    date: new Date("2026-02-10"),
    category: "freelance",
    status: "COMPLETED",
    userId,
    accountId,
  });

  // Expenses - February
  const febExpenses = [
    { date: "2026-02-01", amount: 1500, desc: "Hostel mess fees", cat: "food" },
    { date: "2026-02-02", amount: 250, desc: "Bus pass recharge", cat: "transportation" },
    { date: "2026-02-03", amount: 800, desc: "Exam stationery & guides", cat: "education" },
    { date: "2026-02-04", amount: 150, desc: "Chai and samosa daily", cat: "food" },
    { date: "2026-02-05", amount: 350, desc: "Mobile recharge", cat: "utilities" },
    { date: "2026-02-06", amount: 200, desc: "Photocopy - study material", cat: "education" },
    { date: "2026-02-07", amount: 500, desc: "Birthday gift for friend", cat: "gifts" },
    { date: "2026-02-08", amount: 300, desc: "Biryani treat", cat: "food" },
    { date: "2026-02-09", amount: 120, desc: "Auto to market", cat: "transportation" },
    { date: "2026-02-11", amount: 500, desc: "Spotify + Netflix", cat: "entertainment" },
    { date: "2026-02-12", amount: 400, desc: "New earphones", cat: "shopping" },
    { date: "2026-02-13", amount: 250, desc: "Grocery - instant noodles, chips", cat: "groceries" },
    { date: "2026-02-14", amount: 600, desc: "Valentine's Day dinner", cat: "food" },
    { date: "2026-02-15", amount: 200, desc: "Gym membership split", cat: "personal" },
    { date: "2026-02-16", amount: 350, desc: "Movie tickets - weekend", cat: "entertainment" },
    { date: "2026-02-17", amount: 180, desc: "Uber to college", cat: "transportation" },
    { date: "2026-02-18", amount: 100, desc: "Pen drive 64GB", cat: "shopping" },
    { date: "2026-02-19", amount: 450, desc: "Canteen lunch x5 days", cat: "food" },
    { date: "2026-02-20", amount: 300, desc: "Haircut and grooming", cat: "personal" },
    { date: "2026-02-21", amount: 150, desc: "Library late fine", cat: "bills" },
    { date: "2026-02-22", amount: 500, desc: "Weekend trip bus fare", cat: "travel" },
    { date: "2026-02-23", amount: 350, desc: "Trip food expenses", cat: "food" },
    { date: "2026-02-24", amount: 200, desc: "Printing - project report", cat: "education" },
    { date: "2026-02-25", amount: 280, desc: "Grocery restock", cat: "groceries" },
    { date: "2026-02-26", amount: 150, desc: "Coffee and snacks", cat: "food" },
  ];

  for (const e of febExpenses) {
    transactions.push({
      type: "EXPENSE",
      amount: e.amount,
      description: e.desc,
      date: new Date(e.date),
      category: e.cat,
      status: "COMPLETED",
      userId,
      accountId,
    });
  }

  return transactions;
}

export async function seedAccountData(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Verify account ownership
    const account = await db.account.findUnique({
      where: { id: accountId, userId: user.id },
    });

    if (!account) throw new Error("Account not found");

    // Generate transactions
    const transactions = generateStudentTransactions(accountId, user.id);

    // Calculate final balance change
    let balanceChange = 0;
    for (const t of transactions) {
      if (t.type === "INCOME") {
        balanceChange += t.amount;
      } else {
        balanceChange -= t.amount;
      }
    }

    // Insert all transactions and update balance in a single DB transaction
    await db.$transaction(async (tx) => {
      await tx.transaction.createMany({
        data: transactions,
      });

      await tx.account.update({
        where: { id: accountId },
        data: {
          balance: {
            increment: balanceChange,
          },
        },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${accountId}`);

    return { success: true };
  } catch (error) {
    console.error("[seedAccountData] Error:", error.message);
    return { success: false, error: error.message };
  }
}
