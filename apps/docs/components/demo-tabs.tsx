"use client";
import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "kora-ui";

export function DemoTabs({ preview, code }: { preview: ReactNode; code: ReactNode }) {
  return (
    <Tabs defaultValue="preview">
      <TabsList>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <TabsContent value="preview">
        <div className="overflow-hidden rounded-lg border border-[var(--kora-line)] bg-[var(--kora-surface)] p-4 md:p-6">{preview}</div>
      </TabsContent>
      <TabsContent value="code">{code}</TabsContent>
    </Tabs>
  );
}

