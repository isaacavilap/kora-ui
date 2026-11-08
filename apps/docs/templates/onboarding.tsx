"use client";
import { useState } from "react";
import { Checkbox, Field, Input, Select, Stack } from "kora-ui";
import { OnboardingWizard } from "kora-ui/screens";
import { wait } from "@/lib/demo-data";
import { brand } from "./logo";

export default function Template() {
  const [store, setStore] = useState("");
  const [storeError, setStoreError] = useState<string>();
  return (
    <OnboardingWizard
      brand={brand}
      onComplete={async () => {
        await wait();
        window.location.href = "/preview/dashboard";
      }}
      steps={[
        {
          title: "Your store",
          description: "This name appears on receipts and reports.",
          validate: () => {
            setStoreError(store.trim() ? undefined : "Enter a store name.");
            return Boolean(store.trim());
          },
          content: (
            <Stack gap="md">
              <Field label="Store name" error={storeError} required>
                <Input value={store} onChange={(e) => setStore(e.target.value)} />
              </Field>
              <Field label="Currency">
                <Select defaultValue="usd" options={[{ value: "usd", label: "US dollar" }, { value: "eur", label: "Euro" }]} />
              </Field>
            </Stack>
          ),
        },
        {
          title: "Invite your team",
          description: "You can do this later from Members.",
          optional: true,
          content: <Field label="Teammate's email"><Input type="email" /></Field>,
        },
        {
          title: "Choose alerts",
          description: "Pick what should reach your inbox.",
          content: (
            <Stack className="justify-start gap-3">
              <Checkbox label="Failed payments" defaultChecked />
              <Checkbox label="Daily sales summary" />
              <Checkbox label="New team members" defaultChecked />
            </Stack>
          ),
        },
      ]}
    />
  );
}

