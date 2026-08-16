import "server-only";
import type { MarketingChannel } from "@/generated/prisma/enums";
import type { AdChannelProvider, ChannelLaunchResult } from "./types";

/**
 * Placeholder for a channel awaiting real credentials. Implements the same
 * AdChannelProvider contract as the real providers so wiring one up later is
 * a drop-in swap in the channel registry — no caller changes needed.
 */
export class StubChannelProvider implements AdChannelProvider {
  readonly isReal = false;

  constructor(
    readonly channel: MarketingChannel,
    readonly displayName: string,
  ) {}

  isConfigured() {
    return false;
  }

  async launchCampaign(): Promise<ChannelLaunchResult> {
    return {
      ok: false,
      error: `تكامل ${this.displayName} غير متصل بعد — نقطة تكامل جاهزة، بانتظار حسابات المطوّرين.`,
    };
  }
}
