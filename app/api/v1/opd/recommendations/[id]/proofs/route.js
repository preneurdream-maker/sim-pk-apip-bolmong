// app/api/v1/opd/recommendations/[id]/proofs/route.js — Submit TLHP Proof & Action
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tlhpProofSchema } from "@/lib/validations";

export async function POST(req, { params }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const parsed = tlhpProofSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { opdNotes, nilaiSetorKerugian, fileName } = parsed.data;

  // Create proof record if file attached
  if (fileName) {
    await prisma.tlhpProof.create({
      data: {
        tlhpId: id,
        fileName,
        fileSize: "1.5 MB",
      },
    });
  }

  // Update TLHP Recommendation status to MENUNGGU_VERIFIKASI
  const updatedItem = await prisma.tLHPItem.update({
    where: { id },
    data: {
      opdNotes,
      nilaiSetorKerugian: nilaiSetorKerugian ? BigInt(nilaiSetorKerugian) : undefined,
      status: "MENUNGGU_VERIFIKASI",
    },
    include: { proofs: true },
  });

  return NextResponse.json({
    ...updatedItem,
    nilaiKerugian: updatedItem.nilaiKerugian?.toString(),
    nilaiSetorKerugian: updatedItem.nilaiSetorKerugian?.toString(),
  });
}
