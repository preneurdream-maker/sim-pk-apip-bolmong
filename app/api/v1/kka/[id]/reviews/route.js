// app/api/v1/kka/[id]/reviews/route.js — Add Tagged Correction Note (Ketua Tim & Dalnis)
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewNoteSchema } from "@/lib/validations";

export async function POST(req, { params }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const parsed = reviewNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const kka = await prisma.kKA.findUnique({ where: { id } });
  if (!kka) {
    return NextResponse.json({ error: "KKA tidak ditemukan" }, { status: 404 });
  }

  // Create review note
  const reviewNote = await prisma.kKAReview.create({
    data: {
      kkaId:      id,
      reviewerId: session.user.id,
      sectionTag: parsed.data.sectionTag,
      note:       parsed.data.note,
      status:     "OPEN",
      isResolved: false,
    },
    include: {
      reviewer: { select: { fullName: true, role: true } },
    },
  });

  return NextResponse.json(reviewNote);
}
