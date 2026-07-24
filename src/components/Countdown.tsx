import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function formatRemaining(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function Countdown({ dueAt, onExpire }: { dueAt: string; onExpire?: () => void }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const remainingMs = new Date(dueAt).getTime() - now;

  useEffect(() => {
    if (remainingMs <= 0) onExpire?.();
  }, [remainingMs <= 0]);

  return (
    <span className={cn("font-mono font-bold tabular-nums", remainingMs <= 0 && "text-destructive")}>
      {remainingMs <= 0 ? "Expired" : formatRemaining(remainingMs)}
    </span>
  );
}
