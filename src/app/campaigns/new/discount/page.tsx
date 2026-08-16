import type { Metadata } from "next";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getAvailableDiscounts } from "@/lib/discounts/service";
import { Icon } from "@/components/icons";
import { DiscountList } from "./discount-list";

export const metadata: Metadata = { title: "اختيار التخفيض — روّج" };

export default async function DiscountStepPage() {
  const { merchantId } = await verifySession();
  const merchant = await prisma.merchant.findUniqueOrThrow({ where: { id: merchantId } });
  const discounts = await getAvailableDiscounts({
    crNumber: merchant.crNumber,
    businessName: merchant.businessName,
    city: merchant.city,
  });

  return (
    <>
      <div className="topline">
        <span className="kicker">اختيار التخفيض</span>
        <span className="step-of">٢ / ١٠</span>
      </div>
      <h1 className="panel-title">أي تخفيض تريد الترويج له؟</h1>
      <p className="panel-sub">هذه التخفيضات مستوردة من حسابك في نظام التخفيضات.</p>
      <span className="badge link" style={{ marginBottom: 14, display: "inline-flex" }}>
        <Icon name="i-link" /> نقطة تكامل جاهزة — بيانات تجريبية بانتظار ربط النظام الفعلي
      </span>

      <DiscountList discounts={discounts} />
    </>
  );
}
