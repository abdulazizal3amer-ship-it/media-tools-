import type { MarketingChannel } from "@/generated/prisma/enums";

export type ChannelCampaignInput = {
  campaignId: string;
  campaignName: string;
  objective: "AWARENESS" | "PROMOTE_DISCOUNT" | "STORE_VISITS" | "ONLINE_VISITS";
  budgetSar: number;
  startDate: Date;
  endDate: Date;
  creative: { headline: string; body: string };
  audience: {
    radiusKm: number;
    ageRanges: string[];
    gender: string;
    interests: string[];
    city: string;
  };
};

export type ChannelLaunchResult =
  | { ok: true; externalCampaignId: string; detail: string }
  | { ok: false; error: string };

export interface ChannelConnectionRecord {
  accessToken: string | null;
  externalAccountId: string | null;
  pageId: string | null;
  instagramActorId: string | null;
}

export interface AdChannelProvider {
  readonly channel: MarketingChannel;
  readonly displayName: string;
  /** True once the env vars/credentials this provider needs are present. */
  isConfigured(): boolean;
  /** True real API integration vs. a stub waiting on credentials. */
  readonly isReal: boolean;
  launchCampaign(
    connection: ChannelConnectionRecord | null,
    input: ChannelCampaignInput,
  ): Promise<ChannelLaunchResult>;
}
