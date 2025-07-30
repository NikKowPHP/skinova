"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface PrivacyPolicyDialogProps {
  isOpen: boolean;
  onAccept: () => void;
}

export function PrivacyPolicyDialog({ isOpen, onAccept }: PrivacyPolicyDialogProps) {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <Dialog open={isOpen}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Privacy Policy & Terms</DialogTitle>
          <DialogDescription>
            To continue, please review and accept our privacy policy.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 text-sm text-muted-foreground">
          <p>
            We are committed to protecting your privacy. Your skin scans and personal data are encrypted and handled with care. We use third-party services for AI analysis, payments, and analytics.
          </p>
          <p>
            For full details, please read our complete{" "}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              Privacy Policy
            </a>.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="accept-privacy" checked={isChecked} onCheckedChange={(checked) => setIsChecked(checked as boolean)} />
          <Label htmlFor="accept-privacy" className="text-sm font-normal">
            I have read and agree to the Privacy Policy.
          </Label>
        </div>
        <DialogFooter>
          <Button onClick={onAccept} disabled={!isChecked}>
            Agree & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}