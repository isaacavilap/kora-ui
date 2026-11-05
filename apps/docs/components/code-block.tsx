import { highlight } from "@/lib/source";

export async function CodeBlock({ code, lang = "tsx" }: { code: string; lang?: string }) {
  return <Highlighted html={await highlight(code, lang)} />;
}

export function Highlighted({ html, className }: { html: string; className?: string }) {
  return <div className={`code-block ${className ?? ""}`} tabIndex={0} dangerouslySetInnerHTML={{ __html: html }} />;
}

