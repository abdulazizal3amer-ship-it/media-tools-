import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Icon } from "@/components/icons";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "إنشاء حساب — روّج" };

export default async function SignupPage() {
  const session = await getSession();
  if (session) redirect("/campaigns/new");

  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <div className="brand-mark">
          <Icon name="i-spark" />
        </div>
        <div>
          <div className="brand-name">روّج</div>
          <div className="rail-brand-sub">سوّق تخفيضك خلال دقائق</div>
        </div>
      </div>

      <div>
        <h1 className="panel-title" style={{ textAlign: "center", marginBottom: 6 }}>
          أنشئ حساب منشأتك
        </h1>
        <p className="panel-sub" style={{ textAlign: "center", maxWidth: 380 }}>
          حساب واحد يكفي لإطلاق كل حملاتك التسويقية القادمة.
        </p>
      </div>

      <SignupForm />
    </div>
  );
}
