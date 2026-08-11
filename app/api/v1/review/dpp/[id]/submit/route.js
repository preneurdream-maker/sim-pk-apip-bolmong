// app/api/v1/review/dpp/[id]/submit/route.js — Submit Compiled Draft LHP to Irban
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req, { params }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const engagement = await prisma.auditEngagement.update({
    where: { id },
    data:  { status: "SUBMITTED_TO_IRBAN" },
  });

  return NextResponse.json({ success: true, engagement });
}
