"use client";

import { Headphones, Mail, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  openVipSupportChannel,
  type VipSupportChannels,
} from "@/lib/vip-support";

type VipSupportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channels: VipSupportChannels;
};

export function VipSupportDialog({
  open,
  onOpenChange,
  channels,
}: VipSupportDialogProps) {
  function choose(href: string) {
    onOpenChange(false);
    openVipSupportChannel(href);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-brand-forest/10 bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-brand-forest">
            <Headphones className="size-5 text-brand-mantis" />
            VIP Support
          </DialogTitle>
          <DialogDescription>
            Select a channel to contact VIP Support. Every request is handled as
            a priority.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 pt-1">
          {channels.whatsappHref ? (
            <Button
              type="button"
              variant="outline"
              className="h-auto justify-start gap-3 rounded-xl border-brand-forest/12 px-3 py-3 text-left text-brand-forest hover:bg-brand-forest/5"
              onClick={() => choose(channels.whatsappHref!)}
            >
              <span className="grid size-10 place-items-center rounded-[10px] bg-[#25D366]/12 text-[#128C7E]">
                <MessageCircle className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold">WhatsApp</span>
                <span className="block text-xs font-medium text-brand-forest/60">
                  Chat with VIP Support
                </span>
              </span>
            </Button>
          ) : null}

          {channels.emailHref ? (
            <Button
              type="button"
              variant="outline"
              className="h-auto justify-start gap-3 rounded-xl border-brand-forest/12 px-3 py-3 text-left text-brand-forest hover:bg-brand-forest/5"
              onClick={() => choose(channels.emailHref!)}
            >
              <span className="grid size-10 place-items-center rounded-[10px] bg-brand-forest/6 text-brand-forest">
                <Mail className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold">Email</span>
                <span className="block text-xs font-medium text-brand-forest/60">
                  Send a message by email
                </span>
              </span>
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
