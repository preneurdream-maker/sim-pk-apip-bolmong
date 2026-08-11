// app/api/v1/bpkp/assessment/route.js — Submit BPKP Score & Evidence Validation
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bpkpAssessmentSchema } from "@/lib/validations";

export async function POST(req) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = bpkpAssessmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { topicId, bpkpScore, validationStatus, bpkpNotes } = parsed.data;

  const assessment = await prisma.pkAssessment.upsert({
    where: { topicId },
    update: {
      bpkpScore,
      validationStatus,
      bpkpNotes,
      evaluatorId: session.user.id,
    },
    create: {
      topicId,
      selfScore: 3,
      bpkpScore,
      validationStatus,
      bpkpNotes,
      evaluatorId: session.user.id,
    },
  });

  return NextResponse.json(assessment);
}
