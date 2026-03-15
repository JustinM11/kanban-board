// src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1. Check if email and password were provided
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // 2. Find the user in the database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // 3. If no user found, reject
        if (!user) {
          throw new Error("No account found with this email");
        }

        // 4. Compare the password with the hashed one in the database
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordValid) {
          throw new Error("Incorrect password");
        }

        // 5. Return the user object (this becomes the session)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt", // Use JSON Web Tokens for sessions
  },
  callbacks: {
    // Include the user ID in the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    // Include the user ID in the session object
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Custom login page (we'll build this tomorrow)
  },
};
