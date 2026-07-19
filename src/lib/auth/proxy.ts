import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "./session";

const PUBLIC_PATHS = ["/login"];

export async function checkSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const isPublicPath = PUBLIC_PATHS.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (!session && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}
