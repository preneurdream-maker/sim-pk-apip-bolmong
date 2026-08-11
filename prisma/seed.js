// prisma/seed.js — Buat user awal untuk semua role
// Jalankan dengan: node prisma/seed.js

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma  = new PrismaClient({ adapter });

const DEFAULT_PASSWORD = "Inspektorat@2026"; // wajib ganti saat login pertama

async function main() {
  console.log("🌱 Seeding database SIM-PK APIP...");

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  const users = [
    {
      email:    "admin@inspektorat-bolmong.go.id",
      nip:      "198001012003121001",
      fullName: "Administrator Sistem",
      role:     "ADMIN",
    },
    {
      email:    "inspektur@inspektorat-bolmong.go.id",
      nip:      "197505152000031002",
      fullName: "Inspektur Daerah",
      role:     "IRBAN",
    },
    {
      email:    "irban1@inspektorat-bolmong.go.id",
      nip:      "198003022004121003",
      fullName: "Irban Wilayah I",
      role:     "IRBAN",
    },
    {
      email:    "dalnis@inspektorat-bolmong.go.id",
      nip:      "198507152008011004",
      fullName: "Pengendali Teknis (Dalnis / Irban)",
      role:     "IRBAN",
    },
    {
      email:    "auditor1@inspektorat-bolmong.go.id",
      nip:      "199001012015031005",
      fullName: "Auditor Pertama",
      role:     "AUDITOR",
    },
    {
      email:    "auditor2@inspektorat-bolmong.go.id",
      nip:      "199205252016022006",
      fullName: "Auditor Muda",
      role:     "AUDITOR",
    },
    {
      email:    "dinkes@bolmong.go.id",
      nip:      null,
      fullName: "Dinas Kesehatan Kab. Bolmong",
      role:     "OPD",
      opdName:  "Dinas Kesehatan",
    },
    {
      email:    "evaluator@bpkp.go.id",
      nip:      null,
      fullName: "Evaluator BPKP Sulawesi Utara",
      role:     "BPKP",
    },
  ];

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where:  { email: userData.email },
      update: {},
      create: {
        ...userData,
        password:          hashedPassword,
        isPasswordDefault: true,
        isActive:          true,
      },
    });
    console.log(`  ✓ ${user.role.padEnd(8)} — ${user.fullName} (${user.email})`);
  }

  // Seed initial TLHP Recommendations for OPD Dinkes
  const sampleTLHP = [
    {
      recommendation: "Penyetoran sisa kelebihan pembayaran belanja modal gedung kantor ke Kas Daerah.",
      opdName: "Dinas Kesehatan",
      lhpOrigin: "LHP Kepatuhan LKPD Tahun 2025",
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      nilaiKerugian: BigInt(45000000),
      nilaiSetorKerugian: BigInt(0),
      status: "BELUM_DITINDAKLANJUTI",
    },
    {
      recommendation: "Penyusunan dan pengesahan SOP Pelaksanaan Administrasi Penatausahaan Barang Milik Daerah.",
      opdName: "Dinas Kesehatan",
      lhpOrigin: "LHP Kinerja Pelayanan Kesehatan 2025",
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      nilaiKerugian: BigInt(0),
      nilaiSetorKerugian: BigInt(0),
      status: "BELUM_SESUAI",
      opdNotes: "Draft SOP sudah disusun, menunggu penandatanganan Kepala Dinas.",
    },
    {
      recommendation: "Pengembalian honorarium ganda atas kegiatan penyuluhan kesehatan.",
      opdName: "Dinas Kesehatan",
      lhpOrigin: "LHP Kepatuhan BOK 2025",
      deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      nilaiKerugian: BigInt(12500000),
      nilaiSetorKerugian: BigInt(12500000),
      status: "MENUNGGU_VERIFIKASI",
      opdNotes: "Telah disetor lunas via Bank SulutGo STS No. 049/STS/DINKES/2026.",
    },
    {
      recommendation: "Perbaikan inventarisir aset alat kesehatan di Puskesmas Dumoga.",
      opdName: "Dinas Kesehatan",
      lhpOrigin: "LHP Sistem Pengendalian Intern 2025",
      deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
      nilaiKerugian: BigInt(0),
      nilaiSetorKerugian: BigInt(0),
      status: "SESUAI",
      auditorVerification: "Telah diverifikasi sesuai dengan hasil cek fisik Tim APIP.",
    },
  ];

  for (const item of sampleTLHP) {
    await prisma.tLHPItem.create({ data: item });
  }
  console.log("  ✓ TLHP Recommendations seeded for OPD.");

  console.log("\n✅ Seeding selesai!");
  console.log(`\n📋 Default password semua user: ${DEFAULT_PASSWORD}`);
  console.log("⚠️  User wajib mengganti password saat login pertama kali.\n");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
