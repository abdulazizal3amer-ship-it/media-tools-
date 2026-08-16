"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/lib/actions/auth";
import { Icon } from "@/components/icons";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="card stack" style={{ maxWidth: 400 }}>
      <div>
        <label className="field-label" htmlFor="crNumber">
          رقم السجل التجاري
        </label>
        <input
          type="text"
          id="crNumber"
          name="crNumber"
          dir="ltr"
          style={{ textAlign: "right" }}
          required
        />
        {state?.errors?.crNumber && (
          <p className="field-error">{state.errors.crNumber[0]}</p>
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
        {pending ? "جاري الدخول..." : "تسجيل الدخول"}
        <Icon name="i-chev" />
      </button>

      <p style={{ fontSize: "0.82rem", color: "var(--muted)", textAlign: "center" }}>
        ليس لديك حساب؟{" "}
        <Link href="/signup" style={{ color: "var(--accent-ink)", fontWeight: 800 }}>
          أنشئ حساباً جديداً
        </Link>
      </p>
    </form>
  );
}
