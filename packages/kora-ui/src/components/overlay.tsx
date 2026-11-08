import type { ComponentProps, ReactNode } from "react";
import { Dialog as D, DropdownMenu as M, Tooltip as T } from "radix-ui";
import { X } from "lucide-react";
import { Toaster as SonnerToaster, toast } from "sonner";
import { Alert } from "./display";
import { Button } from "./button";
import { cn, useLabels, useSubmit } from "./provider";

export { toast };

const overlayClass = "kr:fixed kr:inset-0 kr:z-50 kr:bg-black/50 kr:animate-[kr-fade-in_150ms_ease-out]";

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;

// Omit the HTML `title` (a string): ours is the visible heading and takes any node.
export type DialogContentProps = Omit<ComponentProps<typeof D.Content>, "title"> & {
  title: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
};

function Heading({ title, description }: { title: ReactNode; description?: ReactNode }) {
  return (
    <div className="kr:min-w-0 kr:flex-1">
      <D.Title className="kr:text-base kr:font-semibold kr:text-fg">{title}</D.Title>
      {description ? (
        <D.Description className="kr:mt-1 kr:text-sm kr:text-muted">{description}</D.Description>
      ) : (
        <D.Description className="kr:sr-only">{title}</D.Description>
      )}
    </div>
  );
}

function CloseIcon() {
  const t = useLabels();
  return (
    <D.Close asChild>
      <Button variant="ghost" size="icon" aria-label={t.close} className="kr:-mt-1.5 kr:-mr-1.5">
        <X aria-hidden />
      </Button>
    </D.Close>
  );
}

/** Centered on desktop. On phones it rises from the bottom edge, within thumb reach. */
export function DialogContent({ title, description, footer, children, className, ...props }: DialogContentProps) {
  return (
    <D.Portal>
      <D.Overlay className={overlayClass} />
      <D.Content
        className={cn(
          "kr:fixed kr:z-50 kr:flex kr:flex-col kr:bg-surface kr:text-fg kr:shadow-overlay kr:outline-none kr:animate-[kr-pop-in_150ms_ease-out]",
          "kr:inset-x-0 kr:bottom-0 kr:max-h-[90dvh] kr:rounded-t-lg kr:pb-[env(safe-area-inset-bottom)]",
          "kr:md:inset-x-auto kr:md:bottom-auto kr:md:top-1/2 kr:md:left-1/2 kr:md:w-full kr:md:max-w-lg kr:md:-translate-x-1/2 kr:md:-translate-y-1/2 kr:md:rounded-lg kr:md:pb-0",
          className,
        )}
        {...props}
      >
        <div className="kr:flex kr:items-start kr:gap-3 kr:p-4 kr:pb-3">
          <Heading title={title} description={description} />
          <CloseIcon />
        </div>
        {children && <div className="kr:min-h-0 kr:flex-1 kr:overflow-y-auto kr:px-4 kr:pb-4 kr:space-y-[var(--kora-gap)]">{children}</div>}
        {footer && (
          <div className="kr:flex kr:flex-col-reverse kr:gap-2 kr:border-t kr:border-line kr:p-4 kr:md:flex-row kr:md:justify-end">{footer}</div>
        )}
      </D.Content>
    </D.Portal>
  );
}

export const Sheet = D.Root;
export const SheetTrigger = D.Trigger;
export const SheetClose = D.Close;

export function SheetContent({ title, description, footer, side = "right", children, className, ...props }: DialogContentProps & { side?: "left" | "right" }) {
  return (
    <D.Portal>
      <D.Overlay className={overlayClass} />
      <D.Content
        className={cn(
          "kr:fixed kr:inset-y-0 kr:z-50 kr:flex kr:w-[min(26rem,90vw)] kr:flex-col kr:bg-surface kr:text-fg kr:shadow-overlay kr:outline-none",
          side === "right"
            ? "kr:right-0 kr:border-l kr:border-line kr:animate-[kr-slide-right_180ms_ease-out]"
            : "kr:left-0 kr:border-r kr:border-line kr:animate-[kr-slide-left_180ms_ease-out]",
          className,
        )}
        {...props}
      >
        <div className="kr:flex kr:items-start kr:gap-3 kr:border-b kr:border-line kr:p-4">
          <Heading title={title} description={description} />
          <CloseIcon />
        </div>
        <div className="kr:min-h-0 kr:flex-1 kr:overflow-y-auto kr:p-4 kr:space-y-[var(--kora-gap)]">{children}</div>
        {footer && <div className="kr:flex kr:justify-end kr:gap-2 kr:border-t kr:border-line kr:p-4">{footer}</div>}
      </D.Content>
    </D.Portal>
  );
}

export const DropdownMenu = M.Root;
export const DropdownMenuTrigger = M.Trigger;

export function DropdownMenuContent({ className, align = "end", sideOffset = 4, ...props }: ComponentProps<typeof M.Content>) {
  return (
    <M.Portal>
      <M.Content
        align={align}
        sideOffset={sideOffset}
        collisionPadding={8}
        className={cn(
          "kr:z-50 kr:min-w-44 kr:max-w-[calc(100vw-1rem)] kr:rounded-md kr:border kr:border-line kr:bg-surface kr:p-1 kr:text-fg kr:shadow-overlay kr:outline-none kr:animate-[kr-pop-in_120ms_ease-out]",
          className,
        )}
        {...props}
      />
    </M.Portal>
  );
}

export function DropdownMenuItem({ className, danger, ...props }: ComponentProps<typeof M.Item> & { danger?: boolean }) {
  return (
    <M.Item
      className={cn(
        "kr:flex kr:min-h-10 kr:cursor-pointer kr:items-center kr:gap-2 kr:rounded-sm kr:px-2.5 kr:text-sm kr:outline-none kr:select-none kr:md:min-h-8 kr:[&_svg]:size-4",
        "kr:data-[highlighted]:bg-surface-2 kr:data-[disabled]:opacity-50 kr:data-[disabled]:pointer-events-none",
        danger && "kr:text-danger",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuLabel({ className, ...props }: ComponentProps<typeof M.Label>) {
  return <M.Label className={cn("kr:px-2.5 kr:py-1.5 kr:text-xs kr:text-muted", className)} {...props} />;
}

export function DropdownMenuSeparator({ className, ...props }: ComponentProps<typeof M.Separator>) {
  return <M.Separator className={cn("kr:my-1 kr:h-px kr:bg-line", className)} {...props} />;
}

export function Tooltip({ content, side, children }: { content: ReactNode; side?: "top" | "right" | "bottom" | "left"; children: ReactNode }) {
  return (
    <T.Provider delayDuration={250}>
      <T.Root>
        <T.Trigger asChild>{children}</T.Trigger>
        <T.Portal>
          <T.Content
            side={side}
            sideOffset={6}
            collisionPadding={8}
            className="kr:z-50 kr:max-w-64 kr:rounded-sm kr:bg-fg kr:px-2 kr:py-1 kr:text-xs kr:text-surface kr:animate-[kr-fade-in_100ms_ease-out]"
          >
            {content}
          </T.Content>
        </T.Portal>
      </T.Root>
    </T.Provider>
  );
}

export function Toaster(props: ComponentProps<typeof SonnerToaster>) {
  return (
    <SonnerToaster
      position="bottom-right"
      mobileOffset={{ bottom: "calc(var(--kora-bottom-nav, 0px) + 1rem)" }}
      style={
        {
          "--normal-bg": "var(--kora-surface)",
          "--normal-text": "var(--kora-fg)",
          "--normal-border": "var(--kora-line)",
          "--font-family": "var(--kora-font)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

/** Replaces `window.confirm`. It stays open and shows a message if `onConfirm` rejects. */
export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel, cancelLabel, danger, onConfirm }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the button for actions that remove or undo something. */
  danger?: boolean;
  onConfirm: () => unknown;
}) {
  const t = useLabels();
  const { pending, error, run } = useSubmit(onConfirm, t.genericError);
  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent title={title} description={description}>
        {error && <Alert tone="danger" className="kr:mb-3">{error}</Alert>}
        <div className="kr:flex kr:flex-col-reverse kr:gap-2 kr:md:flex-row kr:md:justify-end">
          <Button variant="secondary" disabled={pending} onClick={() => onOpenChange(false)}>{cancelLabel ?? t.cancel}</Button>
          <Button
            variant={danger ? "danger" : "primary"}
            loading={pending}
            onClick={async () => {
              if (await run()) onOpenChange(false);
            }}
          >
            {confirmLabel ?? t.confirm}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
