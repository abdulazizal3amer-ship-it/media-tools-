import "server-only";

const API_VERSION = process.env.META_API_VERSION || "v23.0";
const GRAPH_BASE = `https://graph.facebook.com/${API_VERSION}`;

function requireEnv() {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri = process.env.META_REDIRECT_URI;
  if (!appId || !appSecret || !redirectUri) {
    throw new Error(
      "Meta integration is not configured — set META_APP_ID, META_APP_SECRET, META_REDIRECT_URI",
    );
  }
  return { appId, appSecret, redirectUri };
}

export function isMetaConfigured() {
  return Boolean(
    process.env.META_APP_ID && process.env.META_APP_SECRET && process.env.META_REDIRECT_URI,
  );
}

/** Builds the real Meta OAuth dialog URL (Facebook Login for Business). */
export function buildMetaAuthUrl(state: string) {
  const { appId, redirectUri } = requireEnv();
  const scope = [
    "ads_management",
    "business_management",
    "pages_show_list",
    "pages_read_engagement",
    "instagram_basic",
  ].join(",");

  const url = new URL(`https://www.facebook.com/${API_VERSION}/dialog/oauth`);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("scope", scope);
  url.searchParams.set("response_type", "code");
  return url.toString();
}

export async function exchangeCodeForToken(code: string) {
  const { appId, appSecret, redirectUri } = requireEnv();
  const url = new URL(`${GRAPH_BASE}/oauth/access_token`);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("code", code);

  const res = await fetch(url.toString());
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "فشل تبادل رمز التفويض مع Meta");
  }
  return data as { access_token: string; token_type: string; expires_in?: number };
}

export async function exchangeForLongLivedToken(shortLivedToken: string) {
  const { appId, appSecret } = requireEnv();
  const url = new URL(`${GRAPH_BASE}/oauth/access_token`);
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("fb_exchange_token", shortLivedToken);

  const res = await fetch(url.toString());
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "فشل تحديث رمز الوصول طويل المدى");
  }
  return data as { access_token: string; token_type: string; expires_in: number };
}

export async function fetchAdAccounts(accessToken: string) {
  const url = new URL(`${GRAPH_BASE}/me/adaccounts`);
  url.searchParams.set("fields", "id,name,account_status,currency");
  url.searchParams.set("access_token", accessToken);
  const res = await fetch(url.toString());
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "تعذّر جلب حسابات الإعلانات");
  return data.data as Array<{ id: string; name: string; account_status: number; currency: string }>;
}

export async function fetchPagesWithInstagram(accessToken: string) {
  const url = new URL(`${GRAPH_BASE}/me/accounts`);
  url.searchParams.set("fields", "id,name,access_token,instagram_business_account{id,username}");
  url.searchParams.set("access_token", accessToken);
  const res = await fetch(url.toString());
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "تعذّر جلب صفحات فيسبوك");
  return data.data as Array<{
    id: string;
    name: string;
    access_token: string;
    instagram_business_account?: { id: string; username: string };
  }>;
}

export { GRAPH_BASE };
