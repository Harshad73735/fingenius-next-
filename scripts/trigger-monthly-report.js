// Script to manually trigger the monthly financial report email
// Run: node scripts/trigger-monthly-report.js

const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer");
const { render } = require("@react-email/render");

require("dotenv").config();

const db = new PrismaClient();

async function getMonthlyStats(userId, month) {
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: { gte: startDate, lte: endDate },
    },
  });

  return transactions.reduce(
    (stats, t) => {
      const amount = t.amount.toNumber();
      if (t.type === "EXPENSE") {
        stats.totalExpenses += amount;
        stats.byCategory[t.category] = (stats.byCategory[t.category] || 0) + amount;
      } else {
        stats.totalIncome += amount;
      }
      return stats;
    },
    { totalExpenses: 0, totalIncome: 0, byCategory: {}, transactionCount: transactions.length }
  );
}

async function sendReportEmail(user, stats, monthName) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const smtpFrom = process.env.SMTP_FROM || smtpUser;

  if (!smtpUser || !smtpPass) {
    console.error("❌ SMTP credentials not configured in .env");
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  // Build HTML manually (no JSX in .js)
  const net = stats.totalIncome - stats.totalExpenses;
  const categoryRows = Object.entries(stats.byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amt]) => `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-transform:capitalize">${cat}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600">₹${amt.toFixed(2)}</td></tr>`)
    .join("");

  const html = `
    <div style="background:#f6f9fc;font-family:-apple-system,sans-serif;padding:40px 0">
      <div style="background:#fff;max-width:600px;margin:0 auto;padding:32px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
        <h1 style="color:#7c3aed;font-size:24px;text-align:center;margin:0 0 8px">📊 Monthly Financial Report</h1>
        <p style="color:#6b7280;text-align:center;margin:0 0 24px">${monthName} 2026</p>
        
        <p style="color:#374151;font-size:16px">Hello <strong>${user.name}</strong>,</p>
        <p style="color:#4b5563;font-size:15px">Here's your financial summary for <strong>${monthName}</strong>:</p>
        
        <div style="display:flex;gap:12px;margin:24px 0">
          <div style="flex:1;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;padding:16px;text-align:center">
            <p style="color:#065f46;font-size:12px;margin:0 0 4px;font-weight:600;text-transform:uppercase">Income</p>
            <p style="color:#059669;font-size:22px;font-weight:800;margin:0">₹${stats.totalIncome.toFixed(2)}</p>
          </div>
          <div style="flex:1;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px;text-align:center">
            <p style="color:#991b1b;font-size:12px;margin:0 0 4px;font-weight:600;text-transform:uppercase">Expenses</p>
            <p style="color:#dc2626;font-size:22px;font-weight:800;margin:0">₹${stats.totalExpenses.toFixed(2)}</p>
          </div>
          <div style="flex:1;background:${net >= 0 ? '#eff6ff' : '#fff7ed'};border:1px solid ${net >= 0 ? '#bfdbfe' : '#fed7aa'};border-radius:10px;padding:16px;text-align:center">
            <p style="color:${net >= 0 ? '#1e40af' : '#9a3412'};font-size:12px;margin:0 0 4px;font-weight:600;text-transform:uppercase">Net Savings</p>
            <p style="color:${net >= 0 ? '#2563eb' : '#ea580c'};font-size:22px;font-weight:800;margin:0">₹${net.toFixed(2)}</p>
          </div>
        </div>

        <h2 style="color:#1f2937;font-size:18px;margin:28px 0 12px">Expenses by Category</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#374151">
          <thead>
            <tr style="background:#f9fafb">
              <th style="padding:10px 12px;text-align:left;font-weight:600;border-bottom:2px solid #e5e7eb">Category</th>
              <th style="padding:10px 12px;text-align:right;font-weight:600;border-bottom:2px solid #e5e7eb">Amount</th>
            </tr>
          </thead>
          <tbody>${categoryRows}</tbody>
          <tfoot>
            <tr style="background:#f3f4f6">
              <td style="padding:10px 12px;font-weight:700">Total</td>
              <td style="padding:10px 12px;text-align:right;font-weight:700">₹${stats.totalExpenses.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-top:28px;padding:16px;background:#faf5ff;border:1px solid #e9d5ff;border-radius:10px">
          <p style="color:#7c3aed;font-size:14px;font-weight:600;margin:0 0 8px">💡 Quick Summary</p>
          <p style="color:#4b5563;font-size:14px;margin:0">
            You earned <strong>₹${stats.totalIncome.toFixed(2)}</strong> and spent <strong>₹${stats.totalExpenses.toFixed(2)}</strong> this month.
            ${net >= 0 ? `You saved <strong style="color:#059669">₹${net.toFixed(2)}</strong>! 🎉` : `You overspent by <strong style="color:#dc2626">₹${Math.abs(net).toFixed(2)}</strong>. Try to cut back next month.`}
          </p>
        </div>

        <p style="color:#9ca3af;font-size:12px;text-align:center;margin:24px 0 0;border-top:1px solid #e5e7eb;padding-top:16px">
          Thank you for using FinGenius 💜 Keep tracking your finances for better financial health!
        </p>
      </div>
    </div>
  `;

  const info = await transporter.sendMail({
    from: smtpFrom,
    to: user.email,
    subject: `📊 Your Monthly Financial Report - ${monthName} 2026`,
    html,
  });

  return info;
}

async function main() {
  console.log("\n🚀 FinGenius Monthly Report Trigger\n");

  // Get all users
  const users = await db.user.findMany({ include: { accounts: true } });
  console.log(`Found ${users.length} user(s)\n`);

  const currentMonth = new Date();
  const monthName = currentMonth.toLocaleString("default", { month: "long" });

  for (const user of users) {
    console.log(`─── User: ${user.name} (${user.email || "NO EMAIL"}) ───`);

    if (!user.email || user.email.trim() === "") {
      console.log("  ⚠️  Skipping - no email set\n");
      continue;
    }

    // Get stats for current month (Feb 2026)
    const stats = await getMonthlyStats(user.id, currentMonth);

    console.log(`  📊 ${monthName} Stats:`);
    console.log(`     Income:   ₹${stats.totalIncome.toFixed(2)}`);
    console.log(`     Expenses: ₹${stats.totalExpenses.toFixed(2)}`);
    console.log(`     Net:      ₹${(stats.totalIncome - stats.totalExpenses).toFixed(2)}`);
    console.log(`     Transactions: ${stats.transactionCount}`);
    console.log(`     Categories:`, Object.keys(stats.byCategory).join(", "));

    if (stats.transactionCount === 0) {
      console.log("  ⚠️  No transactions found, skipping email\n");
      continue;
    }

    try {
      console.log(`  📧 Sending email to ${user.email}...`);
      const result = await sendReportEmail(user, stats, monthName);
      console.log(`  ✅ Email sent! Message ID: ${result.messageId}\n`);
    } catch (error) {
      console.error(`  ❌ Failed to send email: ${error.message}\n`);
    }
  }

  console.log("Done! 🎉\n");
  await db.$disconnect();
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
