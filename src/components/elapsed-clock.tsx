"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";

export function ElapsedClock({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(startedAt).getTime();
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;

  return (
    <div className="rail-clock">
      <span className="l">
        <Icon name="i-clock" /> الوقت المنقضي
      </span>
      <span className="t">
        {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
      </span>
    </div>
  );
}
