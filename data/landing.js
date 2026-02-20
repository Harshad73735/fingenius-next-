import {
  BarChart3,
  Receipt,
  PieChart,
  CreditCard,
  Globe,
  Zap,
} from "lucide-react";

// Features Data
export const featuresData = [
  {
    icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
    title: "Advanced Analytics",
    description:
      "Get detailed insights into your spending patterns with AI-powered analytics",
  },
  {
    icon: <Receipt className="h-8 w-8 text-blue-600" />,
    title: "Smart Receipt Scanner",
    description:
      "Extract data automatically from receipts using advanced AI technology",
  },
  {
    icon: <PieChart className="h-8 w-8 text-blue-600" />,
    title: "Budget Planning",
    description: "Create and manage budgets with intelligent recommendations",
  },
  {
    icon: <CreditCard className="h-8 w-8 text-blue-600" />,
    title: "Multi-Account Support",
    description: "Manage multiple accounts and credit cards in one place",
  },
  {
    icon: <Globe className="h-8 w-8 text-blue-600" />,
    title: "Multi-Currency",
    description: "Support for multiple currencies with real-time conversion",
  },
  {
    icon: <Zap className="h-8 w-8 text-blue-600" />,
    title: "Automated Insights",
    description: "Get automated financial insights and recommendations",
  },
];
