import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Icon } from "@/components/icons";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "تسجيل الدخول — روّج" };

export default async function LoginPage() {
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

      <h1 className="panel-title" style={{ textAlign: "center", marginBottom: 6 }}>
        مرحباً بعودتك
      </h1>

      <LoginForm />
    </div>
  );
}
