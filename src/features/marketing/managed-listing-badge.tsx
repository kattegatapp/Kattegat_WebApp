"use client";

import { ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { useState } from "react";

// Agency slugs are stored, not display names (`managed_by: "kattegat_vetted"`) — this maps
// the known ones and falls back to a humanized version so a future manager added to the
// data doesn't render as a raw slug before the label map is updated.
const MANAGED_BY_LABELS: Record<string, string> = { kattegat_vetted: "Kattegat Vetted" };

function humanizeSlug(slug: string): string {
  return slug
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join(" ");
}

export function ManagedListingBadge({
  managedBy,
  managedAgent,
}: {
  managedBy: string | null;
  managedAgent: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const agency = (managedBy && MANAGED_BY_LABELS[managedBy]) || humanizeSlug(managedBy || "kattegat_vetted");
  const agent = managedAgent?.trim() || null;
  const agentClause = agent ? `, led by ${agent} and her office` : "";
  const agentClauseCollapsed = agent ? ` led by ${agent} and her office` : "";

  return (
    <button
      type="button"
      aria-expanded={expanded}
      onClick={() => setExpanded((value) => !value)}
      className="w-full rounded-2xl border border-brand-forest/10 bg-brand-forest/[0.03] p-4 text-left transition hover:border-brand-mantis/30"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-mantis/15 text-brand-mantis">
          <ShieldCheck className="size-4" />
        </span>
        <p className="flex-1 text-sm font-bold text-brand-forest">Managed by {agency}</p>
        {expanded ? (
          <ChevronUp className="size-4 shrink-0 text-brand-forest/45" />
        ) : (
          <ChevronDown className="size-4 shrink-0 text-brand-forest/45" />
        )}
      </div>
      <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
        {expanded
          ? `This listing is managed by ${agency}, the white-glove talent booking service from the team behind Kattegat.app${agentClause}. Sourcing, negotiation, scheduling and contracting are handled by the agent, so venues and clients deal with a single point of contact from first enquiry through to performance night.`
          : `White-glove booking${agentClauseCollapsed} — one point of contact from enquiry to performance night.`}
      </p>
    </button>
  );
}
