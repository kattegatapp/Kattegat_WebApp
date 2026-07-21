"use client";

import { Check, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

export type PasswordCheck = {
  label: string;
  passed: boolean;
};

const STRENGTH_LABELS = ["Weak", "Weak", "Fair", "Good", "Strong"] as const;

export function getPasswordChecks(password: string, minLength = 8): PasswordCheck[] {
  return [
    { label: `${minLength}+ characters`, passed: password.length >= minLength },
    { label: "Upper & lowercase", passed: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "A number", passed: /[0-9]/.test(password) },
    { label: "A special character", passed: /[^A-Za-z0-9]/.test(password) },
  ];
}

function strengthBarClass(score: number) {
  if (score <= 1) return "bg-red-500";
  if (score === 2) return "bg-amber-500";
  if (score === 3) return "bg-brand-blue";
  return "bg-brand-mantis";
}

function strengthLabelClass(score: number) {
  if (score <= 1) return "text-red-600";
  if (score === 2) return "text-amber-600";
  if (score === 3) return "text-brand-blue";
  return "text-brand-mantis";
}

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const checks = getPasswordChecks(password);
  const score = checks.filter((check) => check.passed).length;
  const barClass = strengthBarClass(score);
  const labelClass = strengthLabelClass(score);

  return (
    <div className="space-y-2.5 rounded-xl border border-brand-forest/8 bg-brand-forest/[0.03] px-3 py-3">
      <div className="flex gap-1">
        {checks.map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              index < score ? barClass : "bg-brand-forest/10",
            )}
          />
        ))}
      </div>
      <p className={cn("text-xs font-bold", labelClass)}>{STRENGTH_LABELS[score]} password</p>
      <ul className="flex flex-wrap gap-x-3 gap-y-1.5">
        {checks.map((check) => (
          <li key={check.label} className="flex items-center gap-1.5 text-xs">
            {check.passed ? (
              <Check className="size-3.5 text-brand-mantis" aria-hidden />
            ) : (
              <Circle className="size-3 text-brand-forest/25" aria-hidden />
            )}
            <span className={check.passed ? "text-brand-forest/75" : "text-brand-forest/45"}>
              {check.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
