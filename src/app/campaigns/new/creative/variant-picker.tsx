"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { selectCreativeVariantAction, regenerateCreativeAction } from "@/lib/actions/campaign";

type Variant = { id: string; tag: string; headline: string; body: string; selected: boolean };

export function VariantPicker({
  variants,
  businessName,
}: {
  variants: Variant[];
  businessName: string;
}) {
  const [selected, setSelected] = useState<string | null>(
    variants.find((v) => v.selected)?.id ?? variants[0]?.id ?? null,
  );
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <div className="variant-grid">
        {variants.map((v, i) => (
          <div
            key={v.id}
            className={`variant-card${selected === v.id ? " selected" : ""}`}
            onClick={() => setSelected(v.id)}
          >
            <div className="variant-tag">
              النسخة {String.fromCharCode(65 + i)} — {v.tag}
            </div>
            <div className="ad-mock">
              <div className="ad-brand">
                <span className="dot" /> {businessName} · إعلان مموّل
              </div>
              <div className="ad-headline">{v.headline}</div>
              <div className="ad-body">{v.body}</div>
              <span className="ad-cta">تسوّق الآن</span>
            </div>
            <div className="variant-foot">
              <div className="choice-radio" />
              <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 700 }}>
                اختيار هذه النسخة
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <button
          type="button"
          className="regen"
          disabled={isPending}
          onClick={() => startTransition(() => regenerateCreativeAction())}
        >
          <Icon name="i-spark" /> {isPending ? "جاري التوليد..." : "إعادة توليد النسخ"}
        </button>
      </div>

      <form action={selectCreativeVariantAction}>
        <input type="hidden" name="variantId" value={selected ?? ""} />
        <div className="btn-row">
          <Link href="/campaigns/new/objective" className="btn btn-ghost">
            <Icon name="i-chev" style={{ transform: "scaleX(-1)" }} /> رجوع
          </Link>
          <button className="btn btn-primary" type="submit" disabled={!selected}>
            التالي: الجمهور
            <Icon name="i-chev" />
          </button>
        </div>
      </form>
    </>
  );
}
