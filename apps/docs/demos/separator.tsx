"use client";
import { Separator } from "kora-ui";

export default function Demo() {
  return (
    <div className="max-w-sm text-sm">
      <p className="pb-3">Account</p>
      <Separator />
      <div className="flex h-10 items-center gap-3">
        <span>Profile</span>
        <Separator orientation="vertical" className="h-4" />
        <span>Security</span>
      </div>
    </div>
  );
}

