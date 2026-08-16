import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { getOrCreateDraftCampaign, getCampaignWithDetails } from "@/lib/campaigns/service";
import { formatSar } from "@/lib/format";
import { PaymentForm } from "./payment-form";

export const metadata: Metadata = { title: "الدفع — روّج" };

export default async function PaymentStepPage() {
  const { merchantId } = await verifySession();
  const campaign = await getOrCreateDraftCampaign(merchantId);
  const full = await getCampaignWithDetails(campaign.id, merchantId);
  if (!full?.package) redirect("/campaigns/new/package");

  const media = Number(full.package.mediaSpend);
  const fee = Number(full.package.platformFee);
  const total = Number(full.package.price);

  return (
    <>
      <div className="topline">
        <span className="kicker">الدفع</span>
        <span className="step-of">٨ / ١٠</span>
      </div>
      <h1 className="panel-title">أكمل الدفع لتفعيل حملتك</h1>
      <p className="panel-sub">تشمل الباقة ميزانية الإعلانات ورسوم المنصة، بدون رسوم إضافية.</p>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="cost-line">
          <span className="muted">ميزانية الإعلانات (Media Spend)</span>
          <span>{formatSar(media)}</span>
        </div>
        <div className="cost-line">
          <span className="muted">رسوم المنصة (Platform Fee)</span>
          <span>{formatSar(fee)}</span>
        </div>
        <div className="cost-line total">
          <span>الإجمالي</span>
          <span>{formatSar(total)}</span>
        </div>
      </div>

      <PaymentForm />
    </>
  );
}
