// app/api/v1/assignments/[id]/quality-evaluation/route.js — Quality Evaluation Submission
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { qualityEvaluationSchema } from "@/lib/validations";

export async function POST(req, { params }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const parsed = qualityEvaluationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { buktiAuditScore, rcaScore, rekomendasiScore, notes } = parsed.data;

  // Calculate Automated Total Quality Score (0-100%)
  const totalQualityScore = Math.round(((buktiAuditScore + rcaScore + rekomendasiScore) / 15) * 100);

  const evaluation = await prisma.qualityEvaluation.create({
    data: {
      engagementId:     id,
      evaluatorId:      session.user.id,
      buktiAuditScore,
      rcaScore,
      rekomendasiScore,
      totalQualityScore,
      notes,
    },
    include: {
      evaluator: { select: { fullName: true, role: true } },
    },
  });

  return NextResponse.json(evaluation);
}
