"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/lib/actions/auth";
import { Icon } from "@/components/icons";

const CITIES = ["الرياض", "جدة", "الدمام", "مكة المكرمة", "المدينة المنورة"];

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <form action={action} className="card stack" style={{ maxWidth: 440 }}>
      <div>
        <label className="field-label" htmlFor="businessName">
          اسم المنشأة
        </label>
        <input
          type="text"
          id="businessName"
          name="businessName"
          placeholder="مثال: بوتيك روان"
          required
        />
        {state?.errors?.businessName && (
          <p className="field-error">{state.errors.businessName[0]}</p>
        )}
      </div>

      <div>
        <label className="field-label" htmlFor="crNumber">
          رقم السجل التجاري
        </label>
        <input
          type="text"
          id="crNumber"
          name="crNumber"
          placeholder="10 أرقام"
          inputMode="numeric"
          dir="ltr"
          style={{ textAlign: "right" }}
          required
        />
        {state?.errors?.crNumber && (
          <p className="field-error">{state.errors.crNumber[0]}</p>
        )}
      </div>

      <div>
        <label className="field-label" htmlFor="phone">
          رقم الجوال
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          placeholder="05xxxxxxxx"
          dir="ltr"
          style={{ textAlign: "right" }}
          required
        />
        {state?.errors?.phone && (
          <p className="field-error">{state.errors.phone[0]}</p>
        )}
      </div>

      <div>
        <label className="field-label" htmlFor="city">
          المدينة
        </label>
        <select id="city" name="city" defaultValue={CITIES[0]} required>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {state?.errors?.city && (
          <p className="field-error">{state.errors.city[0]}</p>
        )}
      </div>

      <div>
        <label className="field-label" htmlFor="password">
          كلمة المرور
        </label>
        <input type="password" id="password" name="password" required />
        {state?.errors?.password && (
          <p className="field-error">{state.errors.password[0]}</p>
        )}
      </div>

      {state?.message && <p className="field-error">{state.message}</p>}

      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? "جاري إنشاء الحساب..." : "إنشاء الحساب والمتابعة"}
        <Icon name="i-chev" />
      </button>

      <p style={{ fontSize: "0.82rem", color: "var(--muted)", textAlign: "center" }}>
        لديك حساب بالفعل؟{" "}
        <Link href="/login" style={{ color: "var(--accent-ink)", fontWeight: 800 }}>
          تسجيل الدخول
        </Link>
      </p>
    </form>
  );
}
