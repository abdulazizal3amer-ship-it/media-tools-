import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getOrCreateDraftCampaign } from "@/lib/campaigns/service";
import { Icon } from "@/components/icons";
import { RailNav } from "@/components/rail-nav";
import { ElapsedClock } from "@/components/elapsed-clock";

export default async function NewCampaignLayout({ children }: { children: React.ReactNode }) {
  const { merchantId } = await verifySession();
  const merchant = await prisma.merchant.findUniqueOrThrow({
    where: { id: merchantId },
    include: { branches: true },
  });
  const campaign = await getOrCreateDraftCampaign(merchantId);

  return (
    <div className="app">
      <aside className="rail">
        <div className="rail-brand">
          <div className="brand-mark">
            <Icon name="i-spark" />
          </div>
          <div>
            <div className="brand-name">روّج</div>
            <div className="rail-brand-sub">سوّق تخفيضك خلال دقائق</div>
          </div>
        </div>

        <div className="rail-merchant">
          <div className="avatar">{merchant.businessName.charAt(0)}</div>
          <div>
            <div className="m-name">{merchant.businessName}</div>
            <div className="m-meta">
              {merchant.branches.length > 0 ? `${merchant.branches.length} فروع · ` : ""}
              {merchant.city}
            </div>
          </div>
        </div>

        <ElapsedClock startedAt={campaign.createdAt.toISOString()} />

        <RailNav />
      </aside>

      <main className="main">{children}</main>
    </div>
  );
}
