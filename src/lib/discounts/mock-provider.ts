import "server-only";
import type { DiscountProvider, ExternalDiscount } from "./types";

type CatalogItem = Omit<
  ExternalDiscount,
  "externalId" | "merchantCrNumber" | "city" | "branchNames" | "startDate" | "endDate"
> & { startsInDays: number; durationDays: number };

const CATALOG: CatalogItem[] = [
  {
    title: "خصم على التشكيلة الشتوية",
    category: "أزياء",
    products: ["معاطف", "أوشحة", "إكسسوارات"],
    discountPercent: 30,
    priceBefore: 280,
    priceAfter: 196,
    startsInDays: -2,
    durationDays: 10,
  },
  {
    title: "خصم على الإلكترونيات المنزلية",
    category: "إلكترونيات",
    products: ["سماعات لاسلكية", "شواحن سريعة"],
    discountPercent: 15,
    priceBefore: 150,
    priceAfter: 127.5,
    startsInDays: 0,
    durationDays: 5,
  },
];

const DEMO_BRANCHES = ["الفرع الرئيسي", "فرع النخيل", "فرع الملقا", "فرع العليا"];

/**
 * Stands in for the real discount system. Deterministic per merchant so the
 * same CR number always sees the same discounts across a session.
 */
export class MockDiscountProvider implements DiscountProvider {
  async listDiscounts({
    crNumber,
    city,
  }: {
    crNumber: string;
    businessName: string;
    city: string;
  }): Promise<ExternalDiscount[]> {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    return CATALOG.map((item, index) => {
      const { startsInDays, durationDays, ...rest } = item;
      return {
        ...rest,
        externalId: `disc_${crNumber}_${index + 1}`,
        merchantCrNumber: crNumber,
        city,
        branchNames: DEMO_BRANCHES.slice(0, 4 - index),
        startDate: new Date(now + startsInDays * day).toISOString(),
        endDate: new Date(now + (startsInDays + durationDays) * day).toISOString(),
      };
    });
  }
}

export const discountProvider: DiscountProvider = new MockDiscountProvider();
