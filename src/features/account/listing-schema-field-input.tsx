"use client";

import type { ListingFieldDefinition } from "@/lib/api/catalog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { humanizeSlug } from "@/lib/utils/text";

export function ListingSchemaFieldInput({
  field,
  value,
  onChange,
}: {
  field: ListingFieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const label = `${field.label}${field.required ? " *" : ""}`;

  if (field.type === "boolean") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-brand-forest/10 px-3 py-2.5">
        <Label htmlFor={`schema-${field.key}`} className="text-sm font-medium">
          {label}
        </Label>
        <Switch
          id={`schema-${field.key}`}
          checked={value === true}
          onCheckedChange={(checked) => onChange(checked)}
        />
      </div>
    );
  }

  if (field.type === "date") {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={`schema-${field.key}`}>{label}</Label>
        <Input
          id={`schema-${field.key}`}
          type="date"
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value || undefined)}
        />
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="space-y-1.5">
        <Label>{label}</Label>
        <p className="text-[11px] text-muted-foreground">Choose one.</p>
        <div className="flex flex-wrap gap-2">
          {(field.options ?? []).map((option) => (
            <button
              key={option}
              type="button"
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mantis/40"
              onClick={() => onChange(option)}
            >
              <Badge
                variant={value === option ? "default" : "outline"}
                className={cn(
                  "cursor-pointer px-3 py-1",
                  value === option && "bg-brand-mantis text-brand-forest hover:bg-brand-mantis/90",
                )}
              >
                {humanizeSlug(option)}
              </Badge>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "multiselect") {
    const selected = Array.isArray(value) ? (value as string[]) : [];

    function toggle(option: string) {
      onChange(
        selected.includes(option)
          ? selected.filter((item) => item !== option)
          : [...selected, option],
      );
    }

    return (
      <div className="space-y-1.5">
        <Label>{label}</Label>
        <p className="text-[11px] text-muted-foreground">You can pick more than one.</p>
        <div className="flex flex-wrap gap-2">
          {(field.options ?? []).map((option) => (
            <button
              key={option}
              type="button"
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mantis/40"
              onClick={() => toggle(option)}
            >
              <Badge
                variant={selected.includes(option) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer px-3 py-1",
                  selected.includes(option) &&
                    "bg-brand-mantis text-brand-forest hover:bg-brand-mantis/90",
                )}
              >
                {humanizeSlug(option)}
              </Badge>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "number") {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={`schema-${field.key}`}>{label}</Label>
        <Input
          id={`schema-${field.key}`}
          inputMode="decimal"
          value={value != null ? String(value) : ""}
          onChange={(event) =>
            onChange(event.target.value === "" ? undefined : Number(event.target.value))
          }
          placeholder="Numbers only"
        />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={`schema-${field.key}`}>{label}</Label>
      <Input
        id={`schema-${field.key}`}
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
