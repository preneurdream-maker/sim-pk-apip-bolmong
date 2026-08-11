// app/api/v1/sdm/jpl-log/route.js — Log Auditor Training JPL & Certificate
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jplLogSchema } from "@/lib/validations";

export async function POST(req) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = jplLogSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { auditorSdmId, trainingName, organizer, jplHours, certificateUrl } = parsed.data;

  // Create JPL Log
  const jplLog = await prisma.jplLog.create({
    data: {
      auditorSdmId,
      trainingName,
      organizer,
      jplHours,
      certificateUrl: certificateUrl || "Sertifikat_Diklat_Auditor.pdf",
    },
  });

  // Automatically increment auditor's current cumulative JPL
  await prisma.auditorSdm.update({
    where: { id: auditorSdmId },
    data: {
      currentJpl: { increment: jplHours },
    },
  });

  return NextResponse.json(jplLog);
}
