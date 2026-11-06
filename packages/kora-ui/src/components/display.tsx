import { Fragment, forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { Avatar as RadixAvatar, Separator as RadixSeparator } from "radix-ui";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "./provider";

type DivProps = HTMLAttributes<HTMLDivElement>;

const tones = {
  neutral: "kr:bg-surface-2 kr:text-muted",
  accent: "kr:bg-accent-soft kr:text-accent",
  success: "kr:bg-success-soft kr:text-success",
  warning: "kr:bg-warning-soft kr:text-warning",
  danger: "kr:bg-danger-soft kr:text-danger",
  info: "kr:bg-info-soft kr:text-info",
};
export type Tone = keyof typeof tones;

export function Badge({ tone = "neutral", className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "kr:inline-flex kr:items-center kr:gap-1 kr:rounded-sm kr:px-1.5 kr:py-0.5 kr:text-xs kr:font-medium kr:whitespace-nowrap kr:[&_svg]:size-3",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

export const Card = forwardRef<HTMLDivElement, DivProps>(function Card({ className, ...props }, ref) {
  return (
    <div ref={ref} className={cn("kr:min-w-0 kr:rounded-lg kr:border kr:border-line kr:bg-surface kr:text-fg", className)} {...props} />
  );
});

export function CardHeader({ className, title, description, actions, children, ...props }: Omit<DivProps, "title"> & {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className={cn("kr:flex kr:flex-wrap kr:items-start kr:justify-between kr:gap-x-4 kr:gap-y-2 kr:p-4 kr:pb-0", className)} {...props}>
      {(title || description) && (
        <div className="kr:min-w-0">
          {title && <h2 className="kr:text-sm kr:font-semibold kr:text-fg">{title}</h2>}
          {description && <p className="kr:mt-0.5 kr:text-[0.8125rem] kr:text-muted">{description}</p>}
        </div>
      )}
      {children}
      {actions && <div className="kr:flex kr:flex-wrap kr:items-center kr:gap-2">{actions}</div>}
    </div>
  );
}

export function CardContent({ className, ...props }: DivProps) {
  return <div className={cn("kr:p-4", className)} {...props} />;
}

export function CardFooter({ className, ...props }: DivProps) {
  return <div className={cn("kr:flex kr:flex-wrap kr:items-center kr:gap-2 kr:border-t kr:border-line kr:p-4", className)} {...props} />;
}

const alertIcons = { info: Info, success: CheckCircle2, warning: AlertTriangle, danger: XCircle };

export function Alert({ tone = "info", title, className, children, ...props }: Omit<DivProps, "title"> & {
  tone?: keyof typeof alertIcons;
  title?: ReactNode;
}) {
  const Icon = alertIcons[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("kr:flex kr:gap-2.5 kr:rounded-md kr:p-3 kr:text-sm", tones[tone], className)}
      {...props}
    >
      <Icon aria-hidden className="kr:mt-0.5 kr:size-4 kr:shrink-0" />
      <div className="kr:min-w-0 kr:text-fg">
        {title && <p className="kr:font-medium">{title}</p>}
        {children && <div className={title ? "kr:mt-0.5 kr:text-muted" : undefined}>{children}</div>}
      </div>
    </div>
  );
}

export function initials(name: string) {
  const words = name.trim().split(/\s+/);
  return ((words[0]?.[0] ?? "") + (words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "")).toUpperCase();
}

export function Avatar({ name, src, size = 32, className }: { name: string; src?: string; size?: number; className?: string }) {
  return (
    <RadixAvatar.Root
      className={cn("kr:inline-flex kr:shrink-0 kr:items-center kr:justify-center kr:overflow-hidden kr:rounded-full kr:bg-surface-2 kr:font-medium kr:text-muted", className)}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {src && <RadixAvatar.Image src={src} alt={name} className="kr:size-full kr:object-cover" />}
      <RadixAvatar.Fallback aria-label={name}>{initials(name)}</RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
}

export function Separator({ orientation = "horizontal", className }: { orientation?: "horizontal" | "vertical"; className?: string }) {
  return (
    <RadixSeparator.Root
      orientation={orientation}
      className={cn("kr:shrink-0 kr:bg-line", orientation === "horizontal" ? "kr:h-px kr:w-full" : "kr:h-full kr:w-px", className)}
    />
  );
}

export function Skeleton({ className, ...props }: DivProps) {
  return <div aria-hidden className={cn("kr:rounded-sm kr:bg-surface-2 kr:animate-[kr-pulse_1.6s_ease-in-out_infinite]", className)} {...props} />;
}

export function EmptyState({ icon, title, description, action, className }: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("kr:flex kr:flex-col kr:items-center kr:justify-center kr:px-4 kr:py-10 kr:text-center", className)}>
      {icon && <div className="kr:mb-3 kr:text-muted kr:[&_svg]:size-6">{icon}</div>}
      <p className="kr:text-sm kr:font-medium kr:text-fg">{title}</p>
      {description && <p className="kr:mt-1 kr:max-w-sm kr:text-[0.8125rem] kr:text-muted">{description}</p>}
      {action && <div className="kr:mt-4">{action}</div>}
    </div>
  );
}

/** Label and value pairs, such as a record summary. */
export function DescriptionList({ items, className }: { items: Array<{ label: ReactNode; value: ReactNode }>; className?: string }) {
  return (
    <dl className={cn("kr:grid kr:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] kr:gap-x-4 kr:gap-y-2.5 kr:text-sm", className)}>
      {items.map((item, i) => (
        <Fragment key={i}>
          <dt className="kr:text-muted">{item.label}</dt>
          <dd className="kr:min-w-0 kr:text-fg kr:[overflow-wrap:anywhere]">{item.value}</dd>
        </Fragment>
      ))}
    </dl>
  );
}

export type TimelineEvent = { id: string; title: ReactNode; description?: ReactNode; time?: ReactNode; tone?: Tone };

const timelineDot: Partial<Record<Tone, string>> = {
  success: "kr:bg-success",
  warning: "kr:bg-warning",
  danger: "kr:bg-danger",
};

/** Events in the order you pass them. */
export function Timeline({ events, className }: { events: TimelineEvent[]; className?: string }) {
  return (
    <ol className={cn("kr:text-sm", className)}>
      {events.map((event, i) => (
        <li key={event.id} className="kr:relative kr:flex kr:gap-3 kr:pb-4 kr:last:pb-0">
          {i < events.length - 1 && <span aria-hidden className="kr:absolute kr:top-4 kr:bottom-0 kr:left-[0.3125rem] kr:w-px kr:bg-line" />}
          <span aria-hidden className={cn("kr:mt-1 kr:size-2.5 kr:shrink-0 kr:rounded-full", (event.tone && timelineDot[event.tone]) ?? "kr:bg-line-strong")} />
          <div className="kr:min-w-0 kr:flex-1">
            <p className="kr:font-medium kr:text-fg">{event.title}</p>
            {event.description && <p className="kr:text-[0.8125rem] kr:text-muted">{event.description}</p>}
            {event.time && <p className="kr:mt-0.5 kr:text-xs kr:text-muted">{event.time}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

