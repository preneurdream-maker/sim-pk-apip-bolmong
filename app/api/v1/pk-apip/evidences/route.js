// app/api/v1/pk-apip/evidences/route.js — Upload PK APIP Evidence File
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pkEvidenceUploadSchema } from "@/lib/validations";

export async function POST(req) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = pkEvidenceUploadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { topicId, fileName, uploadedBy } = parsed.data;

  // Get current evidence count for versioning
  const existingCount = await prisma.pkEvidence.count({ where: { topicId } });
  const version = existingCount + 1;

  const newEvidence = await prisma.pkEvidence.create({
    data: {
      topicId,
      fileName,
      fileSize: "2.1 MB",
      version,
      uploadedBy: uploadedBy || session.user.fullName,
    },
  });

  return NextResponse.json(newEvidence);
}
