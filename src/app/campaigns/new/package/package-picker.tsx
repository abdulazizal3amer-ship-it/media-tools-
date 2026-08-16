"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { selectPackageAction } from "@/lib/actions/campaign";
import { formatNumber, formatSar } from "@/lib/format";

type Pkg = {
  code: string;
  name: string;
  price: string;
  description: string;
  reachMin: number;
  reachMax: number;
  durationDays: number;
  channels: string[];
  recommended: boolean;
};

export function PackagePicker({ packages, initial }: { packages: Pkg[]; initial: string | null }) {
  const [selected, setSelected] = useState(initial ?? packages.find((p) => p.recommended)?.code ?? packages[0]?.code);

  return (
    <form action={selectPackageAction}>
      <input type="hidden" name="packageCode" value={selected ?? ""} />
      <div className="pkg-grid">
        {packages.map((pkg) => (
          <button
            key={pkg.code}
            type="button"
            className={`pkg-card${selected === pkg.code ? " selected" : ""}`}
            onClick={() => setSelected(pkg.code)}
          >
            {pkg.recommended && (
              <span className="pkg-rec">
                <Icon name="i-spark" /> الأنسب لك
              </span>
            )}
            <div className="pkg-name">{pkg.name}</div>
            <div className="pkg-price">
              {formatSar(pkg.price)}
            </div>
            <div className="pkg-desc">{pkg.description}</div>
            <ul className="pkg-list">
              <li>
                <Icon name="i-check" /> {pkg.channels.length} قنوات إعلانية
              </li>
              <li>
                <Icon name="i-check" /> مدة تصل إلى {pkg.durationDays} أيام
              </li>
            </ul>
            <div className="pkg-desc" style={{ marginTop: "auto", color: "var(--accent-ink)", fontWeight: 800 }}>
              وصول <bdi dir="ltr">{formatNumber(pkg.reachMin)}–{formatNumber(pkg.reachMax)}</bdi>
            </div>
          </button>
        ))}
      </div>

      <div className="btn-row">
        <Link href="/campaigns/new/audience" className="btn btn-ghost">
          <Icon name="i-chev" style={{ transform: "scaleX(-1)" }} /> رجوع
        </Link>
        <button className="btn btn-primary" type="submit" disabled={!selected}>
          التالي: المعاينة
          <Icon name="i-chev" />
        </button>
      </div>
    </form>
  );
}
