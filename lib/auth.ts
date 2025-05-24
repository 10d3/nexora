import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { env } from "../env";

// Define if we're in a Vercel deployment environment
// const VERCEL_DEPLOYMENT = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL;

// Define sign-in schema for validation
const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1), // Changed from min(6) to min(1) to allow any password length during validation
});

// Extend the built-in session types
declare module "next-auth" {
  interface User {
    id?: string | undefined;
    role?: string;
    tenantId?: string;
  }

  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      tenantId?: string;
    };
  }
}

// Extend JWT type
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    tenantId?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-out",
    // error: "/pos/error",
  },
  // Add the secret from environment variables
  secret: env.AUTH_SECRET,
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate credentials
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials");
            return null;
          }

          // Parse credentials with schema
          const { email, password } =
            await signInSchema.parseAsync(credentials);

          // Find user in database
          const user = await prisma.user.findUnique({
            where: {
              email,
            },
          });

          // Check if user exists
          if (!user) {
            console.log("User not found");
            return null;
          }

          // Verify password
          const passwordMatch = await bcrypt.compare(password, user.password);

          if (!passwordMatch) {
            console.log("Password doesn't match");
            return null;
          }

          // Return user data - convert null to undefined for tenantId
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId || undefined, // Convert null to undefined
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Only assign properties if they exist
        if (user.id) token.id = user.id;
        if (user.role) token.role = user.role;
        if (user.tenantId) token.tenantId = user.tenantId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // Only assign properties if they exist
        if (token.id) session.user.id = token.id;
        if (token.role) session.user.role = token.role;
        if (token.tenantId) session.user.tenantId = token.tenantId;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
});
