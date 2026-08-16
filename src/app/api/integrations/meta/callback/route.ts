import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import {
  exchangeCodeForToken,
  exchangeForLongLivedToken,
  fetchAdAccounts,
  fetchPagesWithInstagram,
} from "@/lib/channels/meta/oauth";

export async function GET(request: NextRequest) {
  const { merchantId } = await verifySession();
  const redirectTo = new URL("/campaigns/new", request.url);

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const errorParam = request.nextUrl.searchParams.get("error_message");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get("meta_oauth_state")?.value;
  cookieStore.delete("meta_oauth_state");

  if (errorParam) {
    redirectTo.searchParams.set("meta_error", errorParam);
    return NextResponse.redirect(redirectTo);
  }
  if (!code || !state || state !== expectedState) {
    redirectTo.searchParams.set("meta_error", "فشل التحقق من طلب الربط مع Meta (state mismatch)");
    return NextResponse.redirect(redirectTo);
  }

  try {
    const shortLived = await exchangeCodeForToken(code);
    const longLived = await exchangeForLongLivedToken(shortLived.access_token);

    const [adAccounts, pages] = await Promise.all([
      fetchAdAccounts(longLived.access_token),
      fetchPagesWithInstagram(longLived.access_token),
    ]);

    const adAccount = adAccounts[0];
    const page = pages.find((p) => p.instagram_business_account) ?? pages[0];

    if (!adAccount) {
      redirectTo.searchParams.set(
        "meta_error",
        "لم يتم العثور على حساب إعلانات مرتبط بهذا الحساب على Meta",
      );
      return NextResponse.redirect(redirectTo);
    }

    await prisma.channelConnection.upsert({
      where: { merchantId_provider: { merchantId, provider: "INSTAGRAM" } },
      update: {
        status: "CONNECTED",
        accessToken: longLived.access_token,
        externalAccountId: adAccount.id.replace(/^act_/, ""),
        externalAccountName: adAccount.name,
        pageId: page?.id ?? null,
        instagramActorId: page?.instagram_business_account?.id ?? null,
        connectedAt: new Date(),
        expiresAt: new Date(Date.now() + longLived.expires_in * 1000),
      },
      create: {
        merchantId,
        provider: "INSTAGRAM",
        status: "CONNECTED",
        accessToken: longLived.access_token,
        externalAccountId: adAccount.id.replace(/^act_/, ""),
        externalAccountName: adAccount.name,
        pageId: page?.id ?? null,
        instagramActorId: page?.instagram_business_account?.id ?? null,
        connectedAt: new Date(),
        expiresAt: new Date(Date.now() + longLived.expires_in * 1000),
      },
    });

    redirectTo.searchParams.set("meta_connected", "1");
    return NextResponse.redirect(redirectTo);
  } catch (error) {
    redirectTo.searchParams.set(
      "meta_error",
      error instanceof Error ? error.message : "تعذّر إكمال الربط مع Meta",
    );
    return NextResponse.redirect(redirectTo);
  }
}
