"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Send } from "lucide-react";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  contactSchema,
  type ContactFormDraft,
  type ContactFormValues,
} from "@/lib/validations/contact";
import { cn } from "@/lib/utils";

const TOPICS: { value: ContactFormValues["topic"]; label: string }[] = [
  { value: "hiring", label: "I want to hire talent" },
  { value: "joining", label: "I want to join as a provider" },
  { value: "partnership", label: "Partnership or press" },
  { value: "support", label: "Product / account support" },
  { value: "other", label: "Something else" },
];

type ContactFormProps = {
  supportEmail: string;
};

export function ContactForm({ supportEmail }: ContactFormProps) {
  const [sent, setSent] = useState(false);
  const form = useForm<ContactFormDraft>({
    resolver: zodResolver(contactSchema) as Resolver<ContactFormDraft>,
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      company: "",
      topic: "",
      message: "",
    },
  });

  function onSubmit(values: ContactFormDraft) {
    const parsed = contactSchema.parse(values);
    const topicLabel =
      TOPICS.find((topic) => topic.value === parsed.topic)?.label ?? parsed.topic;

    const body = [
      `Name: ${parsed.fullName}`,
      `Email: ${parsed.email}`,
      parsed.phone ? `Phone: ${parsed.phone}` : null,
      parsed.company ? `Company: ${parsed.company}` : null,
      `Topic: ${topicLabel}`,
      "",
      parsed.message,
    ]
      .filter(Boolean)
      .join("\n");

    const mailto = new URL(`mailto:${supportEmail}`);
    mailto.searchParams.set("subject", `Kattegat enquiry — ${topicLabel}`);
    mailto.searchParams.set("body", body);
    window.location.href = mailto.toString();
    setSent(true);
  }

  // eslint-disable-next-line react-hooks/incompatible-library -- RHF watch is intentionally stateful
  const selectedTopic = form.watch("topic");

  if (sent) {
    return (
      <div className="rounded-[1.75rem] border border-brand-mantis/30 bg-white p-8 text-center sm:p-10">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-mantis/20 text-brand-forest">
          <CheckCircle2 className="size-7" />
        </span>
        <h3 className="mt-5 text-2xl font-extrabold tracking-[-0.03em]">
          Your message is ready to send
        </h3>
        <p className="mt-3 text-sm leading-7 text-brand-forest/65">
          We opened your email app with the details filled in. Send it there, or
          write again to {supportEmail}.
        </p>
        <Button
          type="button"
          className="mt-7 h-11 rounded-xl bg-brand-forest px-5 font-extrabold text-white hover:bg-brand-blue"
          onClick={() => {
            setSent(false);
            form.reset();
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="rounded-[1.75rem] border border-brand-forest/10 bg-white p-6 shadow-[0_18px_50px_rgb(0_57_18/0.08)] sm:p-8"
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="fullName"
          label="Full name"
          error={form.formState.errors.fullName?.message}
        >
          <Input
            id="fullName"
            autoComplete="name"
            className="h-11 rounded-xl border-brand-forest/15"
            {...form.register("fullName")}
          />
        </Field>
        <Field
          id="email"
          label="Email"
          error={form.formState.errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="h-11 rounded-xl border-brand-forest/15"
            {...form.register("email")}
          />
        </Field>
        <Field
          id="phone"
          label="Phone (optional)"
          error={form.formState.errors.phone?.message}
        >
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            className="h-11 rounded-xl border-brand-forest/15"
            {...form.register("phone")}
          />
        </Field>
        <Field
          id="company"
          label="Company (optional)"
          error={form.formState.errors.company?.message}
        >
          <Input
            id="company"
            autoComplete="organization"
            className="h-11 rounded-xl border-brand-forest/15"
            {...form.register("company")}
          />
        </Field>
      </div>

      <div className="mt-5">
        <Label className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-forest/55">
          Topic
        </Label>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {TOPICS.map((topic) => {
            const selected = selectedTopic === topic.value;
            return (
              <button
                key={topic.value}
                type="button"
                onClick={() =>
                  form.setValue("topic", topic.value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                className={cn(
                  "rounded-xl border px-4 py-3 text-left text-sm font-bold transition",
                  selected
                    ? "border-brand-mantis bg-brand-mantis/15 text-brand-forest"
                    : "border-brand-forest/12 bg-[#F7F9F8] text-brand-forest/70 hover:border-brand-forest/25",
                )}
              >
                {topic.label}
              </button>
            );
          })}
        </div>
        {form.formState.errors.topic?.message ? (
          <p className="mt-2 text-xs font-semibold text-red-600">
            {form.formState.errors.topic.message}
          </p>
        ) : null}
      </div>

      <div className="mt-5">
        <Field
          id="message"
          label="How can we help?"
          error={form.formState.errors.message?.message}
        >
          <Textarea
            id="message"
            rows={6}
            placeholder="Share a short description of your enquiry…"
            className="rounded-xl border-brand-forest/15"
            {...form.register("message")}
          />
        </Field>
      </div>

      <Button
        type="submit"
        className="mt-7 h-12 w-full rounded-xl bg-brand-mantis px-6 font-extrabold text-brand-forest hover:bg-brand-forest hover:text-white sm:w-auto"
      >
        Send message
        <Send className="size-4" />
      </Button>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label
        htmlFor={id}
        className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-forest/55"
      >
        {label}
      </Label>
      <div className="mt-2">{children}</div>
      {error ? (
        <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
