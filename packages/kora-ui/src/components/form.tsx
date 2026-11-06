import { createContext, forwardRef, useContext, useId, useRef, useState } from "react";
import type { ComponentProps, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { Checkbox as RadixCheckbox, Select as RadixSelect, Switch as RadixSwitch } from "radix-ui";
import { Check, ChevronDown, Minus, Upload } from "lucide-react";
import { cn, useLabels } from "./provider";

type FieldState = { id: string; describedBy?: string; invalid: boolean; required?: boolean };
export const FieldContext = createContext<FieldState | null>(null);

export function Field({ label, hint, error, required, className, children }: {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error || hint;
  return (
    <FieldContext.Provider value={{ id, describedBy: message ? messageId : undefined, invalid: Boolean(error), required }}>
      <div className={cn("kr:flex kr:min-w-0 kr:flex-col kr:gap-1.5", className)}>
        <label htmlFor={id} className="kr:text-[0.8125rem] kr:font-medium kr:text-fg">
          {label}
          {required && <span aria-hidden className="kr:ml-0.5 kr:text-danger">*</span>}
        </label>
        {children}
        {message && (
          <p id={messageId} className={cn("kr:text-[0.8125rem]", error ? "kr:text-danger" : "kr:text-muted")}>
            {message}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  );
}

/** Uses 16px text on phones so that iOS does not zoom the page on focus. */
const controlClass = cn(
  "kr:w-full kr:min-w-0 kr:rounded-md kr:border kr:border-line-strong kr:bg-surface kr:px-3 kr:text-base kr:text-fg kr:transition-colors kr:md:text-sm",
  "kr:placeholder:text-muted kr:outline-none kr:focus-visible:border-accent kr:focus-visible:ring-2 kr:focus-visible:ring-accent/30",
  "kr:disabled:cursor-not-allowed kr:disabled:opacity-50 kr:aria-[invalid=true]:border-danger",
);

export function useFieldProps(props: { id?: string; "aria-invalid"?: unknown; "aria-describedby"?: string; required?: boolean }) {
  const field = useContext(FieldContext);
  return {
    id: props.id ?? field?.id,
    "aria-invalid": (props["aria-invalid"] ?? field?.invalid) ? true : undefined,
    "aria-describedby": props["aria-describedby"] ?? field?.describedBy,
    "aria-required": props.required || field?.required || undefined,
  } as const;
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(controlClass, "kr:h-[var(--kora-control-h)]", className)} {...props} {...useFieldProps(props)} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} rows={3} className={cn(controlClass, "kr:py-2", className)} {...props} {...useFieldProps(props)} />;
});

export type SelectOption = { value: string; label: ReactNode; disabled?: boolean };

export function Select({ options, placeholder, className, id, "aria-label": ariaLabel, ...props }: ComponentProps<typeof RadixSelect.Root> & {
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  id?: string;
  "aria-label"?: string;
}) {
  const t = useLabels();
  const fieldProps = useFieldProps({ id });
  return (
    <RadixSelect.Root {...props}>
      <RadixSelect.Trigger
        {...fieldProps}
        aria-label={ariaLabel}
        className={cn(controlClass, "kr:inline-flex kr:h-[var(--kora-control-h)] kr:cursor-pointer kr:items-center kr:justify-between kr:gap-2 kr:text-left kr:data-[placeholder]:text-muted", className)}
      >
        <span className="kr:truncate">
          <RadixSelect.Value placeholder={placeholder ?? t.selectPlaceholder} />
        </span>
        <RadixSelect.Icon>
          <ChevronDown aria-hidden className="kr:size-4 kr:text-muted" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          collisionPadding={8}
          className="kr:z-50 kr:max-h-72 kr:min-w-[var(--radix-select-trigger-width)] kr:overflow-hidden kr:rounded-md kr:border kr:border-line kr:bg-surface kr:text-fg kr:shadow-overlay"
        >
          <RadixSelect.Viewport className="kr:p-1">
            {options.map((o) => (
              <RadixSelect.Item
                key={o.value}
                value={o.value}
                disabled={o.disabled}
                className="kr:flex kr:min-h-10 kr:cursor-pointer kr:items-center kr:justify-between kr:gap-3 kr:rounded-sm kr:px-2.5 kr:text-sm kr:outline-none kr:select-none kr:data-[highlighted]:bg-surface-2 kr:data-[disabled]:opacity-50 kr:md:min-h-8"
              >
                <RadixSelect.ItemText>{o.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator>
                  <Check aria-hidden className="kr:size-4 kr:text-accent" />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}

const inlineLabelClass = "kr:inline-flex kr:min-h-6 kr:items-center kr:gap-2 kr:text-sm kr:text-fg kr:cursor-pointer";

export function Checkbox({ label, className, ...props }: ComponentProps<typeof RadixCheckbox.Root> & { label?: ReactNode }) {
  const box = (
    <RadixCheckbox.Root
      className={cn(
        "kr:relative kr:inline-flex kr:size-[1.125rem] kr:shrink-0 kr:cursor-pointer kr:items-center kr:justify-center kr:rounded-sm kr:border kr:border-line-strong kr:bg-surface kr:outline-none",
        "kr:after:absolute kr:after:-inset-3 kr:md:after:-inset-1",
        "kr:focus-visible:ring-2 kr:focus-visible:ring-accent/40 kr:data-[state=checked]:border-accent kr:data-[state=checked]:bg-accent kr:data-[state=indeterminate]:border-accent kr:data-[state=indeterminate]:bg-accent kr:text-accent-fg kr:disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadixCheckbox.Indicator>
        {props.checked === "indeterminate" ? <Minus aria-hidden className="kr:size-3.5" /> : <Check aria-hidden className="kr:size-3.5" />}
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
  return label ? (
    <label className={inlineLabelClass}>
      {box}
      {label}
    </label>
  ) : (
    box
  );
}

export function Switch({ label, className, ...props }: ComponentProps<typeof RadixSwitch.Root> & { label?: ReactNode }) {
  const control = (
    <RadixSwitch.Root
      className={cn(
        "kr:relative kr:inline-flex kr:h-6 kr:w-10 kr:shrink-0 kr:cursor-pointer kr:items-center kr:rounded-full kr:bg-line-strong kr:p-0.5 kr:outline-none kr:transition-colors",
        "kr:focus-visible:ring-2 kr:focus-visible:ring-accent/40 kr:focus-visible:ring-offset-2 kr:data-[state=checked]:bg-accent kr:disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadixSwitch.Thumb className="kr:block kr:size-5 kr:rounded-full kr:bg-white kr:transition-transform kr:data-[state=checked]:translate-x-4" />
    </RadixSwitch.Root>
  );
  return label ? (
    <label className={inlineLabelClass}>
      {control}
      {label}
    </label>
  ) : (
    control
  );
}

export function OtpInput({ length = 6, value, onChange, onComplete, disabled, autoFocus, className, ...aria }: {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  /** Called once all the digits are present. */
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const fieldProps = useFieldProps({});
  const active = Math.min(value.length, length - 1);
  return (
    <div className={cn("kr:relative kr:flex kr:w-full kr:max-w-xs kr:gap-1.5", className)} onClick={() => inputRef.current?.focus()}>
      {Array.from({ length }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className={cn(
            "kr:flex kr:h-12 kr:min-w-0 kr:flex-1 kr:items-center kr:justify-center kr:rounded-md kr:border kr:bg-surface kr:text-lg kr:font-medium kr:text-fg kr:tabular-nums",
            focused && i === active ? "kr:border-accent kr:ring-2 kr:ring-accent/30" : fieldProps["aria-invalid"] ? "kr:border-danger" : "kr:border-line-strong",
            disabled && "kr:opacity-50",
          )}
        >
          {value[i]}
        </span>
      ))}
      <input
        ref={inputRef}
        value={value}
        disabled={disabled}
        autoFocus={autoFocus}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={length}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          const next = e.target.value.replace(/\D/g, "").slice(0, length);
          onChange(next);
          if (next.length === length && value.length !== length) onComplete?.(next);
        }}
        className="kr:absolute kr:inset-0 kr:size-full kr:cursor-text kr:opacity-0"
        {...fieldProps}
        {...aria}
      />
    </div>
  );
}

/** Drop files or pick them. Uploading and previews stay in your code. `accept` only guides the picker, so check files on your server. */
export function FileDropzone({ onFiles, accept, multiple, hint, disabled, className }: {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  hint?: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const t = useLabels();
  const [over, setOver] = useState(false);
  const fieldProps = useFieldProps({});
  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setOver(!disabled);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (disabled) return;
        const files = [...e.dataTransfer.files];
        if (files.length) onFiles(multiple ? files : files.slice(0, 1));
      }}
      className={cn(
        "kr:flex kr:min-h-28 kr:cursor-pointer kr:flex-col kr:items-center kr:justify-center kr:gap-1 kr:rounded-md kr:border kr:border-dashed kr:border-line-strong kr:p-4 kr:text-center kr:text-sm kr:text-muted kr:transition-colors kr:hover:bg-surface-2 kr:focus-within:border-accent kr:focus-within:ring-2 kr:focus-within:ring-accent/30",
        over && "kr:border-accent kr:bg-accent-soft",
        disabled && "kr:cursor-not-allowed kr:opacity-50",
        className,
      )}
    >
      <Upload aria-hidden className="kr:size-5" />
      <span className="kr:font-medium kr:text-fg">{t.dropFiles}</span>
      {hint && <span className="kr:text-[0.8125rem]">{hint}</span>}
      <input
        {...fieldProps}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="kr:sr-only"
        onChange={(e) => {
          const files = [...(e.target.files ?? [])];
          if (files.length) onFiles(files);
          e.target.value = ""; // Lets the same file be picked again.
        }}
      />
    </label>
  );
}
