"use client";
import { Field, Input } from "kora-ui";

export default function Demo() {
  return (
    <div className="grid max-w-sm gap-4">
      <Field label="Store name" hint="Customers see this on receipts." required>
        <Input defaultValue="Kora Coffee" />
      </Field>
      <Field label="Support email" error="Enter a valid email address.">
        <Input type="email" defaultValue="support@" />
      </Field>
    </div>
  );
}

