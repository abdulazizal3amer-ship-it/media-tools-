"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getOrCreateDraftCampaign, getCampaignWithDetails } from "@/lib/campaigns/service";
import { getAvailableDiscounts, importDiscount } from "@/lib/discounts/service";
import { generateCreativeVariants } from "@/lib/creative/generate";
import { paymentProvider } from "@/lib/payment/provider";
import { getChannelProvider } from "@/lib/channels/registry";

export async function selectDiscountAction(formData: FormData) {
  const { merchantId } = await verifySession();
  const externalId = formData.get("externalId") as string;

  const merchant = await prisma.merchant.findUniqueOrThrow({ where: { id: merchantId } });
  const available = await getAvailableDiscounts({
    crNumber: merchant.crNumber,
    businessName: merchant.businessName,
    city: merchant.city,
  });
  const chosen = available.find((d) => d.externalId === externalId);
  if (!chosen) throw new Error("التخفيض المختار غير متاح");

  const discount = await importDiscount(merchantId, chosen);
  const campaign = await getOrCreateDraftCampaign(merchantId);

  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { discountId: discount.id },
  });

  revalidatePath("/campaigns/new");
  redirect("/campaigns/new/objective");
}

export async function setObjectiveAction(formData: FormData) {
  const { merchantId } = await verifySession();
  const objective = formData.get("objective") as
    | "AWARENESS"
    | "PROMOTE_DISCOUNT"
    | "STORE_VISITS"
    | "ONLINE_VISITS";

  const campaign = await getOrCreateDraftCampaign(merchantId);
  await prisma.campaign.update({ where: { id: campaign.id }, data: { objective } });

  revalidatePath("/campaigns/new");
  redirect("/campaigns/new/creative");
}

export async function regenerateCreativeAction() {
  const { merchantId } = await verifySession();
  const campaign = await getOrCreateDraftCampaign(merchantId);
  if (!campaign.discountId) redirect("/campaigns/new/discount");

  const [discount, merchant] = await Promise.all([
    prisma.discount.findUniqueOrThrow({ where: { id: campaign.discountId } }),
    prisma.merchant.findUniqueOrThrow({ where: { id: merchantId } }),
  ]);

  await prisma.creativeVariant.deleteMany({ where: { campaignId: campaign.id, source: "AI" } });
  const variants = generateCreativeVariants(discount, merchant.businessName);
  await prisma.creativeVariant.createMany({
    data: variants.map((v) => ({ campaignId: campaign.id, source: "AI" as const, ...v })),
  });

  revalidatePath("/campaigns/new/creative");
}

export async function selectCreativeVariantAction(formData: FormData) {
  const { merchantId } = await verifySession();
  const variantId = formData.get("variantId") as string;
  const campaign = await getOrCreateDraftCampaign(merchantId);

  await prisma.$transaction([
    prisma.creativeVariant.updateMany({
      where: { campaignId: campaign.id },
      data: { selected: false },
    }),
    prisma.creativeVariant.update({ where: { id: variantId }, data: { selected: true } }),
  ]);

  revalidatePath("/campaigns/new");
  redirect("/campaigns/new/audience");
}

export async function saveAudienceAction(formData: FormData) {
  const { merchantId } = await verifySession();
  const campaign = await getOrCreateDraftCampaign(merchantId);

  const radiusKm = Number(formData.get("radiusKm") ?? 5);
  const ageRanges = formData.getAll("ageRanges") as string[];
  const gender = (formData.get("gender") as string) ?? "الكل";
  const interests = formData.getAll("interests") as string[];
  const useOwnCustomerBase = formData.get("useOwnCustomerBase") === "on";
  const baseChannels = {
    sms: formData.get("baseSms") === "on",
    whatsapp: formData.get("baseWhatsapp") === "on",
    email: formData.get("baseEmail") === "on",
  };

  await prisma.audienceTargeting.upsert({
    where: { campaignId: campaign.id },
    update: { radiusKm, ageRanges, gender, interests, useOwnCustomerBase, baseChannels },
    create: {
      campaignId: campaign.id,
      radiusKm,
      ageRanges,
      gender,
      interests,
      useOwnCustomerBase,
      baseChannels,
    },
  });

  revalidatePath("/campaigns/new");
  redirect("/campaigns/new/package");
}

export async function selectPackageAction(formData: FormData) {
  const { merchantId } = await verifySession();
  const packageCode = formData.get("packageCode") as string;
  const campaign = await getOrCreateDraftCampaign(merchantId);

  const pkg = await prisma.marketingPackage.findUniqueOrThrow({ where: { code: packageCode } });

  await prisma.$transaction([
    prisma.campaign.update({ where: { id: campaign.id }, data: { packageCode } }),
    prisma.campaignChannelAllocation.deleteMany({ where: { campaignId: campaign.id } }),
  ]);

  const shares = allocateChannelShares(pkg.channels as string[]);
  await prisma.campaignChannelAllocation.createMany({
    data: shares.map(({ channel, sharePercent }) => ({
      campaignId: campaign.id,
      channel: channel as never,
      sharePercent,
      budgetAmount: (Number(pkg.mediaSpend) * sharePercent) / 100,
    })),
  });

  revalidatePath("/campaigns/new");
  redirect("/campaigns/new/preview");
}

const LAUNCH_TASKS = [
  { key: "dispatch", label: "إرسال الحملة إلى القنوات المختارة" },
  { key: "schedule", label: "جدولة موعد الانطلاق" },
  { key: "activate", label: "تشغيل المحتوى الإعلاني" },
  { key: "monitor", label: "بدء مراقبة الأداء لحظياً" },
  { key: "ready", label: "الحملة جاهزة ونشطة" },
];

export async function launchCampaignAction() {
  const { merchantId } = await verifySession();
  const campaign = await getOrCreateDraftCampaign(merchantId);
  const full = await getCampaignWithDetails(campaign.id, merchantId);
  if (!full || !full.package || !full.audience) {
    throw new Error("الحملة غير مكتملة بعد");
  }
  const selectedCreative = full.creativeVariants.find((v) => v.selected);
  if (!selectedCreative) throw new Error("لم يتم اختيار نسخة إعلانية");

  if (full.launchTasks.length === 0) {
    await prisma.launchTask.createMany({
      data: LAUNCH_TASKS.map((t, i) => ({
        campaignId: campaign.id,
        key: t.key,
        label: t.label,
        sortOrder: i,
        status: "DONE",
        completedAt: new Date(),
      })),
    });
  }

  const [connection, merchant] = await Promise.all([
    prisma.channelConnection.findUnique({
      where: { merchantId_provider: { merchantId, provider: "INSTAGRAM" } },
    }),
    prisma.merchant.findUniqueOrThrow({ where: { id: merchantId } }),
  ]);

  const now = new Date();
  const endDate = new Date(now.getTime() + full.package.durationDays * 86400000);

  let anyChannelLive = false;
  for (const allocation of full.channelAllocations) {
    const provider = getChannelProvider(allocation.channel);
    const result = await provider.launchCampaign(
      allocation.channel === "INSTAGRAM" && connection
        ? {
            accessToken: connection.accessToken,
            externalAccountId: connection.externalAccountId,
            pageId: connection.pageId,
            instagramActorId: connection.instagramActorId,
          }
        : null,
      {
        campaignId: campaign.id,
        campaignName: `${full.discount?.title ?? "حملة"} — ${merchant.businessName}`.trim(),
        objective: full.objective,
        budgetSar: Number(allocation.budgetAmount),
        startDate: now,
        endDate,
        creative: { headline: selectedCreative.headline, body: selectedCreative.body },
        audience: {
          radiusKm: full.audience.radiusKm,
          ageRanges: full.audience.ageRanges,
          gender: full.audience.gender,
          interests: full.audience.interests,
          city: full.discount?.city ?? "الرياض",
        },
      },
    );

    if (result.ok) anyChannelLive = true;

    await prisma.activityLogEntry.create({
      data: {
        campaignId: campaign.id,
        message: result.ok
          ? `${provider.displayName}: ${result.detail}`
          : `${provider.displayName}: ${result.error}`,
      },
    });
  }

  await prisma.campaign.update({
    where: { id: campaign.id },
    data: {
      // Only genuinely ACTIVE when a channel actually launched — a campaign
      // where every provider reported "not connected" has not gone live.
      status: anyChannelLive ? "ACTIVE" : "FAILED",
      launchedAt: now,
      elapsedSeconds: Math.round((now.getTime() - campaign.createdAt.getTime()) / 1000),
    },
  });

  revalidatePath("/campaigns/new");
  redirect(`/campaigns/${campaign.id}`);
}

function allocateChannelShares(channels: string[]) {
  const weights: Record<string, number> = {
    INSTAGRAM: 40,
    FACEBOOK: 20,
    GOOGLE: 30,
    TIKTOK: 25,
    SNAPCHAT: 15,
    WHATSAPP: 20,
    EMAIL: 10,
  };
  const totalWeight = channels.reduce((sum, c) => sum + (weights[c] ?? 10), 0);
  let running = 0;
  return channels.map((channel, i) => {
    const isLast = i === channels.length - 1;
    const share = isLast
      ? 100 - running
      : Math.round(((weights[channel] ?? 10) / totalWeight) * 100);
    running += share;
    return { channel, sharePercent: share };
  });
}

export async function confirmPaymentAction(formData: FormData) {
  const { merchantId } = await verifySession();
  const method = formData.get("method") as string;
  const campaign = await getOrCreateDraftCampaign(merchantId);
  const full = await getCampaignWithDetails(campaign.id, merchantId);
  if (!full?.package) throw new Error("لم يتم اختيار باقة بعد");

  const chargeResult = await paymentProvider.charge({
    amountSar: Number(full.package.price),
    method,
    campaignId: campaign.id,
  });

  await prisma.payment.upsert({
    where: { campaignId: campaign.id },
    update: {
      method,
      amount: full.package.price,
      status: chargeResult.ok ? "PAID" : "PENDING",
      providerRef: chargeResult.ok ? chargeResult.providerRef : null,
      paidAt: chargeResult.ok ? new Date() : null,
    },
    create: {
      campaignId: campaign.id,
      method,
      amount: full.package.price,
      status: chargeResult.ok ? "PAID" : "PENDING",
      provider: "stub-gateway",
      providerRef: chargeResult.ok ? chargeResult.providerRef : null,
      paidAt: chargeResult.ok ? new Date() : null,
    },
  });

  await prisma.$transaction([
    prisma.campaign.update({
      where: { id: campaign.id },
      data: { status: chargeResult.ok ? "SCHEDULED" : "PENDING_PAYMENT" },
    }),
    prisma.activityLogEntry.create({
      data: {
        campaignId: campaign.id,
        message: chargeResult.ok
          ? "تم الدفع بنجاح"
          : `لم تكتمل عملية الدفع: ${chargeResult.error}`,
      },
    }),
  ]);

  revalidatePath("/campaigns/new");
  redirect("/campaigns/new/launch");
}
