import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Button } from "../components/button";
import { Alert, Badge, Separator } from "../components/display";
import { Checkbox, Field, Input, OtpInput } from "../components/form";
import { fill, type Labels } from "../components/labels";
import { BrandLogo, cn, KoraLink, useKora, useLabels, useSubmit, type Brand } from "../components/provider";

export type AuthScreenProps = {
  /** Defaults to the KoraProvider brand. `null` hides it, for a page that already shows the brand around the form. */
  brand?: Brand | null;
  /** Text overrides. Defaults come from the KoraProvider locale. */
  labels?: Partial<Labels>;
  /** Replaces the default failure message, for example with a backend message. */
  error?: ReactNode;
  variant?: "centered" | "split";
  /** Brand panel for the split variant. Hidden below 1024px. */
  aside?: ReactNode;
  className?: string;
};

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Waits between resends, so a repeated tap does not send repeated emails. */
function useCooldown(seconds: number) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (left <= 0) return;
    const timer = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(timer);
  }, [left]);
  return { left, start: () => setLeft(seconds) };
}

export function AuthLayout({ brand, title, description, variant = "centered", aside, footer, className, children }: Pick<AuthScreenProps, "brand" | "variant" | "aside" | "className"> & {
  title: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const fallback = useKora().brand;
  const b = brand === null ? undefined : (brand ?? fallback);
  const panel = (
    <main className="kr:mx-auto kr:w-full kr:max-w-sm">
      {b && (
        <div className="kr:mb-6 kr:flex kr:items-center kr:gap-2 kr:text-sm kr:font-semibold kr:text-fg">
          <BrandLogo logo={b.logo} />
          <span>{b.name}</span>
        </div>
      )}
      <h1 className="kr:text-xl kr:font-semibold kr:text-fg">{title}</h1>
      {description && <p className="kr:mt-1 kr:text-sm kr:text-muted">{description}</p>}
      <div className="kr:mt-6">{children}</div>
      {footer && <p className="kr:mt-6 kr:text-sm kr:text-muted">{footer}</p>}
    </main>
  );
  return (
    <div className={cn("kr:flex kr:min-h-dvh kr:bg-bg kr:text-fg", variant === "split" && "kr:lg:bg-surface", className)}>
      <div className="kr:flex kr:min-w-0 kr:flex-1 kr:items-center kr:px-4 kr:py-8 kr:md:px-8">{panel}</div>
      {variant === "split" && <div className="kr:hidden kr:w-1/2 kr:bg-accent kr:p-10 kr:text-accent-fg kr:lg:block">{aside}</div>}
    </div>
  );
}

function FormError({ children }: { children?: ReactNode }) {
  return children ? <Alert tone="danger" className="kr:mb-4">{children}</Alert> : null;
}

function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <KoraLink href={href} className="kr:font-medium kr:text-accent kr:underline-offset-2 kr:hover:underline">
      {children}
    </KoraLink>
  );
}

type Layout = Pick<AuthScreenProps, "brand" | "variant" | "aside" | "className">;
function layoutProps({ brand, variant, aside, className }: AuthScreenProps): Layout {
  return { brand, variant, aside, className };
}

export type AuthProvider = string | { id: string; label: string; icon?: ReactNode };

export type LoginValues = { email: string; password: string };

export function LoginScreen({ onSubmit, providers, onProvider, onMagicLink, links, footer, ...rest }: AuthScreenProps & {
  onSubmit: (values: LoginValues) => unknown;
  /** Line under the form, such as how to ask for access. Replaces the register link line. */
  footer?: ReactNode;
  providers?: AuthProvider[];
  onProvider?: (id: string) => unknown;
  onMagicLink?: (values: { email: string }) => unknown;
  links?: { forgotPassword?: string; register?: string };
}) {
  const t = useLabels(rest.labels);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [magicSent, setMagicSent] = useState(false);
  const submit = useSubmit(onSubmit, t.loginFailed);
  const provider = useSubmit(onProvider, t.genericError);
  const magic = useSubmit(onMagicLink, t.genericError);
  const failure = rest.error ?? submit.error ?? provider.error ?? magic.error;
  const busy = submit.pending || provider.pending || magic.pending;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next = {
      email: isEmail(email) ? undefined : t.invalidEmail,
      password: password ? undefined : t.requiredField,
    };
    setErrors(next);
    if (next.email || next.password) return;
    const ok = await submit.run({ email: email.trim(), password });
    if (!ok) setPassword("");
  };

  const handleMagic = async () => {
    if (!isEmail(email)) return setErrors({ email: t.invalidEmail });
    setErrors({});
    setMagicSent(await magic.run({ email: email.trim() }));
  };

  return (
    <AuthLayout
      {...layoutProps(rest)}
      title={t.loginTitle}
      description={t.loginDescription}
      footer={footer ?? (links?.register && (
        <>
          {t.noAccount} <TextLink href={links.register}>{t.createAccountLink}</TextLink>
        </>
      ))}
    >
      <FormError>{failure}</FormError>
      {magicSent && <Alert tone="success" className="kr:mb-4">{t.magicLinkSent}</Alert>}
      {providers && providers.length > 0 && onProvider && (
        <>
          <div className="kr:space-y-2">
            {providers.map((p) => {
              const item = typeof p === "string" ? { id: p, label: p.charAt(0).toUpperCase() + p.slice(1) } : p;
              return (
                <Button key={item.id} variant="secondary" disabled={busy} className="kr:w-full" onClick={() => provider.run(item.id)}>
                  {"icon" in item && item.icon}
                  {fill(t.continueWith, { provider: item.label })}
                </Button>
              );
            })}
          </div>
          <div className="kr:my-5 kr:flex kr:items-center kr:gap-3 kr:text-xs kr:text-muted">
            <Separator className="kr:flex-1 kr:w-auto" />
            {t.orContinueWith}
            <Separator className="kr:flex-1 kr:w-auto" />
          </div>
        </>
      )}
      <form noValidate onSubmit={handleSubmit} className="kr:space-y-4">
        <Field label={t.email} error={errors.email}>
          <Input type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label={t.password} error={errors.password}>
          <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        {links?.forgotPassword && (
          <p className="kr:text-sm">
            <TextLink href={links.forgotPassword}>{t.forgotPasswordLink}</TextLink>
          </p>
        )}
        <Button type="submit" loading={submit.pending} disabled={busy} className="kr:w-full">
          {t.loginSubmit}
        </Button>
        {onMagicLink && (
          <Button variant="ghost" loading={magic.pending} disabled={busy} className="kr:w-full" onClick={handleMagic}>
            {t.sendMagicLink}
          </Button>
        )}
      </form>
    </AuthLayout>
  );
}

export type RegisterValues = { name: string; email: string; password: string };

export function RegisterScreen({ onSubmit, links, minPasswordLength = 8, terms, ...rest }: AuthScreenProps & {
  onSubmit: (values: RegisterValues) => unknown;
  links?: { signIn?: string };
  minPasswordLength?: number;
  /** When set, shows a required checkbox with this text. */
  terms?: ReactNode;
}) {
  const t = useLabels(rest.labels);
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<"name" | "email" | "password" | "terms", string>>>({});
  const submit = useSubmit(onSubmit, t.genericError);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next = {
      name: values.name.trim() ? undefined : t.requiredField,
      email: isEmail(values.email) ? undefined : t.invalidEmail,
      password: values.password.length >= minPasswordLength ? undefined : fill(t.passwordTooShort, { min: minPasswordLength }),
      terms: terms && !accepted ? t.requiredField : undefined,
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    const ok = await submit.run({ name: values.name.trim(), email: values.email.trim(), password: values.password });
    if (!ok) setValues((v) => ({ ...v, password: "" }));
  };

  return (
    <AuthLayout
      {...layoutProps(rest)}
      title={t.registerTitle}
      description={t.registerDescription}
      footer={links?.signIn && (
        <>
          {t.haveAccount} <TextLink href={links.signIn}>{t.signInLink}</TextLink>
        </>
      )}
    >
      <FormError>{rest.error ?? submit.error}</FormError>
      <form noValidate onSubmit={handleSubmit} className="kr:space-y-4">
        <Field label={t.fullName} error={errors.name}>
          <Input autoComplete="name" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
        </Field>
        <Field label={t.email} error={errors.email}>
          <Input type="email" autoComplete="email" inputMode="email" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} />
        </Field>
        <Field label={t.password} hint={fill(t.passwordTooShort, { min: minPasswordLength })} error={errors.password}>
          <Input type="password" autoComplete="new-password" value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} />
        </Field>
        {terms && (
          <div>
            <Checkbox label={terms} checked={accepted} onCheckedChange={(v) => setAccepted(v === true)} />
            {errors.terms && <p className="kr:mt-1 kr:text-[0.8125rem] kr:text-danger">{errors.terms}</p>}
          </div>
        )}
        <Button type="submit" loading={submit.pending} className="kr:w-full">{t.registerSubmit}</Button>
      </form>
    </AuthLayout>
  );
}

export function ForgotPasswordScreen({ onSubmit, links, ...rest }: AuthScreenProps & {
  onSubmit: (values: { email: string }) => unknown;
  links?: { signIn?: string };
}) {
  const t = useLabels(rest.labels);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [sent, setSent] = useState(false);
  const submit = useSubmit(onSubmit, t.genericError);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isEmail(email)) return setEmailError(t.invalidEmail);
    setEmailError(undefined);
    setSent(await submit.run({ email: email.trim() }));
  };

  return (
    <AuthLayout
      {...layoutProps(rest)}
      title={t.forgotTitle}
      description={t.forgotDescription}
      footer={links?.signIn && <TextLink href={links.signIn}>{t.backToSignIn}</TextLink>}
    >
      <FormError>{rest.error ?? submit.error}</FormError>
      {sent ? (
        <Alert tone="success">{t.forgotSent}</Alert>
      ) : (
        <form noValidate onSubmit={handleSubmit} className="kr:space-y-4">
          <Field label={t.email} error={emailError}>
            <Input type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Button type="submit" loading={submit.pending} className="kr:w-full">{t.forgotSubmit}</Button>
        </form>
      )}
    </AuthLayout>
  );
}

export function ResetPasswordScreen({ onSubmit, links, minPasswordLength = 8, ...rest }: AuthScreenProps & {
  onSubmit: (values: { password: string }) => unknown;
  links?: { signIn?: string };
  minPasswordLength?: number;
}) {
  const t = useLabels(rest.labels);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [done, setDone] = useState(false);
  const submit = useSubmit(onSubmit, t.genericError);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next = {
      password: password.length >= minPasswordLength ? undefined : fill(t.passwordTooShort, { min: minPasswordLength }),
      confirm: password === confirm ? undefined : t.passwordsDontMatch,
    };
    setErrors(next);
    if (next.password || next.confirm) return;
    const ok = await submit.run({ password });
    setPassword("");
    setConfirm("");
    setDone(ok);
  };

  return (
    <AuthLayout
      {...layoutProps(rest)}
      title={t.resetTitle}
      description={fill(t.resetDescription, { min: minPasswordLength })}
      footer={links?.signIn && <TextLink href={links.signIn}>{t.backToSignIn}</TextLink>}
    >
      <FormError>{rest.error ?? submit.error}</FormError>
      {done ? (
        <Alert tone="success">{t.passwordUpdated}</Alert>
      ) : (
        <form noValidate onSubmit={handleSubmit} className="kr:space-y-4">
          <Field label={t.newPassword} error={errors.password}>
            <Input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <Field label={t.confirmPassword} error={errors.confirm}>
            <Input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </Field>
          <Button type="submit" loading={submit.pending} className="kr:w-full">{t.resetSubmit}</Button>
        </form>
      )}
    </AuthLayout>
  );
}

export function VerifyEmailScreen({ email, onResend, resendCooldown = 30, links, ...rest }: AuthScreenProps & {
  email: string;
  onResend?: () => unknown;
  /** Seconds to wait between resends. */
  resendCooldown?: number;
  links?: { signIn?: string };
}) {
  const t = useLabels(rest.labels);
  const resend = useSubmit(onResend, t.genericError);
  const cooldown = useCooldown(resendCooldown);
  const [resent, setResent] = useState(false);
  return (
    <AuthLayout
      {...layoutProps(rest)}
      title={t.verifyTitle}
      description={fill(t.verifyDescription, { email })}
      footer={links?.signIn && <TextLink href={links.signIn}>{t.backToSignIn}</TextLink>}
    >
      <FormError>{rest.error ?? resend.error}</FormError>
      {resent && <Alert tone="success" className="kr:mb-4">{t.verifyResent}</Alert>}
      {onResend && (
        <Button
          variant="secondary"
          className="kr:w-full"
          loading={resend.pending}
          disabled={cooldown.left > 0}
          onClick={async () => {
            const ok = await resend.run();
            setResent(ok);
            if (ok) cooldown.start();
          }}
        >
          {t.verifyResend}
          {cooldown.left > 0 && <span className="kr:tabular-nums">({cooldown.left})</span>}
        </Button>
      )}
    </AuthLayout>
  );
}

export function OtpScreen({ length = 6, onSubmit, onResend, resendCooldown = 30, links, ...rest }: AuthScreenProps & {
  length?: number;
  onSubmit: (values: { code: string }) => unknown;
  onResend?: () => unknown;
  resendCooldown?: number;
  links?: { signIn?: string };
}) {
  const t = useLabels(rest.labels);
  const [code, setCode] = useState("");
  const [resent, setResent] = useState(false);
  const submit = useSubmit(onSubmit, t.genericError);
  const resend = useSubmit(onResend, t.genericError);
  const cooldown = useCooldown(resendCooldown);

  const send = async (value: string) => {
    if (value.length !== length) return;
    const ok = await submit.run({ code: value });
    if (!ok) setCode("");
  };

  return (
    <AuthLayout
      {...layoutProps(rest)}
      title={t.otpTitle}
      description={fill(t.otpDescription, { length })}
      footer={links?.signIn && <TextLink href={links.signIn}>{t.backToSignIn}</TextLink>}
    >
      <FormError>{rest.error ?? submit.error ?? resend.error}</FormError>
      {resent && <Alert tone="success" className="kr:mb-4">{t.otpResent}</Alert>}
      <form
        noValidate
        className="kr:space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void send(code);
        }}
      >
        <OtpInput autoFocus aria-label={t.otpLabel} length={length} value={code} onChange={setCode} onComplete={send} disabled={submit.pending} className="kr:max-w-none" />
        <Button type="submit" loading={submit.pending} disabled={code.length !== length} className="kr:w-full">{t.otpSubmit}</Button>
        {onResend && (
          <Button
            variant="ghost"
            className="kr:w-full"
            loading={resend.pending}
            disabled={cooldown.left > 0}
            onClick={async () => {
              const ok = await resend.run();
              setResent(ok);
              if (ok) cooldown.start();
            }}
          >
            {t.otpResend}
            {cooldown.left > 0 && <span className="kr:tabular-nums">({cooldown.left})</span>}
          </Button>
        )}
      </form>
    </AuthLayout>
  );
}

export function AcceptInviteScreen({ organization, inviter, role, email, newAccount, minPasswordLength = 8, onAccept, onDecline, ...rest }: AuthScreenProps & {
  organization: string;
  inviter: string;
  role: string;
  email?: string;
  /** Asks for a name and password when the person has no account yet. */
  newAccount?: boolean;
  minPasswordLength?: number;
  onAccept: (values: { name?: string; password?: string }) => unknown;
  onDecline?: () => unknown;
}) {
  const t = useLabels(rest.labels);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ name?: string; password?: string }>({});
  const accept = useSubmit(onAccept, t.genericError);
  const decline = useSubmit(onDecline, t.genericError);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newAccount) {
      const next = {
        name: name.trim() ? undefined : t.requiredField,
        password: password.length >= minPasswordLength ? undefined : fill(t.passwordTooShort, { min: minPasswordLength }),
      };
      setErrors(next);
      if (next.name || next.password) return;
    }
    const ok = await accept.run(newAccount ? { name: name.trim(), password } : {});
    if (!ok) setPassword("");
  };

  return (
    <AuthLayout {...layoutProps(rest)} title={fill(t.inviteTitle, { organization })} description={fill(t.inviteDescription, { inviter, role })}>
      <FormError>{rest.error ?? accept.error ?? decline.error}</FormError>
      <form noValidate onSubmit={handleSubmit} className="kr:space-y-4">
        {email && (
          <p className="kr:flex kr:flex-wrap kr:items-center kr:gap-2 kr:text-sm kr:text-muted">
            {email} <Badge tone="accent">{role}</Badge>
          </p>
        )}
        {newAccount && (
          <>
            <Field label={t.fullName} error={errors.name}>
              <Input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label={t.password} hint={fill(t.passwordTooShort, { min: minPasswordLength })} error={errors.password}>
              <Input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
          </>
        )}
        <Button type="submit" loading={accept.pending} disabled={decline.pending} className="kr:w-full">{t.inviteSubmit}</Button>
        {onDecline && (
          <Button variant="ghost" loading={decline.pending} disabled={accept.pending} className="kr:w-full" onClick={() => decline.run()}>
            {t.inviteDecline}
          </Button>
        )}
      </form>
    </AuthLayout>
  );
}
