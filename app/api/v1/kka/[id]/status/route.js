// app/api/v1/kka/[id]/status/route.js — Update KKA Status & Summary Note
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { kkaStatusUpdateSchema } from "@/lib/validations";

export async function PUT(req, { params }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const parsed = kkaStatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const existingKKA = await prisma.kKA.findUnique({ where: { id } });
  if (!existingKKA) {
    return NextResponse.json({ error: "KKA tidak ditemukan" }, { status: 404 });
  }

  const updateData = {
    status: parsed.data.status,
    ...(parsed.data.summaryNote ? { summaryNote: parsed.data.summaryNote } : {}),
  };

  if (["APPROVED_BY_DALNIS", "APPROVED"].includes(parsed.data.status)) {
    updateData.dalnisSignature = `${session.user.fullName} (${session.user.nip || "NIP. -"}`;
  }

  const updatedKKA = await prisma.kKA.update({
    where: { id },
    data: updateData,
    include: {
      engagement: true,
      reviews: { include: { reviewer: { select: { fullName: true } } } },
    },
  });

  return NextResponse.json({
    ...updatedKKA,
    nilaiKerugian: updatedKKA.nilaiKerugian?.toString(),
  });
}
