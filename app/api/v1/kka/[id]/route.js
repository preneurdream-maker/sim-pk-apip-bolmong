// app/api/v1/kka/[id]/route.js — GET, PATCH single KKA
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { kkaSchema } from "@/lib/validations";

export async function GET(req, { params }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const kka = await prisma.kKA.findFirst({
    where: {
      id: params.id,
      OR: [
        { createdById: session.user.id },
        { status: "SUBMITTED" },
        { status: "APPROVED" },
      ],
    },
    include: {
      engagement: true,
      evidens:    true,
      reviews:    { include: { reviewer: { select: { fullName: true } } }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!kka) return NextResponse.json({ error: "KKA tidak ditemukan" }, { status: 404 });

  return NextResponse.json({ ...kka, nilaiKerugian: kka.nilaiKerugian?.toString() });
}

export async function PATCH(req, { params }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Cegah edit jika SUBMITTED atau APPROVED dan bukan DALNIS/IRBAN/ADMIN
  const existing = await prisma.kKA.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "KKA tidak ditemukan" }, { status: 404 });

  const editableSelf = ["DRAFT", "REVISION"].includes(existing.status) &&
    existing.createdById === session.user.id;
  const canForceEdit = ["IRBAN", "ADMIN"].includes(session.user.role);

  if (!editableSelf && !canForceEdit) {
    return NextResponse.json({ error: "KKA ini tidak dapat diedit saat ini." }, { status: 403 });
  }

  const updated = await prisma.kKA.update({
    where: { id: params.id },
    data: {
      kondisi:      body.kondisi,
      kriteria:     body.kriteria,
      sebab:        body.sebab,
      akibat:       body.akibat,
      rekomendasi:  body.rekomendasi,
      nilaiKerugian: body.nilaiKerugian != null ? BigInt(body.nilaiKerugian) : undefined,
      status:       body.status || existing.status,
    },
    include: { engagement: true, reviews: { include: { reviewer: { select: { fullName: true } } } } },
  });

  return NextResponse.json({ ...updated, nilaiKerugian: updated.nilaiKerugian?.toString() });
}
