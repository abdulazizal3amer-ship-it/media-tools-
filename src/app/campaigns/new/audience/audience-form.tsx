"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { saveAudienceAction } from "@/lib/actions/campaign";

const AGE_OPTIONS = ["18-24", "25-34", "35-44", "45+"];
const GENDER_OPTIONS = ["الكل", "ذكور", "إناث"];
const INTEREST_OPTIONS = ["الأزياء", "الجمال", "الرياضة"];

type Initial = {
  radiusKm: number;
  ageRanges: string[];
  gender: string;
  interests: string[];
  useOwnCustomerBase: boolean;
  baseChannels: { sms: boolean; whatsapp: boolean; email: boolean };
};

export function AudienceForm({ initial }: { initial: Initial }) {
  const [radiusKm, setRadiusKm] = useState(initial.radiusKm);
  const [ageRanges, setAgeRanges] = useState<string[]>(initial.ageRanges);
  const [gender, setGender] = useState(initial.gender);
  const [interests, setInterests] = useState<string[]>(initial.interests);
  const [useOwnCustomerBase, setUseOwnCustomerBase] = useState(initial.useOwnCustomerBase);
  const [baseChannels, setBaseChannels] = useState(initial.baseChannels);

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  return (
    <form action={saveAudienceAction}>
      <input type="hidden" name="radiusKm" value={radiusKm} />
      {ageRanges.map((v) => (
        <input key={v} type="hidden" name="ageRanges" value={v} />
      ))}
      <input type="hidden" name="gender" value={gender} />
      {interests.map((v) => (
        <input key={v} type="hidden" name="interests" value={v} />
      ))}

      <div className="ai-note" style={{ marginBottom: 20 }}>
        <Icon name="i-spark" />
        <span>
          توصية الذكاء الاصطناعي: جمهور مهتم بـ&quot;{interests[0] ?? "الأزياء"}&quot;، ضمن نطاق{" "}
          {radiusKm} كم من فروعك.
        </span>
      </div>

      <div className="card stack">
        <div>
          <label className="field-label">
            <Icon name="i-target" /> النطاق الجغرافي حول الفروع
          </label>
          <div className="range-row">
            <input
              type="range"
              min={1}
              max={25}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
            />
            <span className="range-val">{radiusKm} كم</span>
          </div>
        </div>

        <div>
          <label className="field-label">الفئة العمرية</label>
          <div className="chip-row">
            {AGE_OPTIONS.map((a) => (
              <button
                key={a}
                type="button"
                className={`chip${ageRanges.includes(a) ? " on" : ""}`}
                onClick={() => toggle(ageRanges, setAgeRanges, a)}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="field-label">الجنس</label>
          <div className="chip-row">
            {GENDER_OPTIONS.map((g) => (
              <button
                key={g}
                type="button"
                className={`chip${gender === g ? " on" : ""}`}
                onClick={() => setGender(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="field-label">الاهتمامات</label>
          <div className="chip-row">
            {INTEREST_OPTIONS.map((i) => (
              <button
                key={i}
                type="button"
                className={`chip${interests.includes(i) ? " on" : ""}`}
                onClick={() => toggle(interests, setInterests, i)}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="switch-row">
          <div className="choice-text">
            <b>استخدام قاعدة عملائي الحاليين</b>
            <span>الوصول إلى عملائك عبر بيانات جوالهم وبريدهم المسجّلة لديك</span>
          </div>
          <button
            type="button"
            className={`switch${useOwnCustomerBase ? " on" : ""}`}
            aria-pressed={useOwnCustomerBase}
            onClick={() => setUseOwnCustomerBase((v) => !v)}
          />
        </div>

        {useOwnCustomerBase && (
          <>
            <div className="base-list">
              {[
                { key: "sms" as const, label: "أرقام الجوال (SMS)" },
                { key: "whatsapp" as const, label: "واتساب" },
                { key: "email" as const, label: "البريد الإلكتروني" },
              ].map((row) => (
                <div className="base-row" key={row.key}>
                  <label>
                    <input
                      type="checkbox"
                      name={`base${row.key.charAt(0).toUpperCase()}${row.key.slice(1)}`}
                      checked={baseChannels[row.key]}
                      onChange={(e) =>
                        setBaseChannels((prev) => ({ ...prev, [row.key]: e.target.checked }))
                      }
                    />{" "}
                    {row.label}
                  </label>
                </div>
              ))}
            </div>
            <div className="privacy-note">
              <Icon name="i-shield" style={{ width: "1em", height: "1em" }} />
              سيتم إرسال الرسائل فقط للعملاء الذين وافقوا على تلقي العروض التسويقية، وفق سياسة
              الخصوصية.
            </div>
          </>
        )}
      </div>

      <div className="btn-row">
        <Link href="/campaigns/new/creative" className="btn btn-ghost">
          <Icon name="i-chev" style={{ transform: "scaleX(-1)" }} /> رجوع
        </Link>
        <button className="btn btn-primary" type="submit">
          التالي: الباقة
          <Icon name="i-chev" />
        </button>
      </div>
    </form>
  );
}
