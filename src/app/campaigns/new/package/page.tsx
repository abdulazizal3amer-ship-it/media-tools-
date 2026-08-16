import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { getOrCreateDraftCampaign } from "@/lib/campaigns/service";
import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/icons";
import { PackagePicker } from "./package-picker";

export const metadata: Metadata = { title: "اختيار الباقة — روّج" };

export default async function PackageStepPage() {
  const { merchantId } = await verifySession();
  const campaign = await getOrCreateDraftCampaign(merchantId);
  if (!campaign.discountId) redirect("/campaigns/new/discount");

  const [discount, merchant, packages] = await Promise.all([
    prisma.discount.findUniqueOrThrow({ where: { id: campaign.discountId } }),
    prisma.merchant.findUniqueOrThrow({ where: { id: merchantId }, include: { branches: true } }),
    prisma.marketingPackage.findMany({ orderBy: { price: "asc" } }),
  ]);

  const recommended = packages.find((p) => p.recommended);
  const branchCount = merchant.branches.length || discount.branchNames.length;
  const durationDays = Math.max(
    1,
    Math.round((discount.endDate.getTime() - discount.startDate.getTime()) / 86400000),
  );

  return (
    <>
      <div className="topline">
        <span className="kicker">اختيار الباقة</span>
        <span className="step-of">٦ / ١٠</span>
      </div>
      <h1 className="panel-title">اختر باقة الحملة</h1>
      <p className="panel-sub">باقات ثابتة تشمل الإعلانات والرسوم — بدون الحاجة لبناء ميزانية من الصفر.</p>

      {recommended && (
        <div className="reco-banner">
          <Icon name="i-spark" style={{ marginTop: 2 }} />
          <div>
            <b>
              لديك {branchCount} فروع في {discount.city} وتخفيض لمدة {durationDays} أيام
            </b>
            <p>
              الأنسب لك: باقة {recommended.name} — {Number(recommended.price)} ر.س، بوصول متوقع{" "}
              {recommended.reachMin}–{recommended.reachMax} عميل.
            </p>
          </div>
        </div>
      )}

      <PackagePicker
        packages={packages.map((p) => ({
          code: p.code,
          name: p.name,
          price: p.price.toString(),
          description: p.description,
          reachMin: p.reachMin,
          reachMax: p.reachMax,
          durationDays: p.durationDays,
          channels: p.channels,
          recommended: p.recommended,
        }))}
        initial={campaign.packageCode}
      />
    </>
  );
}
