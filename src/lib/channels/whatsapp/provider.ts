import "server-only";
import type { AdChannelProvider, ChannelCampaignInput, ChannelLaunchResult } from "../types";

const API_VERSION = process.env.META_API_VERSION || "v23.0";

/**
 * Real WhatsApp Business Cloud API integration — replaces SMS as the direct
 * messaging channel per product decision. Sends an actual message through
 * Meta's Cloud API; it does not simulate delivery.
 *
 * A full customer-base broadcast needs an approved message template and the
 * merchant's opted-in numbers (BRD section 13); until that data exists, this
 * sends to WHATSAPP_TEST_RECIPIENT as a live smoke test of the integration.
 */
export class WhatsAppProvider implements AdChannelProvider {
  readonly channel = "WHATSAPP" as const;
  readonly displayName = "واتساب";
  readonly isReal = true;

  isConfigured() {
    return Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN);
  }

  async launchCampaign(
    _connection: unknown,
    input: ChannelCampaignInput,
  ): Promise<ChannelLaunchResult> {
    if (!this.isConfigured()) {
      return {
        ok: false,
        error: "لم يتم إعداد تكامل واتساب بعد (WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN).",
      };
    }

    const testRecipient = process.env.WHATSAPP_TEST_RECIPIENT;
    if (!testRecipient) {
      return {
        ok: false,
        error:
          "التكامل مُعد لكن لا توجد قاعدة عملاء موافقين بعد — أضف WHATSAPP_TEST_RECIPIENT لتجربة الإرسال الفعلي.",
      };
    }

    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    try {
      const res = await fetch(
        `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: testRecipient,
            type: "text",
            text: { body: `${input.creative.headline}\n\n${input.creative.body}` },
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data?.error?.message || "فشل إرسال رسالة واتساب" };
      }
      return {
        ok: true,
        externalCampaignId: data.messages?.[0]?.id ?? "unknown",
        detail: "تم إرسال رسالة تجريبية فعلية عبر واتساب بنجاح.",
      };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "خطأ غير متوقع" };
    }
  }
}

export const whatsappProvider = new WhatsAppProvider();
