import { llmsTxt } from "kora-ui-mcp";

export const dynamic = "force-static";

export function GET() {
  return new Response(llmsTxt("https://kora-ui.istmocode.com"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
