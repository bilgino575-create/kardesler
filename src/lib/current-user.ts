import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth/session";

export async function getCurrentAppUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session) return null;

  return prisma.user.findUnique({ where: { id: session.userId } });
}
