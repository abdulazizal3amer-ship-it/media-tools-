import { prisma } from "../src/lib/prisma";

const packages = [
  {
    code: "starter",
    name: "Starter",
    price: 500,
    mediaSpend: 425,
    platformFee: 75,
    description: "لترويج محلي بسيط",
    reachMin: 8000,
    reachMax: 14000,
    durationDays: 5,
    channels: ["INSTAGRAM", "WHATSAPP"],
    recommended: false,
  },
  {
    code: "growth",
    name: "Growth",
    price: 2000,
    mediaSpend: 1700,
    platformFee: 300,
    description: "وصول أوسع، عدة قنوات",
    reachMin: 40000,
    reachMax: 65000,
    durationDays: 10,
    channels: ["INSTAGRAM", "GOOGLE", "WHATSAPP"],
    recommended: true,
  },
  {
    code: "boost",
    name: "Boost",
    price: 5000,
    mediaSpend: 4300,
    platformFee: 700,
    description: "حملة كبرى متعددة القنوات",
    reachMin: 110000,
    reachMax: 170000,
    durationDays: 14,
    channels: ["INSTAGRAM", "FACEBOOK", "GOOGLE", "TIKTOK", "WHATSAPP"],
    recommended: false,
  },
  {
    code: "premium",
    name: "Premium",
    price: 10000,
    mediaSpend: 8700,
    platformFee: 1300,
    description: "لكبار التجار وسلاسل الفروع",
    reachMin: 250000,
    reachMax: 400000,
    durationDays: 21,
    channels: ["INSTAGRAM", "FACEBOOK", "GOOGLE", "TIKTOK", "SNAPCHAT", "WHATSAPP"],
    recommended: false,
  },
];

async function main() {
  for (const pkg of packages) {
    await prisma.marketingPackage.upsert({
      where: { code: pkg.code },
      update: pkg,
      create: pkg,
    });
  }
  console.log(`Seeded ${packages.length} packages.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
