import { type NextRequest } from "next/server";
import { checkSession } from "@/lib/auth/proxy";

export async function proxy(request: NextRequest) {
  return checkSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
