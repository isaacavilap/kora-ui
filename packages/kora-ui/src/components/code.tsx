import { Fragment, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode, TextareaHTMLAttributes } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "./button";
import { useFieldProps } from "./form";
import { cn, useLabels } from "./provider";

type TokenType = "keyword" | "string" | "comment" | "number" | "func" | "type" | "tag" | "attr" | "word" | "text";
export type Token = { type: TokenType; value: string };

// Each rule is [type, regex source]; the first one that matches at a position wins. Inner groups must be non-capturing.
type Rule = [TokenType, string];
const STR = String.raw`"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'`;
const JS_KEYWORDS = new Set("const let var function class extends implements interface type enum namespace declare satisfies import export from as default return if else for while do switch case break continue try catch finally throw async await yield new this super typeof instanceof in of void delete public private protected readonly static abstract override keyof infer".split(" "));
const BASH_KEYWORDS = new Set("if then else elif fi for while do done case esac in function return local export".split(" "));
const LITERALS = new Set(["true", "false", "null", "undefined", "NaN"]);

const RULES: Record<string, Rule[]> = {
  js: [
    ["comment", String.raw`\/\*[\s\S]*?\*\/|\/\/[^\n]*`],
    ["string", STR + "|`(?:[^`\\\\]|\\\\.)*`"],
    ["tag", String.raw`<\/?[A-Za-z][\w.:-]*`],
    ["number", String.raw`\b\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?n?\b`],
    ["func", String.raw`[A-Za-z_$][\w$]*(?=\s*\()`],
    ["word", String.raw`[A-Za-z_$][\w$]*`],
  ],
  json: [
    ["attr", String.raw`"(?:[^"\\\n]|\\.)*"(?=\s*:)`],
    ["string", STR],
    ["number", String.raw`-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b|\b(?:true|false|null)\b`],
  ],
  css: [
    ["comment", String.raw`\/\*[\s\S]*?\*\/`],
    ["string", STR],
    ["keyword", String.raw`@[\w-]+|!important`],
    ["attr", String.raw`--?[A-Za-z][\w-]*(?=\s*:)|\b[a-z-]+(?=\s*:[^:{]*;)`],
    ["number", String.raw`#[\da-fA-F]{3,8}\b|-?\b\d+(?:\.\d+)?(?:px|r?em|%|s|ms|fr|vh|vw|deg|ch)?\b`],
    ["func", String.raw`[\w-]+(?=\()`],
    ["tag", String.raw`[.#]?[A-Za-z_][\w-]*(?=[^{};]*\{)`],
  ],
  html: [
    ["comment", String.raw`<!--[\s\S]*?-->`],
    ["tag", String.raw`<\/?[A-Za-z][\w-]*|\/?>`],
    ["attr", String.raw`[\w:@.-]+(?==)`],
    ["string", STR],
  ],
  bash: [
    ["comment", String.raw`(?<![\w$])#[^\n]*`],
    ["string", STR],
    ["number", String.raw`\$\{[^}\n]+\}|\$\w+`],
    ["attr", String.raw`(?<=\s)--?[A-Za-z][\w-]*`],
    ["func", String.raw`(?<=^[ \t]*|[|&;][ \t]*|\$\([ \t]*)[A-Za-z][\w.-]*`],
    ["word", String.raw`[A-Za-z_][\w-]*`],
  ],
};

const ALIASES: Record<string, string> = { ts: "js", tsx: "js", jsx: "js", typescript: "js", javascript: "js", mjs: "js", xml: "html", svg: "html", sh: "bash", shell: "bash", zsh: "bash", scss: "css" };
const compiled = new Map<string, { re: RegExp; types: TokenType[] }>();

function rulesFor(language: string) {
  const key = ALIASES[language.toLowerCase()] ?? language.toLowerCase();
  const rules = RULES[key];
  if (!rules) return null;
  let entry = compiled.get(key);
  if (!entry) {
    entry = { re: new RegExp(rules.map(([, source]) => `(${source})`).join("|"), "gm"), types: rules.map(([type]) => type) };
    compiled.set(key, entry);
  }
  return { ...entry, key };
}

/** Splits code into colored tokens, one list for each line. Unknown languages come back as plain text. */
export function highlight(code: string, language = "plain"): Token[][] {
  const rules = rulesFor(language);
  const tokens: Token[] = [];
  if (!rules) tokens.push({ type: "text", value: code });
  else {
    let last = 0;
    for (const match of code.matchAll(rules.re)) {
      const start = match.index ?? 0;
      if (start > last) tokens.push({ type: "text", value: code.slice(last, start) });
      const group = match.findIndex((g, i) => i > 0 && g !== undefined);
      let type = rules.types[group - 1] ?? "text";
      const value = match[0];
      if (type === "func" || type === "word") {
        const keywords = rules.key === "bash" ? BASH_KEYWORDS : JS_KEYWORDS;
        if (keywords.has(value)) type = "keyword";
        else if (LITERALS.has(value)) type = "number";
        else if (type === "word") type = rules.key === "js" && /^[A-Z]/.test(value) ? "type" : "text";
      }
      tokens.push({ type, value });
      last = start + value.length;
    }
    if (last < code.length) tokens.push({ type: "text", value: code.slice(last) });
  }
  const lines: Token[][] = [[]];
  for (const token of tokens) {
    token.value.split("\n").forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part) lines[lines.length - 1]!.push({ type: token.type, value: part });
    });
  }
  return lines;
}

// Semantic tokens of the theme, so both light and dark (and client colors) stay readable.
const TOKEN_CLASS: Record<TokenType, string> = {
  keyword: "kr:text-danger",
  string: "kr:text-info",
  number: "kr:text-info",
  comment: "kr:text-muted kr:italic",
  func: "kr:text-warning",
  type: "kr:text-warning",
  tag: "kr:text-success",
  attr: "kr:text-warning",
  word: "",
  text: "",
};

function renderLine(line: Token[]): ReactNode {
  return line.map((token, i) => (TOKEN_CLASS[token.type] ? <span key={i} className={TOKEN_CLASS[token.type]}>{token.value}</span> : token.value));
}

const LANGUAGE_NAMES: Record<string, string> = { ts: "TypeScript", typescript: "TypeScript", tsx: "TSX", js: "JavaScript", javascript: "JavaScript", jsx: "JSX", json: "JSON", css: "CSS", scss: "SCSS", html: "HTML", xml: "XML", bash: "Bash", sh: "Shell", shell: "Shell", zsh: "Shell" };

/** Copies text and remembers which key was copied for a moment, for the "Copied" feedback. */
export function useCopy(ms = 1500) {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async (text: string, key = "copy") => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return false;
    }
    setCopied(key);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), ms);
    return true;
  };
  return { copied, copy };
}

// The scoped reset gives every kr: element the sans font, so token spans need mono set on them too.
const codeText = "kr:font-mono kr:[&_*]:font-mono kr:text-[0.8125rem] kr:leading-6";

export function CodeBlock({ code, language = "plain", title, showLanguage = true, copyable = true, lineNumbers, highlightLines, wrap, className }: {
  code: string;
  /** ts, tsx, js, jsx, json, css, html, bash. Others show as plain text. */
  language?: string;
  /** A file name or title above the code. */
  title?: ReactNode;
  showLanguage?: boolean;
  copyable?: boolean;
  lineNumbers?: boolean;
  /** Line numbers to mark, starting at 1. */
  highlightLines?: number[];
  /** Wraps long lines. By default they scroll sideways inside the block. */
  wrap?: boolean;
  className?: string;
}) {
  const t = useLabels();
  const { copied, copy } = useCopy();
  const source = code.replace(/\n$/, "");
  const lines = highlight(source, language);
  const marked = new Set(highlightLines);
  const languageName = LANGUAGE_NAMES[language.toLowerCase()];
  const digits = String(lines.length).length;
  const hasHeader = Boolean(title || (showLanguage && languageName) || copyable);

  return (
    <div className={cn("kr:min-w-0 kr:max-w-full kr:overflow-hidden kr:rounded-md kr:border kr:border-line kr:bg-surface kr:text-fg", className)}>
      {hasHeader && (
        <div className="kr:flex kr:min-h-10 kr:items-center kr:gap-2 kr:border-b kr:border-line kr:bg-surface-2 kr:py-1 kr:pr-1 kr:pl-3">
          {title && <span className="kr:min-w-0 kr:truncate kr:font-mono kr:text-xs kr:text-fg">{title}</span>}
          {showLanguage && languageName && <span className="kr:text-xs kr:text-muted">{languageName}</span>}
          {copyable && (
            <Button variant="ghost" size="sm" className="kr:ml-auto" onClick={() => copy(source)}>
              {copied ? <Check aria-hidden className="kr:text-success" /> : <Copy aria-hidden />}
              <span aria-live="polite">{copied ? t.copied : t.copy}</span>
            </Button>
          )}
        </div>
      )}
      <pre
        tabIndex={wrap ? undefined : 0}
        aria-label={typeof title === "string" ? title : languageName}
        className={cn(codeText, "kr:py-3 kr:outline-none kr:focus-visible:ring-2 kr:focus-visible:ring-inset kr:focus-visible:ring-accent", wrap ? "kr:whitespace-pre-wrap kr:[overflow-wrap:anywhere]" : "kr:overflow-x-auto kr:whitespace-pre")}
        style={{ tabSize: 2 }}
      >
        <code className={cn("kr:block", !wrap && "kr:w-max kr:min-w-full")}>
          {lines.map((line, i) => (
            <span
              key={i}
              data-highlighted={marked.has(i + 1) || undefined}
              className={cn("kr:flex kr:px-3", marked.has(i + 1) && "kr:bg-info-soft kr:shadow-[inset_2px_0_0_var(--kora-info)]")}
            >
              {lineNumbers && (
                <span aria-hidden className="kr:mr-4 kr:shrink-0 kr:text-right kr:text-muted kr:select-none" style={{ width: `${digits}ch` }}>{i + 1}</span>
              )}
              <span className="kr:min-w-0 kr:flex-1">{line.length ? renderLine(line) : " "}</span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

/**
 * Replaces the selection of a field with text, keeping the browser undo history.
 * It fires a normal input event, so React's onChange runs.
 */
export function insertText(el: HTMLTextAreaElement | HTMLInputElement, text: string, start = el.selectionStart ?? 0, end = el.selectionEnd ?? start) {
  el.focus();
  el.setSelectionRange(start, end);
  let done = false;
  try {
    done = typeof document.execCommand === "function" && document.execCommand("insertText", false, text);
  } catch {
    done = false;
  }
  if (!done) {
    el.setRangeText(text, start, end, "end");
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

type CodeEditorProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "defaultValue" | "onChange"> & {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  language?: string;
  /** Spaces that Tab inserts. Default 2. */
  tabSize?: number;
};

/**
 * A textarea with the CodeBlock colors drawn under it. Tab indents; press Escape first to move focus with Tab.
 * Lines wrap, so the textarea and the colored copy always line up.
 */
export function CodeEditor({ value, defaultValue = "", onChange, language = "plain", tabSize = 2, className, rows = 8, onKeyDown, onFocus, ...props }: CodeEditorProps) {
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;
  const tabTrap = useRef(true);
  const field = useFieldProps(props);
  const lines = highlight(current, language);

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || props.readOnly) return;
    const el = e.currentTarget;
    const { selectionStart: start, selectionEnd: end } = el;
    if (e.key === "Escape") tabTrap.current = false;
    else if (e.key === "Tab" && tabTrap.current && !e.shiftKey) {
      e.preventDefault();
      insertText(el, " ".repeat(tabSize), start, end);
    } else if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      const lineStart = current.lastIndexOf("\n", start - 1) + 1;
      const indent = /^[ \t]*/.exec(current.slice(lineStart, start))![0];
      const opens = /[{[(]\s*$/.test(current.slice(lineStart, start));
      e.preventDefault();
      insertText(el, "\n" + indent + (opens ? " ".repeat(tabSize) : ""), start, end);
    }
  };

  // Both layers share one grid cell, font and padding: the grid grows with the code, so there is no scroll to keep in sync.
  const layer = cn(codeText, "kr:col-start-1 kr:row-start-1 kr:m-0 kr:px-3 kr:py-2.5 kr:whitespace-pre-wrap kr:[overflow-wrap:anywhere]");
  return (
    <div className={cn("kr:grid kr:min-w-0 kr:rounded-md kr:border kr:border-line-strong kr:bg-surface kr:text-fg kr:transition-colors kr:focus-within:border-accent kr:focus-within:ring-2 kr:focus-within:ring-accent/30 kr:has-[[aria-invalid=true]]:border-danger", props.disabled && "kr:opacity-50", className)}>
      <pre aria-hidden className={cn(layer, "kr:pointer-events-none")} style={{ tabSize }}>
        {lines.map((line, i) => <Fragment key={i}>{i > 0 && "\n"}{renderLine(line)}</Fragment>)}
        {" "}
      </pre>
      <textarea
        {...props}
        {...field}
        rows={rows}
        value={current}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        onFocus={(e) => {
          tabTrap.current = true;
          onFocus?.(e);
        }}
        onChange={(e) => {
          if (value === undefined) setInner(e.target.value);
          onChange?.(e.target.value);
        }}
        onKeyDown={handleKey}
        className={cn(layer, "kr:resize-none kr:overflow-hidden kr:bg-transparent kr:text-transparent kr:caret-fg kr:outline-none kr:placeholder:text-muted kr:disabled:cursor-not-allowed kr:selection:bg-info/25")}
        style={{ tabSize }}
      />
    </div>
  );
}
