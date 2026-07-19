"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/");

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user?.passwordHash
    ? await verifyPassword(password, user.passwordHash)
    : false;

  if (!user || !valid) {
    redirect(
      `/login?error=${encodeURIComponent("E-posta veya şifre hatalı.")}&redirectTo=${encodeURIComponent(redirectTo)}`,
    );
  }

  if (user.status !== "ACTIVE") {
    redirect(
      `/login?error=${encodeURIComponent("Hesabınız pasif durumda. Yönetici ile iletişime geçin.")}`,
    );
  }

  const token = await createSessionToken(user.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions);

  redirect(redirectTo);
}
