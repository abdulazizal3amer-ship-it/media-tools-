import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { getOrCreateDraftCampaign, getCampaignWithDetails } from "@/lib/campaigns/service";
import { Icon } from "@/components/icons";
import { CHANNEL_META } from "@/lib/channel-meta";
import { formatDate, formatNumber, formatSar } from "@/lib/format";

export const metadata: Metadata = { title: "معاينة الحملة — روّج" };

export default async function PreviewStepPage() {
  const { merchantId } = await verifySession();
  const campaign = await getOrCreateDraftCampaign(merchantId);
  const full = await getCampaignWithDetails(campaign.id, merchantId);

  if (!full?.discount || !full.package) redirect("/campaigns/new/discount");

  const rows: [string, string, string][] = [
    ["i-tag", "التخفيض", `-${full.discount.discountPercent}% على ${full.discount.category}`],
    [
      "i-clock",
      "المدة",
      `${Math.max(1, Math.round((full.discount.endDate.getTime() - full.discount.startDate.getTime()) / 86400000))} أيام (${formatDate(full.discount.startDate)} — ${formatDate(full.discount.endDate)})`,
    ],
    ["i-target", "المدينة", full.discount.city],
    ["i-box", "الباقة", `${full.package.name} — ${formatSar(full.package.price.toString())}`],
  ];

  return (
    <>
      <div className="topline">
        <span className="kicker">معاينة الحملة</span>
        <span className="step-of">٧ / ١٠</span>
      </div>
      <h1 className="panel-title">راجع حملتك قبل الإطلاق</h1>
      <p className="panel-sub">هذا كل ما سيحصل — بدون مفاجآت لاحقة.</p>

      <div className="card">
        {rows.map(([icon, k, v]) => (
          <div className="summary-row" key={k}>
            <span className="k">
              <Icon name={icon} />
              {k}
            </span>
            <span className="v">{v}</span>
          </div>
        ))}
        <div className="summary-row">
          <span className="k">
            <Icon name="i-chart" />
            القنوات
          </span>
          <span className="v chan-icons">
            {full.channelAllocations.map((a) => (
              <span className="chan-ico" key={a.id}>
                <Icon name={CHANNEL_META[a.channel]?.icon ?? "i-target"} />
              </span>
            ))}
          </span>
        </div>
      </div>

      <div className="section-title">
        <Icon name="i-chart" style={{ color: "var(--accent)" }} /> توزيع الميزانية على القنوات
      </div>
      <div className="card">
        <div className="alloc-bar">
          {full.channelAllocations.map((a) => (
            <div
              key={a.id}
              style={{ width: `${a.sharePercent}%`, background: CHANNEL_META[a.channel]?.color }}
            />
          ))}
        </div>
        <div className="alloc-legend">
          {full.channelAllocations.map((a) => (
            <span key={a.id}>
              <i style={{ background: CHANNEL_META[a.channel]?.color }} />
              {CHANNEL_META[a.channel]?.label} — {a.sharePercent}%
            </span>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="reach-hero">
          <div className="num" dir="ltr">
            {formatNumber(full.package.reachMin)}–{formatNumber(full.package.reachMax)}
          </div>
          <div className="lbl">الوصول المتوقع (عدد الأشخاص)</div>
        </div>
      </div>

      <div className="btn-row">
        <Link href="/campaigns/new/package" className="btn btn-ghost">
          <Icon name="i-chev" style={{ transform: "scaleX(-1)" }} /> رجوع
        </Link>
        <Link href="/campaigns/new/payment" className="btn btn-primary">
          إطلاق الحملة
          <Icon name="i-chev" />
        </Link>
      </div>
    </>
  );
}
