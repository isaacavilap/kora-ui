import { highlight } from "@/lib/source";
import { CopyCode } from "@/components/copy-code";

export async function CodeBlock({ code, lang = "tsx" }: { code: string; lang?: string }) {
  return (
    <div className="relative">
      <Highlighted html={await highlight(code, lang)} className="[&_pre]:pr-12" />
      <CopyCode code={code} />
    </div>
  );
}

export function Highlighted({ html, className }: { html: string; className?: string }) {
  return <div className={`code-block ${className ?? ""}`} tabIndex={0} dangerouslySetInnerHTML={{ __html: html }} />;
}
