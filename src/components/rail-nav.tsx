"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { WIZARD_STEPS } from "@/lib/wizard-steps";

export function RailNav() {
  const pathname = usePathname();
  const currentIndex = WIZARD_STEPS.findIndex((s) => s.path === pathname);

  return (
    <nav className="rail-steps" aria-label="مراحل إنشاء الحملة">
      {WIZARD_STEPS.map((step, i) => {
        const status = i < currentIndex || step.slug === "login" ? "done" : i === currentIndex ? "active" : "upcoming";
        const clickable = step.path !== null;
        const content = (
          <>
            <div className="step-col">
              <div className="step-dot">{status === "done" ? <Icon name="i-check" /> : i + 1}</div>
              {i < WIZARD_STEPS.length - 1 && <div className="step-line" />}
            </div>
            <div className="step-body">
              <div className="step-label">{step.label}</div>
              <div className="step-hint">الخطوة {i + 1}</div>
            </div>
          </>
        );

        return clickable ? (
          <Link key={step.slug} href={step.path!} className={`step-row ${status}`}>
            {content}
          </Link>
        ) : (
          <div key={step.slug} className={`step-row ${status}`} aria-disabled>
            {content}
          </div>
        );
      })}
    </nav>
  );
}
