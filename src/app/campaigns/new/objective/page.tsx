import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { getOrCreateDraftCampaign } from "@/lib/campaigns/service";
import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/icons";
import { formatDate, formatSar } from "@/lib/format";
import { ObjectiveForm } from "./objective-form";

export const metadata: Metadata = { title: "الترويج للتخفيض — روّج" };

export default async function ObjectiveStepPage() {
  const { merchantId } = await verifySession();
  const campaign = await getOrCreateDraftCampaign(merchantId);
  if (!campaign.discountId) redirect("/campaigns/new/discount");

  const discount = await prisma.discount.findUniqueOrThrow({ where: { id: campaign.discountId } });
  const merchant = await prisma.merchant.findUniqueOrThrow({ where: { id: merchantId } });

  const items: [string, string][] = [
    ["اسم المنشأة", merchant.businessName],
    ["نسبة الخصم", `-${discount.discountPercent}%`],
    ["السعر قبل الخصم", formatSar(discount.priceBefore.toString())],
    ["السعر بعد الخصم", formatSar(discount.priceAfter.toString())],
    ["تاريخ البداية", formatDate(discount.startDate)],
    ["تاريخ النهاية", formatDate(discount.endDate)],
    ["الفروع", `${discount.branchNames.length} فروع`],
    ["المدينة", discount.city],
  ];

  return (
    <>
      <div className="topline">
        <span className="kicker">الترويج للتخفيض</span>
        <span className="step-of">٣ / ١٠</span>
      </div>
      <h1 className="panel-title">بياناتك جاهزة، بدون إعادة إدخال</h1>
      <p className="panel-sub">جلبنا كل التفاصيل من التخفيض المختار تلقائياً.</p>

      <div className="card">
        <span className="badge link" style={{ marginBottom: 12, display: "inline-flex" }}>
          <Icon name="i-link" /> مستوردة تلقائياً — Zero Re-entry
        </span>
        <div className="imported-grid">
          {items.map(([k, v]) => (
            <div className="imported-item" key={k}>
              <div className="k">{k}</div>
              <div className="v">{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-title">
        <Icon name="i-target" style={{ color: "var(--accent)" }} /> ما هدف الحملة؟
      </div>
      <ObjectiveForm initial={campaign.objective} />
    </>
  );
}
