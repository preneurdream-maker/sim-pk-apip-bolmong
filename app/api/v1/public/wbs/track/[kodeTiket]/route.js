// app/api/v1/public/wbs/track/[kodeTiket]/route.js — Track Public WBS Report by Ticket Code
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const { kodeTiket } = await params;

    if (!kodeTiket) {
      return NextResponse.json({ error: "Kode tiket tidak valid" }, { status: 400 });
    }

    const report = await prisma.wbsReport.findFirst({
      where: {
        ticketCode: {
          equals: kodeTiket.trim().toUpperCase(),
          mode:   "insensitive",
        },
      },
      select: {
        ticketCode:   true,
        category:     true,
        title:        true,
        description:  true,
        status:       true,
        apipResponse: true,
        createdAt:    true,
        updatedAt:    true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Pengaduan dengan kode tiket tersebut tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal melacak pengaduan WBS." }, { status: 500 });
  }
}
