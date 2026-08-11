// app/api/v1/opd/recommendations/route.js — RLS Filtered OPD Recommendations
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Row-Level Security: Filter strictly by logged in OPD user's opdName
  const opdFilter = session.user.role === "ADMIN" ? {} : { opdName: session.user.opdName || session.user.fullName };

  const items = await prisma.tLHPItem.findMany({
    where: opdFilter,
    orderBy: { updatedAt: "desc" },
    include: { proofs: true, engagement: { select: { title: true } } },
  });

  const formatted = items.map((item) => ({
    ...item,
    nilaiKerugian: item.nilaiKerugian?.toString(),
    nilaiSetorKerugian: item.nilaiSetorKerugian?.toString(),
  }));

  return NextResponse.json(formatted);
}
