import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { verifySession } from "@/lib/dal";
import { buildMetaAuthUrl, isMetaConfigured } from "@/lib/channels/meta/oauth";

export async function GET(request: NextRequest) {
  await verifySession(); // ensures the merchant is authenticated; redirects otherwise

  if (!isMetaConfigured()) {
    const url = new URL("/campaigns/new", request.url);
    url.searchParams.set(
      "meta_error",
      "لم يتم إعداد تكامل Meta بعد — يلزم إضافة META_APP_ID وMETA_APP_SECRET",
    );
    return NextResponse.redirect(url);
  }

  const state = randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("meta_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return NextResponse.redirect(buildMetaAuthUrl(state));
}
