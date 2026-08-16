import "server-only";
import { prisma } from "@/lib/prisma";
import type { CampaignStatus } from "@/generated/prisma/enums";

// A campaign stays "in progress" (and is resumed rather than replaced) across
// every wizard step, including after a payment attempt moves it off DRAFT —
// only once it's actually launched (ACTIVE) or abandoned does the next visit
// to the wizard start a fresh one.
const IN_PROGRESS_STATUSES: CampaignStatus[] = ["DRAFT", "PENDING_PAYMENT", "SCHEDULED"];

export async function getOrCreateDraftCampaign(merchantId: string) {
  const existing = await prisma.campaign.findFirst({
    where: { merchantId, status: { in: IN_PROGRESS_STATUSES } },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return existing;
  return prisma.campaign.create({ data: { merchantId, createdAt: new Date() } });
}

export async function getCampaignWithDetails(campaignId: string, merchantId: string) {
  return prisma.campaign.findFirst({
    where: { id: campaignId, merchantId },
    include: {
      discount: true,
      package: true,
      creativeVariants: true,
      audience: true,
      channelAllocations: true,
      payment: true,
      launchTasks: { orderBy: { sortOrder: "asc" } },
      metrics: true,
      activityLog: { orderBy: { createdAt: "asc" } },
    },
  });
}
