"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { selectDiscountAction } from "@/lib/actions/campaign";
import type { ExternalDiscount } from "@/lib/discounts/types";

export function DiscountList({ discounts }: { discounts: ExternalDiscount[] }) {
  const [selected, setSelected] = useState<string | null>(discounts[0]?.externalId ?? null);

  return (
    <form action={selectDiscountAction}>
      <input type="hidden" name="externalId" value={selected ?? ""} />
      <div className="stack" role="radiogroup" aria-label="التخفيضات المتاحة">
        {discounts.map((d) => (
          <button
            key={d.externalId}
            type="button"
            className={`discount-card${selected === d.externalId ? " selected" : ""}`}
            onClick={() => setSelected(d.externalId)}
          >
            <div className="discount-thumb">
              <Icon name="i-tag" />
            </div>
            <div style={{ flex: 1 }}>
              <div className="discount-title">{d.title}</div>
              <div className="discount-meta">
                <span className="pct-pill">-{d.discountPercent}%</span>
                <span>
                  <Icon name="i-box" />
                  {d.branchNames.length} فروع
                </span>
                <span>
                  <Icon name="i-target" />
                  {d.city}
                </span>
                <span>
                  <Icon name="i-clock" />
                  {Math.max(
                    1,
                    Math.round(
                      (new Date(d.endDate).getTime() - new Date(d.startDate).getTime()) /
                        86400000,
                    ),
                  )}{" "}
                  أيام
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="btn-row">
        <button className="btn btn-primary" type="submit" disabled={!selected}>
          الترويج لهذا التخفيض
          <Icon name="i-chev" />
        </button>
      </div>
    </form>
  );
}
