import crypto from "crypto";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db/mongodb";
import User from "@/lib/models/User";
import RefreshToken from "@/lib/models/RefreshToken";

const ACCESS_TOKEN_MAX_AGE_SECONDS = 15 * 60; // 15 minutes
const REFRESH_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

function hashToken(raw: string) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

async function issueRefreshToken(userId: string) {
  const raw = crypto.randomBytes(48).toString("hex");
  await dbConnect();
  await RefreshToken.create({
    userId,
    tokenHash: hashToken(raw),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_SECONDS * 1000),
  });
  return raw;
}

async function revokeRefreshToken(raw?: string) {
  if (!raw) return;
  try {
    await dbConnect();
    await RefreshToken.updateOne({ tokenHash: hashToken(raw) }, { revoked: true });
  } catch (e) {
    console.error("[REVOKE REFRESH TOKEN ERROR]", e);
  }
}

// Validates the refresh token against the DB, rotates it, and mints a fresh
// 15-minute access-token window. Returns a token carrying `error` if the
// refresh token is missing, expired, or revoked.
async function refreshAccessToken(token: any) {
  try {
    const raw = token.refreshToken as string | undefined;
    if (!raw) {
      return { ...token, error: "RefreshTokenMissing" };
    }

    await dbConnect();
    const record = await RefreshToken.findOne({ tokenHash: hashToken(raw) });

    if (!record || record.revoked || record.expiresAt.getTime() < Date.now()) {
      return { ...token, error: "RefreshTokenExpired" };
    }

    // Rotate: invalidate the used refresh token and issue a new one.
    record.revoked = true;
    await record.save();
    const newRefreshToken = await issueRefreshToken(String(record.userId));

    return {
      ...token,
      refreshToken: newRefreshToken,
      accessTokenExpires: Date.now() + ACCESS_TOKEN_MAX_AGE_SECONDS * 1000,
      error: undefined,
    };
  } catch (err) {
    console.error("[REFRESH ACCESS TOKEN ERROR]", err);
    return { ...token, error: "RefreshTokenExpired" };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await dbConnect();

          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    // Outer session cookie lifetime = the refresh-token window. NextAuth
    // slides this forward on activity (session.updateAge, default 24h).
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  },
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in: mint a fresh access token (15 min) and a DB-backed
      // refresh token (7 days).
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.refreshToken = await issueRefreshToken((user as any).id);
        token.accessTokenExpires = Date.now() + ACCESS_TOKEN_MAX_AGE_SECONDS * 1000;
        delete (token as any).error;
        return token;
      }

      // Access token still valid — nothing to do.
      if (typeof token.accessTokenExpires === "number" && Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Access token expired — validate + rotate the refresh token.
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token.error) {
        (session as any).error = token.error;
        return session;
      }
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as "user" | "consultant" | "trainer" | "admin";
        (session as any).accessTokenExpires = token.accessTokenExpires;
      }
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      await revokeRefreshToken((token as any)?.refreshToken);
    },
  },
  pages: {
    signIn: "/login",
  },
};
