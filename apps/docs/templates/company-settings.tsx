"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, Field, FileDropzone, Grid, Input, PageHeader, SaveBar, SectionNav, Switch, Textarea, Toaster, toast } from "kora-ui";
import { wait } from "@/lib/demo-data";
import { DemoShell } from "./shell";

const sections = [
  { id: "identity", label: "Identity" },
  { id: "contact", label: "Contact" },
  { id: "documents", label: "Documents" },
  { id: "modules", label: "Modules" },
];
const allModules = [
  { id: "requests", label: "Requests", description: "Work and supply requests, by stage." },
  { id: "agenda", label: "Agenda", description: "Visits and deliveries on a calendar." },
  { id: "assets", label: "Assets", description: "What the company owns, and where it is." },
  { id: "orders", label: "Orders", description: "Sales and their payments." },
];
const initialModules: Record<string, boolean> = { requests: true, agenda: true, assets: true, orders: false };

export default function Template() {
  const [version, setVersion] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modules, setModules] = useState(initialModules);

  return (
    <DemoShell page="company-settings" title="Company settings">
      <Toaster />
      <PageHeader title="Company settings" description="Each company has its own identity, documents, and modules." />
      <form
        key={version}
        onChange={() => setDirty(true)}
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          await wait();
          setSaving(false);
          setDirty(false);
          toast.success("Settings saved.");
        }}
      >
        <Grid cols="12rem minmax(0, 1fr)">
          <SectionNav sections={sections} />
          <div className="grid min-w-0 max-w-3xl gap-[var(--kora-gap)]">
            <Card id="identity" className="scroll-mt-20">
              <CardHeader title="Identity" description="Shown in the menu and on documents." />
              <CardContent className="grid gap-4">
                <Field label="Trade name" required><Input name="name" defaultValue="Kora Coffee" required /></Field>
                <Field label="Legal name"><Input name="legal" defaultValue="Kora Coffee Inc." /></Field>
                <Field label="Tax ID"><Input name="tax" defaultValue="155-000-1234" /></Field>
                <Field label="Logo"><FileDropzone accept="image/*" hint="PNG or SVG, up to 2 MB" onFiles={() => setDirty(true)} /></Field>
              </CardContent>
            </Card>
            <Card id="contact" className="scroll-mt-20">
              <CardHeader title="Contact" />
              <CardContent className="grid gap-4">
                <Field label="Email"><Input name="email" type="email" defaultValue="hello@koracoffee.com" /></Field>
                <Field label="Phone"><Input name="phone" type="tel" defaultValue="+507 6000-0001" /></Field>
                <Field label="Address"><Textarea name="address" rows={2} defaultValue="Calle 50, Panama City" /></Field>
              </CardContent>
            </Card>
            <Card id="documents" className="scroll-mt-20">
              <CardHeader title="Documents" description="Added to everything this company prints or sends." />
              <CardContent className="grid gap-4">
                <Field label="Number prefix" hint="New documents start with this text."><Input name="prefix" defaultValue="KC-" /></Field>
                <Field label="Footer"><Textarea name="footer" rows={3} defaultValue="Thank you for choosing Kora Coffee." /></Field>
              </CardContent>
            </Card>
            <Card id="modules" className="scroll-mt-20">
              <CardHeader title="Modules" description="Turned-off modules leave this company's menu. Their records stay." />
              <CardContent className="grid gap-4">
                {allModules.map((module) => (
                  <div key={module.id} className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{module.label}</p>
                      <p className="text-[0.8125rem] text-[var(--kora-muted)]">{module.description}</p>
                    </div>
                    <Switch aria-label={module.label} checked={modules[module.id]} onCheckedChange={(on) => { setModules({ ...modules, [module.id]: on }); setDirty(true); }} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </Grid>
        <SaveBar
          dirty={dirty}
          saving={saving}
          onDiscard={() => {
            setVersion(version + 1);
            setModules(initialModules);
            setDirty(false);
          }}
        />
      </form>
    </DemoShell>
  );
}
