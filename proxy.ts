import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const COOKIE_NAME = "rawwij_session";
const protectedPrefixes = ["/campaigns"];
const publicRoutes = ["/", "/login", "/signup"];

async function hasValidSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    const secretKey = process.env.SESSION_SECRET;
    if (!secretKey) return false;
    await jwtVerify(token, new TextEncoder().encode(secretKey), {
      algorithms: ["HS256"],
    });
    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtected = protectedPrefixes.some((p) => path.startsWith(p));
  const isPublic = publicRoutes.includes(path);

  const authed = await hasValidSession();

  if (isProtected && !authed) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (isPublic && authed && path !== "/") {
    return NextResponse.redirect(new URL("/campaigns/new", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|fonts|favicon.ico).*)"],
};
