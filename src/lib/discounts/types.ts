// Contract for "نظام التخفيضات" — the Saudi discount registration system
// referenced in the product BRD (section 22). No public developer API exists
// for it today, so this interface is the integration point: implement it
// against the real system later without touching any calling code.

export type ExternalDiscount = {
  externalId: string;
  merchantCrNumber: string;
  title: string;
  category: string;
  products: string[];
  discountPercent: number;
  priceBefore: number;
  priceAfter: number;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  branchNames: string[];
  city: string;
};

export interface DiscountProvider {
  /** Lists the discounts a merchant has registered, ready to promote. */
  listDiscounts(params: {
    crNumber: string;
    businessName: string;
    city: string;
  }): Promise<ExternalDiscount[]>;
}
