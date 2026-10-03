import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** Thin wrapper so pages/actions read the same regardless of auth library version. */
export async function auth() {
  return getServerSession(authOptions);
}

export function canReview(role: string | undefined): boolean {
  return role === "ADMIN" || role === "HR";
}

export function isAdmin(role: string | undefined): boolean {
  return role === "ADMIN";
}
