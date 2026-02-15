import React from "react";
import { Html, Body, Container, Text, Heading, Link, Section } from "@react-email/components";

export default function BudgetAlertEmail({
  userName = "Valued User",
  budgetAmount = 0,
  currentExpenses = 0,
  percentageExceeded = 0,
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <Html>
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f5f5f5", padding: "20px" }}>
        <Container style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "30px", maxWidth: "600px" }}>
          <Heading style={{ color: "#dc2626", fontSize: "28px", marginBottom: "20px" }}>
            ⚠️ Budget Alert!
          </Heading>

          <Text style={{ color: "#333", fontSize: "16px", lineHeight: "1.5" }}>
            Hi {userName},
          </Text>

          <Text style={{ color: "#333", fontSize: "16px", lineHeight: "1.5" }}>
            Your monthly expenses have exceeded your budget limit. Here are the details:
          </Text>

          <Section
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fca5a5",
              borderRadius: "6px",
              padding: "20px",
              marginY: "20px",
            }}
          >
            <Text style={{ color: "#991b1b", fontSize: "14px", margin: "0 0 10px 0" }}>
              <strong>Budget Limit:</strong> ${budgetAmount.toFixed(2)}
            </Text>
            <Text style={{ color: "#991b1b", fontSize: "14px", margin: "0 0 10px 0" }}>
              <strong>Current Expenses:</strong> ${currentExpenses.toFixed(2)}
            </Text>
            <Text style={{ color: "#991b1b", fontSize: "14px", margin: "0" }}>
              <strong>Exceeded By:</strong> {percentageExceeded}%
            </Text>
          </Section>

          <Text style={{ color: "#333", fontSize: "16px", lineHeight: "1.5" }}>
            Please log in to your account to review your transactions and manage your expenses.
          </Text>

          <Link
            href={`${appUrl}/dashboard`}
            style={{
              display: "inline-block",
              backgroundColor: "#3b82f6",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: "6px",
              textDecoration: "none",
              marginTop: "20px",
              marginBottom: "20px",
            }}
          >
            View Dashboard
          </Link>

          <Text style={{ color: "#666", fontSize: "14px", marginTop: "40px" }}>
            Best regards,
            <br />
            FinGenius Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
