"use client";
import { Field, Input, Stack } from "kora-ui";

export default function Demo() {
  return (
    <Stack gap="md" className="max-w-sm">
      <Field label="Store name" hint="Customers see this on receipts." required>
        <Input defaultValue="Kora Coffee" />
      </Field>
      <Field label="Support email" error="Enter a valid email address.">
        <Input type="email" defaultValue="support@" />
      </Field>
    </Stack>
  );
}

