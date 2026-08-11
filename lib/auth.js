// lib/auth.js — NextAuth v5 Configuration
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getRoleDashboardPath } from "@/lib/utils";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error:  "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id                = user.id;
        token.role              = user.role;
        token.fullName          = user.fullName;
        token.nip               = user.nip;
        token.isPasswordDefault = user.isPasswordDefault;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id                = token.id;
        session.user.role              = token.role;
        session.user.fullName          = token.fullName;
        session.user.nip               = token.nip;
        session.user.isPasswordDefault = token.isPasswordDefault;
      }
      return session;
    },
  },
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
