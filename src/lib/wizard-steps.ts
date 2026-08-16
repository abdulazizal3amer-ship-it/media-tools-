export type WizardStep = {
  slug: string | null; // null = the auth step, already completed to reach the wizard
  path: string | null;
  label: string;
  icon: string;
};

export const WIZARD_STEPS: WizardStep[] = [
  { slug: "login", path: null, label: "تسجيل الدخول", icon: "i-key" },
  { slug: "discount", path: "/campaigns/new/discount", label: "اختيار التخفيض", icon: "i-tag" },
  { slug: "objective", path: "/campaigns/new/objective", label: "الترويج للتخفيض", icon: "i-target" },
  { slug: "creative", path: "/campaigns/new/creative", label: "توليد المحتوى", icon: "i-spark" },
  { slug: "audience", path: "/campaigns/new/audience", label: "الجمهور", icon: "i-target" },
  { slug: "package", path: "/campaigns/new/package", label: "الباقة", icon: "i-box" },
  { slug: "preview", path: "/campaigns/new/preview", label: "المعاينة", icon: "i-eye" },
  { slug: "payment", path: "/campaigns/new/payment", label: "الدفع", icon: "i-card" },
  { slug: "launch", path: "/campaigns/new/launch", label: "الإطلاق", icon: "i-rocket" },
  { slug: "dashboard", path: null, label: "تتبع الوصول", icon: "i-chart" },
];
