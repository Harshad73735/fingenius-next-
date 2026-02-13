import { seedTransactions } from "@/actions/seed";
import { NextResponse } from "next/server";

export async function GET(request) {
  const result = await seedTransactions();
  return NextResponse.json(result);
}
