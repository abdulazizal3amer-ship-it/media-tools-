import "server-only";
import type { MarketingChannel } from "@/generated/prisma/enums";
import type { AdChannelProvider } from "./types";
import { metaAdsProvider } from "./meta/provider";
import { whatsappProvider } from "./whatsapp/provider";
import { StubChannelProvider } from "./stub-provider";

export const channelRegistry: Record<MarketingChannel, AdChannelProvider> = {
  INSTAGRAM: metaAdsProvider,
  FACEBOOK: new StubChannelProvider("FACEBOOK", "فيسبوك"),
  GOOGLE: new StubChannelProvider("GOOGLE", "قوقل"),
  TIKTOK: new StubChannelProvider("TIKTOK", "تيك توك"),
  SNAPCHAT: new StubChannelProvider("SNAPCHAT", "سناب شات"),
  WHATSAPP: whatsappProvider,
  EMAIL: new StubChannelProvider("EMAIL", "البريد الإلكتروني"),
};

export function getChannelProvider(channel: MarketingChannel): AdChannelProvider {
  return channelRegistry[channel];
}
