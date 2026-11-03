"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type ConfirmationDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmationDialog({ open, title, description, confirmLabel = "Confirm", destructive = false, busy = false, onOpenChange, onConfirm }: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="pt-2 leading-relaxed">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 pt-2">
          <button type="button" disabled={busy} onClick={() => onOpenChange(false)} className="rounded-full border border-border px-4 py-2 text-sm disabled:opacity-50">Cancel</button>
          <button type="button" disabled={busy} onClick={() => void onConfirm()} className={`rounded-full px-4 py-2 text-sm text-white disabled:opacity-50 ${destructive ? "bg-red-700" : "bg-[#392a25]"}`}>{busy ? "Please wait…" : confirmLabel}</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
