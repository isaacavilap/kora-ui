"use client";
import { Grid, SectionNav } from "kora-ui";

const sections = [{ id: "demo-identity", label: "Identity" }, { id: "demo-contact", label: "Contact" }, { id: "demo-documents", label: "Documents" }];

export default function Demo() {
  return (
    <Grid cols="10rem minmax(0, 1fr)">
      <SectionNav sections={sections} />
      <div className="grid gap-3">
        {sections.map((s) => <section key={s.id} id={s.id} className="scroll-mt-20 rounded-md border border-[var(--kora-line)] p-4 pb-16 text-sm">{s.label}</section>)}
      </div>
    </Grid>
  );
}
