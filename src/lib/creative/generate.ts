import "server-only";
import type { Discount } from "@/generated/prisma/client";

export type GeneratedVariant = { tag: string; headline: string; body: string };

/**
 * Rule-based ad copy generation from the imported discount's own data —
 * mirrors the three creative directions validated in the product prototype
 * (discount-led, urgency-led, product-led). Deterministic, not a call to an
 * external LLM.
 */
export function generateCreativeVariants(discount: Discount, businessName: string): GeneratedVariant[] {
  const durationDays = Math.max(
    1,
    Math.round((discount.endDate.getTime() - discount.startDate.getTime()) / 86400000),
  );
  const product = discount.products[0] ?? discount.category;

  return [
    {
      tag: "يركّز على نسبة الخصم",
      headline: `خصم يصل إلى ${discount.discountPercent}% على ${discount.category}`,
      body: `لفترة محدودة فقط في ${businessName} — تسوّق أحدث ${discount.category} بأقل الأسعار.`,
    },
    {
      tag: "يركّز على الوقت",
      headline: `${durationDays} أيام فقط… والعرض ينتهي`,
      body: `لا تفوّت فرصة الخصم في ${businessName} قبل نفاد الكمية.`,
    },
    {
      tag: "يركّز على المنتج",
      headline: `وفّر على ${product}`,
      body: `تشكيلة مختارة بعناية — الآن بأسعار مخفضة في ${businessName}.`,
    },
  ];
}
