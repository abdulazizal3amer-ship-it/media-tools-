"use client";

import { useFormStatus } from "react-dom";
import { Icon } from "@/components/icons";

export function LaunchButton() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary" type="submit" disabled={pending}>
      <Icon name="i-rocket" /> {pending ? "جاري الإطلاق..." : "إطلاق الحملة الآن"}
    </button>
  );
}
