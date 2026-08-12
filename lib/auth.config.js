// lib/auth.config.js — Edge-safe NextAuth config
// PENTING: file ini TIDAK BOLEH import Prisma, bcryptjs, atau apapun
// yang bergantung ke native Node.js addon. File ini dipakai oleh
// middleware (Edge runtime), jadi harus "ringan".

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
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
  // Providers SENGAJA dikosongkan di sini — provider yang butuh Prisma
  // hanya didaftarkan di lib/auth.js (yang jalan di Node.js runtime penuh).
  providers: [],
};

export default authConfig;
