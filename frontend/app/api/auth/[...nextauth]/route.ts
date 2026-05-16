import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// ── Extend next-auth types with our backend JWT ──────────────────────────────
declare module "next-auth" {
  interface Session {
    backendToken?: string;
    backendUser?: { id: string; email?: string | null; role: string };
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    backendToken?: string;
    backendUser?: { id: string; email?: string | null; role: string };
  }
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    /**
     * Runs on every sign-in and token refresh.
     * On first Google sign-in (account is present), exchange the Google
     * profile for a SchoolSetu backend JWT and store it in the NextAuth token.
     */
    async jwt({ token, account, profile }) {
      // First sign-in: account is populated. Exchange Google profile for backend JWT.
      if (account?.provider === "google" && profile?.sub && profile?.email) {
        console.log("[NextAuth jwt] Google sign-in detected for", profile.email);
        try {
          const res = await fetch(`${BACKEND_URL}/api/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: profile.email,
              name: profile.name ?? undefined,
              googleId: profile.sub,
            }),
          });

          if (res.ok) {
            const data = (await res.json()) as {
              token: string;
              user: { id: string; email?: string | null; role: string };
            };
            console.log("[NextAuth jwt] Backend token received, role:", data.user?.role, "id:", data.user?.id);
            token.backendToken = data.token;
            token.backendUser = data.user;
          } else {
            const body = await res.text();
            console.error("[NextAuth jwt] Backend returned", res.status, body);
          }
        } catch (err) {
          console.error("[NextAuth jwt] Fetch to backend failed:", err);
        }
      } else if (token.backendToken) {
        // Subsequent requests — token already has backend data, nothing to do.
        console.log("[NextAuth jwt] Reusing existing token, role:", token.backendUser?.role);
      }
      return token;
    },

    /** Expose backendToken + backendUser to the client-side session. */
    async session({ session, token }) {
      session.backendToken = token.backendToken;
      session.backendUser = token.backendUser;
      if (!token.backendToken) {
        console.warn("[NextAuth session] backendToken is missing from token — backend exchange may have failed");
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/parent/login",
    error: "/auth/parent/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
