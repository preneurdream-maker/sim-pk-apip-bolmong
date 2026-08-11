// app/api/v1/kka/route.js — GET list & POST create KKA
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { kkaSchema } from "@/lib/validations";

export async function GET(req) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const kkaList = await prisma.kKA.findMany({
    where:   { createdById: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { engagement: { select: { title: true } }, _count: { select: { evidens: true, reviews: true } } },
  });

  return NextResponse.json(kkaList);
}

export async function POST(req) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body   = await req.json();
  const parsed = kkaSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  // Find or create a default engagement for this auditor
  let engagement = await prisma.auditEngagement.findFirst({
    where: { auditorId: session.user.id, status: "ACTIVE" },
  });

  if (!engagement) {
    engagement = await prisma.auditEngagement.create({
      data: {
        title:     "Penugasan Baru",
        auditorId: session.user.id,
        status:    "ACTIVE",
      },
    });
  }

  const kka = await prisma.kKA.create({
    data: {
      engagementId:  engagement.id,
      createdById:   session.user.id,
      kondisi:       parsed.data.kondisi,
      kriteria:      parsed.data.kriteria,
      sebab:         parsed.data.sebab,
      akibat:        parsed.data.akibat,
      rekomendasi:   parsed.data.rekomendasi,
      nilaiKerugian: BigInt(parsed.data.nilaiKerugian || 0),
      status:        body.status || "DRAFT",
    },
    include: { engagement: true, reviews: { include: { reviewer: true } } },
  });

  return NextResponse.json({ ...kka, nilaiKerugian: kka.nilaiKerugian.toString() });
}
