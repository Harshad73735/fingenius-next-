// Script to trigger budget alert email
// Run: node scripts/trigger-budget-alert.js

const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer");
require("dotenv").config();

const db = new PrismaClient();

async function main() {
  console.log("\n🚨 FinGenius Budget Alert Trigger\n");

  const users = await db.user.findMany({
    include: {
      accounts: { where: { isDefault: true } },
    },
  });

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const smtpFrom = process.env.SMTP_FROM || smtpUser;

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  for (const user of users) {
    console.log(`─── User: ${user.name} (${user.email || "NO EMAIL"}) ───`);

    if (!user.email || user.email.trim() === "") {
      console.log("  ⚠️  Skipping - no email\n");
      continue;
    }

    const defaultAccount = user.accounts[0];
    if (!defaultAccount) {
      console.log("  ⚠️  No default account\n");
      continue;
    }

    const budget = await db.budget.findFirst({ where: { userId: user.id } });
    if (!budget) {
      console.log("  ⚠️  No budget set\n");
      continue;
    }

    const budgetAmount = budget.amount.toNumber();
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const expenses = await db.transaction.aggregate({
      where: {
        userId: user.id,
        accountId: defaultAccount.id,
        type: "EXPENSE",
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    });

    const totalExpenses = expenses._sum.amount?.toNumber() || 0;
    const percentUsed = (totalExpenses / budgetAmount) * 100;
    const remaining = budgetAmount - totalExpenses;

    console.log(`  💰 Budget: ₹${budgetAmount}`);
    console.log(`  📊 Spent:  ₹${totalExpenses.toFixed(2)} (${percentUsed.toFixed(1)}%)`);
    console.log(`  ${remaining >= 0 ? "✅" : "🔴"} Remaining: ₹${remaining.toFixed(2)}`);

    if (percentUsed < 90) {
      console.log(`  ℹ️  Under 90% - no alert needed\n`);
      continue;
    }

    const isOver = totalExpenses > budgetAmount;
    const overBy = isOver ? ((totalExpenses - budgetAmount) / budgetAmount * 100).toFixed(1) : 0;

    const html = `
      <div style="background:#f6f9fc;font-family:-apple-system,sans-serif;padding:40px 0">
        <div style="background:#fff;max-width:600px;margin:0 auto;padding:32px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
          <h1 style="color:${isOver ? '#dc2626' : '#f59e0b'};font-size:24px;text-align:center;margin:0 0 8px">${isOver ? '🔴' : '⚠️'} Budget Alert</h1>
          <p style="color:#6b7280;text-align:center;margin:0 0 24px">${defaultAccount.name} • ${new Date().toLocaleString("default", { month: "long" })} 2026</p>
          
          <p style="color:#374151;font-size:16px">Hello <strong>${user.name}</strong>,</p>
          <p style="color:#4b5563;font-size:15px">
            ${isOver 
              ? `You've <strong style="color:#dc2626">exceeded</strong> your monthly budget by <strong>${overBy}%</strong>!`
              : `You've used <strong style="color:#f59e0b">${percentUsed.toFixed(1)}%</strong> of your monthly budget. Almost there!`
            }
          </p>
          
          <!-- Progress Bar -->
          <div style="margin:24px 0;background:#f3f4f6;border-radius:12px;height:28px;overflow:hidden;position:relative">
            <div style="background:linear-gradient(90deg,${isOver ? '#dc2626,#ef4444' : '#f59e0b,#fbbf24'});height:100%;width:${Math.min(percentUsed, 100)}%;border-radius:12px;display:flex;align-items:center;justify-content:flex-end;padding-right:8px">
              <span style="color:white;font-size:12px;font-weight:700">${percentUsed.toFixed(0)}%</span>
            </div>
          </div>

          <div style="display:flex;gap:12px;margin:24px 0">
            <div style="flex:1;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px;text-align:center">
              <p style="color:#991b1b;font-size:11px;margin:0 0 4px;font-weight:600;text-transform:uppercase">Spent</p>
              <p style="color:#dc2626;font-size:22px;font-weight:800;margin:0">₹${totalExpenses.toFixed(2)}</p>
            </div>
            <div style="flex:1;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px;text-align:center">
              <p style="color:#1e40af;font-size:11px;margin:0 0 4px;font-weight:600;text-transform:uppercase">Budget</p>
              <p style="color:#2563eb;font-size:22px;font-weight:800;margin:0">₹${budgetAmount.toFixed(2)}</p>
            </div>
            <div style="flex:1;background:${isOver ? '#fef2f2' : '#ecfdf5'};border:1px solid ${isOver ? '#fecaca' : '#a7f3d0'};border-radius:10px;padding:16px;text-align:center">
              <p style="color:${isOver ? '#991b1b' : '#065f46'};font-size:11px;margin:0 0 4px;font-weight:600;text-transform:uppercase">${isOver ? 'Over by' : 'Remaining'}</p>
              <p style="color:${isOver ? '#dc2626' : '#059669'};font-size:22px;font-weight:800;margin:0">₹${Math.abs(remaining).toFixed(2)}</p>
            </div>
          </div>

          <div style="margin-top:24px;padding:16px;background:#fffbeb;border:1px solid #fde68a;border-radius:10px">
            <p style="color:#92400e;font-size:14px;margin:0">
              💡 <strong>Tip:</strong> ${isOver 
                ? 'Try to avoid non-essential spending for the rest of the month to recover.'
                : 'You have ₹' + remaining.toFixed(2) + ' left. Spend wisely for the remaining days!'
              }
            </p>
          </div>

          <p style="color:#9ca3af;font-size:12px;text-align:center;margin:24px 0 0;border-top:1px solid #e5e7eb;padding-top:16px">
            FinGenius 💜 Your personal finance companion
          </p>
        </div>
      </div>
    `;

    try {
      console.log(`  📧 Sending budget alert to ${user.email}...`);
      const info = await transporter.sendMail({
        from: smtpFrom,
        to: user.email,
        subject: `${isOver ? '🔴' : '⚠️'} Budget Alert: ${percentUsed.toFixed(0)}% of your budget used`,
        html,
      });
      console.log(`  ✅ Alert sent! Message ID: ${info.messageId}\n`);
    } catch (error) {
      console.error(`  ❌ Failed: ${error.message}\n`);
    }
  }

  console.log("Done! 🎉\n");
  await db.$disconnect();
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
