import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { getOrCreateDraftCampaign, getCampaignWithDetails } from "@/lib/campaigns/service";
import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/icons";
import { CHANNEL_META } from "@/lib/channel-meta";
import { launchCampaignAction } from "@/lib/actions/campaign";
import { LaunchButton } from "./launch-button";

export const metadata: Metadata = { title: "إطلاق الحملة — روّج" };

export default async function LaunchStepPage() {
  const { merchantId } = await verifySession();
  const campaign = await getOrCreateDraftCampaign(merchantId);
  const full = await getCampaignWithDetails(campaign.id, merchantId);
  if (!full?.package || !full.audience) redirect("/campaigns/new/preview");

  const metaConnection = await prisma.channelConnection.findUnique({
    where: { merchantId_provider: { merchantId, provider: "INSTAGRAM" } },
  });
  const usesInstagram = full.channelAllocations.some((a) => a.channel === "INSTAGRAM");
  const metaReady = !usesInstagram || metaConnection?.status === "CONNECTED";

  return (
    <>
      <div className="topline">
        <span className="kicker">إطلاق الحملة</span>
        <span className="step-of">٩ / ١٠</span>
      </div>
      <h1 className="panel-title">جاهزون للإطلاق</h1>
      <p className="panel-sub">
        عند الضغط على إطلاق، سنرسل الحملة فعلياً إلى كل قناة متصلة — والقنوات غير المتصلة بعد
        ستُسجَّل كنقاط تكامل جاهزة.
      </p>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="section-title" style={{ marginTop: 0 }}>
          <Icon name="i-plug" style={{ color: "var(--accent)" }} /> حالة اتصال القنوات
        </div>
        <div className="stack">
          {full.channelAllocations.map((a) => {
            const meta = CHANNEL_META[a.channel];
            const connected =
              a.channel === "INSTAGRAM"
                ? metaConnection?.status === "CONNECTED"
                : a.channel === "WHATSAPP"
                  ? Boolean(process.env.WHATSAPP_ACCESS_TOKEN)
                  : false;
            return (
              <div className="summary-row" key={a.id}>
                <span className="k">
                  <Icon name={meta?.icon ?? "i-target"} />
                  {meta?.label}
                </span>
                {connected ? (
                  <span className="badge">متصل فعلياً</span>
                ) : a.channel === "INSTAGRAM" ? (
                  <a href="/api/integrations/meta/connect" className="btn btn-ghost" style={{ padding: "6px 14px", fontSize: "0.8rem" }}>
                    ربط حساب Meta الإعلاني
                  </a>
                ) : (
                  <span className="badge link">غير متصلة بعد</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {!metaReady && (
        <div className="ai-note" style={{ marginBottom: 16, background: "var(--discount-soft)", color: "var(--discount)" }}>
          <Icon name="i-shield" />
          <span>يمكنك الإطلاق الآن أيضاً — سيتم تسجيل قناة إنستقرام كغير متصلة حتى تربط الحساب.</span>
        </div>
      )}

      <form action={launchCampaignAction}>
        <div className="btn-row">
          <Link href="/campaigns/new/payment" className="btn btn-ghost">
            <Icon name="i-chev" style={{ transform: "scaleX(-1)" }} /> رجوع
          </Link>
          <LaunchButton />
        </div>
      </form>
    </>
  );
}
