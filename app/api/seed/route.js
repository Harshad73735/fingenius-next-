import { seedAccountData } from "@/actions/seed";
import { NextResponse } from "next/server";

export async function GET(request) {
  const result = await seedAccountData();
  return NextResponse.json(result);
}
