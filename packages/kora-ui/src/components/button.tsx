import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { Slot } from "radix-ui";
import { cn } from "./provider";

const variants = {
  primary: "kr:bg-accent kr:text-accent-fg kr:hover:bg-accent-hover",
  secondary: "kr:bg-surface kr:text-fg kr:border kr:border-line-strong kr:hover:bg-surface-2",
  ghost: "kr:text-fg kr:hover:bg-surface-2",
  danger: "kr:bg-danger kr:text-surface kr:hover:bg-danger-hover",
};

const sizes = {
  md: "kr:h-[var(--kora-control-h)] kr:px-3.5 kr:text-sm",
  sm: "kr:h-[calc(var(--kora-control-h)-0.5rem)] kr:px-2.5 kr:text-[0.8125rem]",
  /** Calls to action on marketing pages. */
  lg: "kr:h-[calc(var(--kora-control-h)+0.5rem)] kr:px-5 kr:text-base",
  icon: "kr:size-[var(--kora-control-h)] kr:shrink-0",
};

export const focusRing =
  "kr:outline-none kr:focus-visible:outline-2 kr:focus-visible:outline-offset-2 kr:focus-visible:outline-accent";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  /** Render the child element, such as a link, with button styles. */
  asChild?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, asChild, disabled, className, children, type, ...props },
  ref,
) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : (type ?? "button")}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "kr:inline-flex kr:items-center kr:justify-center kr:gap-2 kr:whitespace-nowrap kr:rounded-md kr:font-medium kr:transition-colors kr:select-none kr:touch-manipulation",
        "kr:disabled:opacity-50 kr:disabled:cursor-not-allowed kr:[&_svg]:size-4 kr:[&_svg]:shrink-0",
        focusRing,
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && <Spinner />}
          {children}
        </>
      )}
    </Comp>
  );
});

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "kr:inline-block kr:size-4 kr:shrink-0 kr:rounded-full kr:border-2 kr:border-current kr:border-t-transparent kr:animate-[kr-spin_0.7s_linear_infinite]",
        className,
      )}
    />
  );
}

export const popoverClass =
  "kr:z-50 kr:rounded-md kr:border kr:border-line kr:bg-surface kr:text-fg kr:shadow-overlay kr:outline-none kr:animate-[kr-pop-in_120ms_ease-out]";
