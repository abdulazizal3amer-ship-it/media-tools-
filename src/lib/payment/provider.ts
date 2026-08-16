import "server-only";

export type PaymentChargeResult =
  | { ok: true; providerRef: string; status: "PAID" }
  | { ok: false; error: string };

export interface PaymentProvider {
  readonly isReal: boolean;
  isConfigured(): boolean;
  charge(params: { amountSar: number; method: string; campaignId: string }): Promise<PaymentChargeResult>;
}

/**
 * Placeholder gateway. No Saudi payment gateway (Moyasar/HyperPay/Tap/PayTabs)
 * account was available when this was built, so this is an interface-only
 * integration point: implement `charge()` against a real gateway's API and
 * swap it in — nothing else in the app needs to change.
 */
class StubPaymentProvider implements PaymentProvider {
  readonly isReal = false;

  isConfigured() {
    return Boolean(process.env.PAYMENT_GATEWAY_API_KEY);
  }

  async charge(): Promise<PaymentChargeResult> {
    return {
      ok: false,
      error: "بوابة الدفع غير متصلة بعد — نقطة تكامل جاهزة، بانتظار حساب تاجر فعلي مع بوابة دفع سعودية.",
    };
  }
}

export const paymentProvider: PaymentProvider = new StubPaymentProvider();
