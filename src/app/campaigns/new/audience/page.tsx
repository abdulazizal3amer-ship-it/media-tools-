import type { Metadata } from "next";
import { verifySession } from "@/lib/dal";
import { getOrCreateDraftCampaign } from "@/lib/campaigns/service";
import { prisma } from "@/lib/prisma";
import { AudienceForm } from "./audience-form";

export const metadata: Metadata = { title: "الجمهور المستهدف — روّج" };

export default async function AudienceStepPage() {
  const { merchantId } = await verifySession();
  const campaign = await getOrCreateDraftCampaign(merchantId);
  const existing = await prisma.audienceTargeting.findUnique({ where: { campaignId: campaign.id } });

  const initial = {
    radiusKm: existing?.radiusKm ?? 5,
    ageRanges: existing?.ageRanges ?? ["18-24", "25-34"],
    gender: existing?.gender ?? "الكل",
    interests: existing?.interests ?? ["الأزياء"],
    useOwnCustomerBase: existing?.useOwnCustomerBase ?? false,
    baseChannels: (existing?.baseChannels as { sms: boolean; whatsapp: boolean; email: boolean } | null) ?? {
      sms: true,
      whatsapp: true,
      email: false,
    },
  };

  return (
    <>
      <div className="topline">
        <span className="kicker">الجمهور المستهدف</span>
        <span className="step-of">٥ / ١٠</span>
      </div>
      <h1 className="panel-title">من الذي سيصله إعلانك؟</h1>
      <p className="panel-sub">اقترحنا استهدافاً مبدئياً بناءً على نوع منتجك وموقع فروعك، وبإمكانك تعديله.</p>

      <AudienceForm initial={initial} />
    </>
  );
}
