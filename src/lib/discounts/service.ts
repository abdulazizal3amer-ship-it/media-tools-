import "server-only";
import { prisma } from "@/lib/prisma";
import { discountProvider } from "./mock-provider";
import type { ExternalDiscount } from "./types";

export async function getAvailableDiscounts(merchant: {
  crNumber: string;
  businessName: string;
  city: string;
}) {
  return discountProvider.listDiscounts(merchant);
}

/**
 * Imports (caches) a discount from the external system into the local
 * database the first time a merchant chooses to promote it — this is the
 * "Zero Re-entry" step from the BRD (section 22).
 */
export async function importDiscount(merchantId: string, external: ExternalDiscount) {
  return prisma.discount.upsert({
    where: { externalId: external.externalId },
    update: {},
    create: {
      externalId: external.externalId,
      merchantId,
      title: external.title,
      category: external.category,
      products: external.products,
      discountPercent: external.discountPercent,
      priceBefore: external.priceBefore,
      priceAfter: external.priceAfter,
      startDate: new Date(external.startDate),
      endDate: new Date(external.endDate),
      branchNames: external.branchNames,
      city: external.city,
      source: "MOCK",
    },
  });
}
