// app/api/v1/public/wbs/route.js — Public WBS & Gratifikasi Report Submission
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { wbsReportSchema } from "@/lib/validations";

function generateTicketCode() {
  const year = new Date().getFullYear();
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `WBS-${year}-${randomChars}`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = wbsReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { isAnonymous, reporterName, reporterContact, category, title, description, evidenceUrl } = parsed.data;

    let ticketCode = generateTicketCode();
    // Ensure uniqueness
    let exists = await prisma.wbsReport.findUnique({ where: { ticketCode } });
    while (exists) {
      ticketCode = generateTicketCode();
      exists = await prisma.wbsReport.findUnique({ where: { ticketCode } });
    }

    const report = await prisma.wbsReport.create({
      data: {
        ticketCode,
        isAnonymous,
        reporterName:    isAnonymous ? "ANONIM" : reporterName,
        reporterContact: isAnonymous ? "-" : reporterContact,
        category,
        title,
        description,
        evidenceUrl:     evidenceUrl || null,
        status:          "DITERIMA",
      },
    });

    return NextResponse.json({
      success: true,
      ticketCode: report.ticketCode,
      report,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal mengirim pengaduan WBS." }, { status: 500 });
  }
}
