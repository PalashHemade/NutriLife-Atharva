import "next-auth";
import { DefaultSession } from "next-auth";

// Augment the core next-auth types to include role
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "user" | "consultant" | "trainer" | "admin";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "user" | "consultant" | "trainer" | "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "user" | "consultant" | "trainer" | "admin";
  }
}
