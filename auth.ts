import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.AUTH_JWT_SECRET ?? process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/admin/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7
  },
  trustHost: true,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = typeof token.role === "string" ? token.role : "";
      }

      return session;
    }
  },
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {}
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            username: z.string().min(1),
            password: z.string().min(1)
          })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { username, password } = parsedCredentials.data;
        const user = await prisma.user.findUnique({
          where: { username }
        });

        if (!user || user.role !== "admin" || !verifyPassword(password, user.passwordHash)) {
          return null;
        }

        return {
          id: user.id,
          name: user.username,
          role: user.role
        };
      }
    })
  ]
});
