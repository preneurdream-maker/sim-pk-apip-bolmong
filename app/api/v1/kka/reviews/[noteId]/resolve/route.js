// app/api/v1/kka/reviews/[noteId]/resolve/route.js
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req, { params }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const review = await prisma.kKAReview.findUnique({ where: { id: params.noteId } });
  if (!review) return NextResponse.json({ error: "Review tidak ditemukan" }, { status: 404 });

  const updated = await prisma.kKAReview.update({
    where: { id: params.noteId },
    data:  { isResolved: !review.isResolved },
  });

  return NextResponse.json(updated);
}
