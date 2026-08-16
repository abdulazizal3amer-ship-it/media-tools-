import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getOrCreateDraftCampaign } from "@/lib/campaigns/service";
import { generateCreativeVariants } from "@/lib/creative/generate";
import { VariantPicker } from "./variant-picker";

export const metadata: Metadata = { title: "توليد المحتوى — روّج" };

export default async function CreativeStepPage() {
  const { merchantId } = await verifySession();
  const campaign = await getOrCreateDraftCampaign(merchantId);
  if (!campaign.discountId) redirect("/campaigns/new/discount");

  const [merchant, discount] = await Promise.all([
    prisma.merchant.findUniqueOrThrow({ where: { id: merchantId } }),
    prisma.discount.findUniqueOrThrow({ where: { id: campaign.discountId } }),
  ]);

  let variants = await prisma.creativeVariant.findMany({
    where: { campaignId: campaign.id, source: "AI" },
    orderBy: { createdAt: "asc" },
  });

  if (variants.length === 0) {
    const generated = generateCreativeVariants(discount, merchant.businessName);
    await prisma.creativeVariant.createMany({
      data: generated.map((v) => ({ campaignId: campaign.id, source: "AI" as const, ...v })),
    });
    variants = await prisma.creativeVariant.findMany({
      where: { campaignId: campaign.id, source: "AI" },
      orderBy: { createdAt: "asc" },
    });
  }

  return (
    <>
      <div className="topline">
        <span className="kicker">توليد المحتوى الإعلاني</span>
        <span className="step-of">٤ / ١٠</span>
      </div>
      <h1 className="panel-title">اختر النسخة الإعلانية المفضلة لديك</h1>
      <p className="panel-sub">وُلّدت ثلاث نسخ جاهزة من بيانات تخفيضك. اختر واحدة منها.</p>

      <VariantPicker variants={variants} businessName={merchant.businessName} />
    </>
  );
}
