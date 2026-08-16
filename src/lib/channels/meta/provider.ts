import "server-only";
import type {
  AdChannelProvider,
  ChannelCampaignInput,
  ChannelConnectionRecord,
  ChannelLaunchResult,
} from "../types";
import { GRAPH_BASE, isMetaConfigured } from "./oauth";

const OBJECTIVE_MAP: Record<ChannelCampaignInput["objective"], string> = {
  AWARENESS: "OUTCOME_AWARENESS",
  PROMOTE_DISCOUNT: "OUTCOME_TRAFFIC",
  STORE_VISITS: "OUTCOME_AWARENESS",
  ONLINE_VISITS: "OUTCOME_TRAFFIC",
};

async function graphPost(path: string, accessToken: string, body: Record<string, unknown>) {
  const res = await fetch(`${GRAPH_BASE}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, access_token: accessToken }),
  });
  const data = await res.json();
  if (!res.ok) {
    const message = data?.error?.error_user_msg || data?.error?.message || "Meta API error";
    throw new Error(message);
  }
  return data as { id: string };
}

async function resolveCityKey(city: string, accessToken: string): Promise<string | null> {
  const url = new URL(`${GRAPH_BASE}/search`);
  url.searchParams.set("type", "adgeolocation");
  url.searchParams.set("location_types", JSON.stringify(["city"]));
  url.searchParams.set("q", city);
  url.searchParams.set("access_token", accessToken);
  const res = await fetch(url.toString());
  const data = await res.json();
  if (!res.ok) return null;
  return data?.data?.[0]?.key ?? null;
}

async function resolveInterestIds(interests: string[], accessToken: string): Promise<string[]> {
  const ids: string[] = [];
  for (const interest of interests) {
    const url = new URL(`${GRAPH_BASE}/search`);
    url.searchParams.set("type", "adinterest");
    url.searchParams.set("q", interest);
    url.searchParams.set("access_token", accessToken);
    try {
      const res = await fetch(url.toString());
      const data = await res.json();
      if (res.ok && data?.data?.[0]?.id) ids.push(data.data[0].id);
    } catch {
      // Non-fatal: interest simply won't narrow targeting.
    }
  }
  return ids;
}

function ageBounds(ageRanges: string[]) {
  const bounds = ageRanges
    .map((r) => r.replace("+", "-65"))
    .map((r) => r.split("-").map(Number))
    .filter(([min]) => !Number.isNaN(min));
  if (bounds.length === 0) return { min: 18, max: 65 };
  return {
    min: Math.min(...bounds.map(([min]) => min)),
    max: Math.max(...bounds.map(([, max]) => max ?? 65)),
  };
}

/**
 * Real Meta Marketing API integration. Requires a merchant to have connected
 * their Meta Business account (see /api/integrations/meta) — this provider
 * makes live Graph API calls, it does not simulate responses.
 *
 * New campaigns are created with status "PAUSED" so nothing spends until the
 * merchant explicitly reviews and activates from Meta Ads Manager — a
 * deliberate safety default for a first integration.
 */
export class MetaAdsProvider implements AdChannelProvider {
  readonly channel = "INSTAGRAM" as const;
  readonly displayName = "إنستقرام (عبر Meta)";
  readonly isReal = true;

  isConfigured() {
    return isMetaConfigured();
  }

  async launchCampaign(
    connection: ChannelConnectionRecord | null,
    input: ChannelCampaignInput,
  ): Promise<ChannelLaunchResult> {
    if (!this.isConfigured()) {
      return { ok: false, error: "لم يتم إعداد تكامل Meta بعد (بيانات المطوّر غير متوفرة)." };
    }
    if (!connection?.accessToken || !connection.externalAccountId) {
      return { ok: false, error: "لم يقم التاجر بربط حساب Meta الإعلاني بعد." };
    }

    try {
      const accessToken = connection.accessToken;
      const adAccountId = connection.externalAccountId;

      const campaign = await graphPost(`act_${adAccountId}/campaigns`, accessToken, {
        name: input.campaignName,
        objective: OBJECTIVE_MAP[input.objective],
        status: "PAUSED",
        special_ad_categories: [],
      });

      const cityKey = await resolveCityKey(input.audience.city, accessToken);
      const interestIds = await resolveInterestIds(input.audience.interests, accessToken);
      const { min: ageMin, max: ageMax } = ageBounds(input.audience.ageRanges);
      const genders =
        input.audience.gender === "ذكور" ? [1] : input.audience.gender === "إناث" ? [2] : undefined;

      const targeting: Record<string, unknown> = {
        geo_locations: cityKey
          ? { cities: [{ key: cityKey, radius: input.audience.radiusKm, distance_unit: "kilometer" }] }
          : { countries: ["SA"] },
        age_min: ageMin,
        age_max: ageMax,
        ...(genders ? { genders } : {}),
        ...(interestIds.length ? { flexible_spec: [{ interests: interestIds.map((id) => ({ id })) }] } : {}),
        publisher_platforms: ["instagram"],
      };

      const dailyBudgetHalalas = Math.max(100, Math.round((input.budgetSar / 30) * 100));

      const adSet = await graphPost(`act_${adAccountId}/adsets`, accessToken, {
        name: `${input.campaignName} — مجموعة إعلانية`,
        campaign_id: campaign.id,
        daily_budget: dailyBudgetHalalas,
        billing_event: "IMPRESSIONS",
        optimization_goal: OBJECTIVE_MAP[input.objective] === "OUTCOME_TRAFFIC" ? "LINK_CLICKS" : "REACH",
        bid_strategy: "LOWEST_COST_WITHOUT_CAP",
        targeting,
        start_time: input.startDate.toISOString(),
        end_time: input.endDate.toISOString(),
        status: "PAUSED",
      });

      const creative = await graphPost(`act_${adAccountId}/adcreatives`, accessToken, {
        name: `${input.campaignName} — تصميم`,
        object_story_spec: {
          page_id: connection.pageId,
          ...(connection.instagramActorId
            ? { instagram_actor_id: connection.instagramActorId }
            : {}),
          link_data: {
            message: input.creative.body,
            name: input.creative.headline,
            link: "https://example.com",
          },
        },
      });

      const ad = await graphPost(`act_${adAccountId}/ads`, accessToken, {
        name: `${input.campaignName} — إعلان`,
        adset_id: adSet.id,
        creative: { creative_id: creative.id },
        status: "PAUSED",
      });

      return {
        ok: true,
        externalCampaignId: campaign.id,
        detail: `تم إنشاء الحملة على Meta بنجاح (Ad ID: ${ad.id}) بحالة موقوفة مؤقتاً بانتظار المراجعة.`,
      };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "خطأ غير متوقع من Meta" };
    }
  }
}

export const metaAdsProvider = new MetaAdsProvider();
