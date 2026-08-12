// lib/auth.js — NextAuth v5 Configuration (Node.js runtime, PAKAI Prisma)
// Jangan pernah import file ini dari proxy.js/middleware — pakai
// lib/auth.config.js untuk itu, karena file ini menyeret Prisma +
// bcryptjs yang tidak kompatibel dengan Edge runtime.
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        credential: { label: "NIP / Email", type: "text" },
        password:   { label: "Password",    type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.credential || !credentials?.password) {
          throw new Error("NIP/Email dan Password wajib diisi.");
        }

        // Cari user berdasarkan email ATAU nip
        const user = await prisma.user.findFirst({
          where: {
            AND: [
              { isActive: true },
              {
                OR: [
                  { email: credentials.credential },
                  { nip:   credentials.credential },
                ],
              },
            ],
          },
        });

        if (!user) {
          throw new Error("Akun tidak ditemukan atau tidak aktif.");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Password salah. Silakan coba lagi.");
        }

        return {
          id:                user.id,
          email:             user.email,
          fullName:          user.fullName,
          nip:               user.nip,
          role:              user.role,
          isPasswordDefault: user.isPasswordDefault,
        };
      },
    }),
  ],
});
