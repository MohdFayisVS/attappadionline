import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("=== AUTH DEBUG ===");
        console.log("1. Email received:", credentials?.email);
        console.log("2. Password received:", credentials?.password ? "YES" : "NO");

        if (!credentials?.email || !credentials?.password) {
          console.log("3. FAIL: Missing credentials");
          throw new Error("Missing credentials");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          console.log("4. User found:", user ? "YES" : "NO");
          if (user) {
            console.log("5. DB hash prefix:", user.password?.substring(0, 15));
            console.log("6. User role:", user.role);
          }

          if (!user || !user.password) {
            console.log("7. FAIL: No user in DB");
            throw new Error("Invalid credentials");
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          console.log("8. bcrypt.compare result:", isValid);

          if (!isValid) {
            console.log("9. FAIL: Password mismatch");
            throw new Error("Invalid credentials");
          }

          console.log("10. SUCCESS: Returning user");
          return { id: user.id, name: user.name, email: user.email, role: user.role };

        } catch (err) {
          console.log("ERROR in authorize:", err);
          throw err;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
