import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Google solo se habilita si hay credenciales reales configuradas.
// Evita que el botón "Login con Google" rompa cuando GOOGLE_CLIENT_ID
// está vacío o en "none" (placeholder).
const googleId = process.env.GOOGLE_CLIENT_ID;
const googleSecret = process.env.GOOGLE_CLIENT_SECRET;
const hasGoogle = !!googleId && !!googleSecret && googleId !== "none" && googleSecret !== "none";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    ...(hasGoogle
      ? [
          GoogleProvider({
            clientId: googleId!,
            clientSecret: googleSecret!,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });

        if (!user || !user.hashedPassword) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        );

        if (!isValid) return null;

        return user;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Fetch fresh subscriptionTier if needed or cast from user object
        // Since user type returned from authorize contains subscriptionTier (if extended)
        // NextAuth user type doesn't have it by default, we just assert any.
        const dbUser = await prisma.user.findUnique({ where: { id: user.id }});
        token.subscriptionTier = dbUser?.subscriptionTier || "starter";
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).subscriptionTier = token.subscriptionTier as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  }
});
