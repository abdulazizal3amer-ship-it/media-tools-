"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { confirmPaymentAction } from "@/lib/actions/campaign";

const METHODS = [
  { id: "mada", label: "مدى", icon: "i-card" },
  { id: "applepay", label: "Apple Pay", icon: "i-card" },
  { id: "visa", label: "بطاقة ائتمان", icon: "i-card" },
];

export function PaymentForm() {
  const [method, setMethod] = useState("mada");

  return (
    <form action={confirmPaymentAction}>
      <input type="hidden" name="method" value={method} />

      <label className="field-label">وسيلة الدفع</label>
      <div className="pay-method-row" style={{ marginBottom: 22 }}>
        {METHODS.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`pay-method${method === m.id ? " selected" : ""}`}
            onClick={() => setMethod(m.id)}
          >
            <Icon name={m.icon} />
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      <span className="badge link">
        <Icon name="i-link" /> عبر بوابة الدفع — نقطة تكامل جاهزة، بانتظار حساب بوابة دفع سعودية فعلي
      </span>

      <div className="btn-row">
        <Link href="/campaigns/new/preview" className="btn btn-ghost">
          <Icon name="i-chev" style={{ transform: "scaleX(-1)" }} /> رجوع
        </Link>
        <button className="btn btn-primary" type="submit">
          <Icon name="i-card" /> ادفع الآن
        </button>
      </div>
    </form>
  );
}
