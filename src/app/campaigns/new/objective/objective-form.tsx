"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { setObjectiveAction } from "@/lib/actions/campaign";

const OBJECTIVES = [
  { id: "AWARENESS", icon: "i-spark", title: "زيادة الوعي بالمتجر", sub: "إظهار العلامة التجارية لأكبر عدد من العملاء المحتملين" },
  { id: "PROMOTE_DISCOUNT", icon: "i-tag", title: "الترويج للتخفيض", sub: "التركيز على نسبة الخصم لدفع الشراء الفوري" },
  { id: "STORE_VISITS", icon: "i-target", title: "زيارة الفروع", sub: "جذب العملاء القريبين لزيارة أقرب فرع" },
  { id: "ONLINE_VISITS", icon: "i-eye", title: "زيارة المتجر الإلكتروني", sub: "توجيه العملاء إلى الموقع أو التطبيق" },
] as const;

export function ObjectiveForm({ initial }: { initial: string }) {
  const [selected, setSelected] = useState<string>(initial);

  return (
    <form action={setObjectiveAction}>
      <input type="hidden" name="objective" value={selected} />
      <div className="stack" role="radiogroup" aria-label="هدف الحملة">
        {OBJECTIVES.map((o) => (
          <button
            key={o.id}
            type="button"
            className={`choice-card${selected === o.id ? " selected" : ""}`}
            onClick={() => setSelected(o.id)}
          >
            <div className="choice-radio" />
            <div className="choice-icon">
              <Icon name={o.icon} />
            </div>
            <div className="choice-text">
              <b>{o.title}</b>
              <span>{o.sub}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="btn-row">
        <button className="btn btn-primary" type="submit">
          التالي: توليد المحتوى
          <Icon name="i-chev" />
        </button>
      </div>
    </form>
  );
}
