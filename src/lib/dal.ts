import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const verifySession = cache(async () => {
  const session = await getSession();
  if (!session?.merchantId) {
    redirect("/login");
  }
  return { isAuth: true, merchantId: session.merchantId };
});

export const getCurrentMerchant = cache(async () => {
  const session = await getSession();
  if (!session?.merchantId) return null;

  const merchant = await prisma.merchant.findUnique({
    where: { id: session.merchantId },
    select: {
      id: true,
      businessName: true,
      crNumber: true,
      phone: true,
      city: true,
      branches: {
        select: { id: true, name: true, city: true, district: true },
      },
    },
  });
  return merchant;
});
