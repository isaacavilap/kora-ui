import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Lock, MonitorSmartphone, SearchX, ServerCrash, Wrench } from "lucide-react";
import { Button } from "../components/button";
import { Alert, Avatar, Badge, Card, CardContent, CardFooter, CardHeader } from "../components/display";
import { Field, Input, Select, Switch } from "../components/form";
import { fill, type Labels } from "../components/labels";
import { PageHeader } from "../components/layout";
import { Stepper, Tabs, TabsContent, TabsList, TabsTrigger } from "../components/navigation";
import { Dialog, DialogContent, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, toast } from "../components/overlay";
import { cn, KoraLink, useKora, useLabels, useSubmit, type Brand } from "../components/provider";
import { DataTable, type DataTableColumn } from "../table/data-table";
import { FilterBar } from "../table/filter-bar";
import { isEmail } from "../auth/auth";

/* Error pages */

const errorIcons = { 404: SearchX, 403: Lock, 500: ServerCrash, maintenance: Wrench };

export function ErrorScreen({ variant, title, description, homeHref, onRetry, action, brand, labels, className }: {
  variant: 404 | 403 | 500 | "maintenance";
  title?: ReactNode;
  description?: ReactNode;
  /** Shows a link back to the start. */
  homeHref?: string;
  /** Shows a retry button. */
  onRetry?: () => void;
  action?: ReactNode;
  brand?: Brand;
  labels?: Partial<Labels>;
  className?: string;
}) {
  const t = useLabels(labels);
  const fallback = useKora().brand;
  const b = brand ?? fallback;
  const Icon = errorIcons[variant];
  const text = {
    404: [t.error404Title, t.error404Description],
    403: [t.error403Title, t.error403Description],
    500: [t.error500Title, t.error500Description],
    maintenance: [t.errorMaintenanceTitle, t.errorMaintenanceDescription],
  }[variant];
  return (
    <main className={cn("kr:flex kr:min-h-dvh kr:items-center kr:bg-bg kr:px-4 kr:py-8 kr:text-fg kr:md:px-8", className)}>
      <div className="kr:mx-auto kr:w-full kr:max-w-md">
        {b && (
          <div className="kr:mb-8 kr:flex kr:items-center kr:gap-2 kr:text-sm kr:font-semibold">
            {b.logo}
            {b.name}
          </div>
        )}
        <Icon aria-hidden className="kr:mb-4 kr:size-6 kr:text-accent" />
        {typeof variant === "number" && <p className="kr:text-sm kr:text-muted kr:tabular-nums">{variant}</p>}
        <h1 className="kr:text-xl kr:font-semibold">{title ?? text[0]}</h1>
        <p className="kr:mt-2 kr:text-sm kr:text-muted">{description ?? text[1]}</p>
        {(homeHref || onRetry || action) && (
          <div className="kr:mt-6 kr:flex kr:flex-wrap kr:gap-2">
            {onRetry && <Button onClick={onRetry}>{t.retry}</Button>}
            {homeHref && (
              <Button asChild variant={onRetry ? "secondary" : "primary"}>
                <KoraLink href={homeHref}>{t.goHome}</KoraLink>
              </Button>
            )}
            {action}
          </div>
        )}
      </div>
    </main>
  );
}

/* Account */

export type AccountUser = { name: string; email: string; avatarUrl?: string };

export function ProfileSettings({ user, onSave, labels }: {
  user: AccountUser;
  onSave: (values: { name: string; email: string }) => unknown;
  labels?: Partial<Labels>;
}) {
  const t = useLabels(labels);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [saved, setSaved] = useState(false);
  const submit = useSubmit(onSave, t.genericError);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next = { name: name.trim() ? undefined : t.requiredField, email: isEmail(email) ? undefined : t.invalidEmail };
    setErrors(next);
    setSaved(false);
    if (next.name || next.email) return;
    setSaved(await submit.run({ name: name.trim(), email: email.trim() }));
  };

  return (
    <Card>
      <form noValidate onSubmit={handleSubmit}>
        <CardHeader title={t.profileTab} description={t.profileDescription} />
        <CardContent className="kr:space-y-4">
          {submit.error && <Alert tone="danger">{submit.error}</Alert>}
          {saved && <Alert tone="success">{t.saved}</Alert>}
          <div className="kr:flex kr:items-center kr:gap-3">
            <Avatar name={name || user.name} src={user.avatarUrl} size={48} />
            <div className="kr:min-w-0">
              <p className="kr:truncate kr:text-sm kr:font-medium">{user.name}</p>
              <p className="kr:truncate kr:text-[0.8125rem] kr:text-muted">{user.email}</p>
            </div>
          </div>
          <div className="kr:grid kr:gap-4 kr:md:grid-cols-2">
            <Field label={t.fullName} error={errors.name}>
              <Input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label={t.email} error={errors.email}>
              <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" loading={submit.pending}>{t.save}</Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export function PasswordSettings({ onSave, minPasswordLength = 8, labels }: {
  onSave: (values: { currentPassword: string; newPassword: string }) => unknown;
  minPasswordLength?: number;
  labels?: Partial<Labels>;
}) {
  const t = useLabels(labels);
  const empty = { current: "", next: "", confirm: "" };
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<Partial<typeof empty>>({});
  const [saved, setSaved] = useState(false);
  const submit = useSubmit(onSave, t.genericError);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next = {
      current: values.current ? undefined : t.requiredField,
      next: values.next.length >= minPasswordLength ? undefined : fill(t.passwordTooShort, { min: minPasswordLength }),
      confirm: values.next === values.confirm ? undefined : t.passwordsDontMatch,
    };
    setErrors(next);
    setSaved(false);
    if (next.current || next.next || next.confirm) return;
    const ok = await submit.run({ currentPassword: values.current, newPassword: values.next });
    setValues(empty);
    setSaved(ok);
  };

  return (
    <Card>
      <form noValidate onSubmit={handleSubmit}>
        <CardHeader title={t.passwordTab} description={t.passwordDescription} />
        <CardContent className="kr:max-w-md kr:space-y-4">
          {submit.error && <Alert tone="danger">{submit.error}</Alert>}
          {saved && <Alert tone="success">{t.passwordUpdated}</Alert>}
          <Field label={t.currentPassword} error={errors.current}>
            <Input type="password" autoComplete="current-password" value={values.current} onChange={(e) => setValues({ ...values, current: e.target.value })} />
          </Field>
          <Field label={t.newPassword} error={errors.next}>
            <Input type="password" autoComplete="new-password" value={values.next} onChange={(e) => setValues({ ...values, next: e.target.value })} />
          </Field>
          <Field label={t.confirmPassword} error={errors.confirm}>
            <Input type="password" autoComplete="new-password" value={values.confirm} onChange={(e) => setValues({ ...values, confirm: e.target.value })} />
          </Field>
        </CardContent>
        <CardFooter>
          <Button type="submit" loading={submit.pending}>{t.resetSubmit}</Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export function SecuritySettings({ twoFactorEnabled, onToggleTwoFactor, recoveryCodes, labels }: {
  twoFactorEnabled: boolean;
  onToggleTwoFactor: (enabled: boolean) => unknown;
  /** Shown once after enabling. Pass them from the backend and do not store them in the client. */
  recoveryCodes?: string[];
  labels?: Partial<Labels>;
}) {
  const t = useLabels(labels);
  const toggle = useSubmit(onToggleTwoFactor, t.genericError);
  return (
    <Card>
      <CardContent className="kr:space-y-4">
        {toggle.error && <Alert tone="danger">{toggle.error}</Alert>}
        <div className="kr:flex kr:items-start kr:justify-between kr:gap-4">
          <div className="kr:min-w-0">
            <p className="kr:text-sm kr:font-semibold">{t.twoFactorTitle}</p>
            <p className="kr:mt-0.5 kr:text-[0.8125rem] kr:text-muted">{twoFactorEnabled ? t.twoFactorOn : t.twoFactorOff}</p>
          </div>
          <Switch aria-label={t.twoFactorTitle} checked={twoFactorEnabled} disabled={toggle.pending} onCheckedChange={(v) => toggle.run(v)} />
        </div>
        {recoveryCodes && recoveryCodes.length > 0 && (
          <div className="kr:rounded-md kr:bg-surface-2 kr:p-3">
            <p className="kr:text-sm kr:font-medium">{t.recoveryCodesTitle}</p>
            <p className="kr:mt-0.5 kr:text-[0.8125rem] kr:text-muted">{t.recoveryCodesDescription}</p>
            <ul className="kr:mt-3 kr:grid kr:grid-cols-2 kr:gap-x-4 kr:gap-y-1 kr:text-sm kr:tabular-nums kr:md:grid-cols-3">
              {recoveryCodes.map((code) => (
                <li key={code}>{code}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export type AccountSession = { id: string; device: string; detail?: string; current?: boolean };

export function SessionsSettings({ sessions, onRevoke, onRevokeOthers, labels }: {
  sessions: AccountSession[];
  onRevoke: (id: string) => unknown;
  onRevokeOthers?: () => unknown;
  labels?: Partial<Labels>;
}) {
  const t = useLabels(labels);
  const revoke = useSubmit(onRevoke, t.genericError);
  const others = useSubmit(onRevokeOthers, t.genericError);
  const hasOthers = sessions.some((s) => !s.current);
  return (
    <Card>
      <CardHeader
        title={t.sessionsTab}
        description={t.sessionsDescription}
        actions={onRevokeOthers && hasOthers && (
          <Button variant="secondary" size="sm" loading={others.pending} onClick={() => others.run()}>{t.signOutOthers}</Button>
        )}
      />
      <CardContent className="kr:pb-1">
        {(revoke.error || others.error) && <Alert tone="danger" className="kr:mb-2">{revoke.error ?? others.error}</Alert>}
        <ul className="kr:divide-y kr:divide-line">
          {sessions.map((s) => (
            <li key={s.id} className="kr:flex kr:items-center kr:gap-3 kr:py-3">
              <MonitorSmartphone aria-hidden className="kr:size-4 kr:shrink-0 kr:text-muted" />
              <div className="kr:min-w-0 kr:flex-1">
                <p className="kr:flex kr:flex-wrap kr:items-center kr:gap-2 kr:text-sm">
                  {s.device}
                  {s.current && <Badge tone="accent">{t.thisDevice}</Badge>}
                </p>
                {s.detail && <p className="kr:text-[0.8125rem] kr:text-muted">{s.detail}</p>}
              </div>
              {!s.current && (
                <Button variant="ghost" size="sm" disabled={revoke.pending} onClick={() => revoke.run(s.id)}>{t.signOutSession}</Button>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function AccountScreen({ user, onSaveProfile, onChangePassword, security, sessions, title, description, labels, className }: {
  user: AccountUser;
  onSaveProfile: (values: { name: string; email: string }) => unknown;
  /** Each tab below appears only when its prop is set. */
  onChangePassword?: (values: { currentPassword: string; newPassword: string }) => unknown;
  security?: { twoFactorEnabled: boolean; onToggleTwoFactor: (enabled: boolean) => unknown; recoveryCodes?: string[] };
  sessions?: { sessions: AccountSession[]; onRevoke: (id: string) => unknown; onRevokeOthers?: () => unknown };
  title?: ReactNode;
  description?: ReactNode;
  labels?: Partial<Labels>;
  className?: string;
}) {
  const t = useLabels(labels);
  return (
    <div className={cn("kr:mx-auto kr:w-full kr:max-w-3xl", className)}>
      <PageHeader title={title ?? t.accountTitle} description={description ?? t.accountDescription} />
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">{t.profileTab}</TabsTrigger>
          {onChangePassword && <TabsTrigger value="password">{t.passwordTab}</TabsTrigger>}
          {security && <TabsTrigger value="security">{t.securityTab}</TabsTrigger>}
          {sessions && <TabsTrigger value="sessions">{t.sessionsTab}</TabsTrigger>}
        </TabsList>
        <TabsContent value="profile"><ProfileSettings user={user} onSave={onSaveProfile} labels={labels} /></TabsContent>
        {onChangePassword && <TabsContent value="password"><PasswordSettings onSave={onChangePassword} labels={labels} /></TabsContent>}
        {security && <TabsContent value="security"><SecuritySettings {...security} labels={labels} /></TabsContent>}
        {sessions && <TabsContent value="sessions"><SessionsSettings {...sessions} labels={labels} /></TabsContent>}
      </Tabs>
    </div>
  );
}

/* Team */

export type TeamMember = { id: string; name: string; email: string; role: string; status?: "active" | "invited"; avatarUrl?: string };
export type TeamRole = { value: string; label: string };

export function InviteMemberDialog({ open, onOpenChange, roles, onInvite, labels }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: TeamRole[];
  onInvite: (values: { email: string; role: string }) => unknown;
  labels?: Partial<Labels>;
}) {
  const t = useLabels(labels);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(roles[0]?.value ?? "");
  const [emailError, setEmailError] = useState<string>();
  const submit = useSubmit(onInvite, t.genericError);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isEmail(email)) return setEmailError(t.invalidEmail);
    setEmailError(undefined);
    if (await submit.run({ email: email.trim(), role })) {
      setEmail("");
      onOpenChange(false);
      toast.success(t.inviteSent);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={t.inviteMember} description={t.inviteDialogDescription}>
        <form noValidate onSubmit={handleSubmit} className="kr:space-y-4">
          {submit.error && <Alert tone="danger">{submit.error}</Alert>}
          <Field label={t.email} error={emailError}>
            <Input type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label={t.role}>
            <Select value={role} onValueChange={setRole} options={roles} />
          </Field>
          <div className="kr:flex kr:flex-col-reverse kr:gap-2 kr:pt-1 kr:md:flex-row kr:md:justify-end">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>{t.cancel}</Button>
            <Button type="submit" loading={submit.pending}>{t.sendInvite}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * `canManage` only changes what the screen shows. The backend must still
 * authorize each invite, role change, and removal.
 */
export function MembersScreen({ members, roles, canManage, onInvite, onRoleChange, onRemove, loading, error, onRetry, title, description, labels, className }: {
  members: TeamMember[];
  roles: TeamRole[];
  canManage?: boolean;
  onInvite?: (values: { email: string; role: string }) => unknown;
  onRoleChange?: (member: TeamMember, role: string) => unknown;
  onRemove?: (member: TeamMember) => unknown;
  loading?: boolean;
  error?: ReactNode;
  onRetry?: () => void;
  title?: ReactNode;
  description?: ReactNode;
  labels?: Partial<Labels>;
  className?: string;
}) {
  const t = useLabels(labels);
  const [search, setSearch] = useState("");
  const [inviting, setInviting] = useState(false);
  const [removing, setRemoving] = useState<TeamMember>();
  const change = useSubmit(onRoleChange, t.genericError);
  const remove = useSubmit(onRemove, t.genericError);

  const columns = useMemo<DataTableColumn<TeamMember>[]>(() => {
    const base: DataTableColumn<TeamMember>[] = [
      {
        id: "member",
        header: t.member,
        accessor: (m) => `${m.name} ${m.email}`,
        sortable: true,
        cell: (m) => (
          <span className="kr:flex kr:min-w-0 kr:items-center kr:gap-2.5">
            <Avatar name={m.name} src={m.avatarUrl} />
            <span className="kr:min-w-0">
              <span className="kr:block kr:truncate kr:font-medium">{m.name}</span>
              <span className="kr:block kr:truncate kr:text-[0.8125rem] kr:font-normal kr:text-muted">{m.email}</span>
            </span>
          </span>
        ),
      },
      {
        id: "role",
        header: t.role,
        accessor: "role",
        sortable: true,
        cell: (m) =>
          canManage && onRoleChange ? (
            <Select aria-label={`${t.role}: ${m.name}`} value={m.role} disabled={change.pending} onValueChange={(role) => change.run(m, role)} options={roles} className="kr:w-36" />
          ) : (
            (roles.find((r) => r.value === m.role)?.label ?? m.role)
          ),
      },
      {
        id: "status",
        header: t.status,
        accessor: "status",
        cell: (m) => (m.status === "invited" ? <Badge tone="warning">{t.statusInvited}</Badge> : <Badge tone="success">{t.statusActive}</Badge>),
      },
    ];
    if (canManage && onRemove) {
      base.push({
        id: "actions",
        header: <span className="kr:sr-only">{t.actions}</span>,
        label: t.actions,
        align: "right",
        cell: (m) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">{t.actions}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem danger onSelect={() => setRemoving(m)}>{t.removeMember}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      });
    }
    return base;
  }, [t, canManage, onRoleChange, onRemove, roles, change.pending, change.run]);

  return (
    <div className={cn("kr:min-w-0", className)}>
      <PageHeader
        title={title ?? t.membersTitle}
        description={description ?? t.membersDescription}
        actions={canManage && onInvite && <Button onClick={() => setInviting(true)}>{t.inviteMember}</Button>}
      />
      {(change.error || remove.error) && <Alert tone="danger" className="kr:mb-3">{change.error ?? remove.error}</Alert>}
      <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder={t.searchMembers} />
      <DataTable columns={columns} data={members} getRowId={(m) => m.id} search={search} loading={loading} error={error} onRetry={onRetry} />
      {onInvite && <InviteMemberDialog open={inviting} onOpenChange={setInviting} roles={roles} onInvite={onInvite} labels={labels} />}
      <Dialog open={Boolean(removing)} onOpenChange={(open) => !open && setRemoving(undefined)}>
        <DialogContent
          title={t.removeMember}
          description={removing ? fill(t.removeMemberConfirm, { name: removing.name }) : undefined}
          footer={
            <>
              <Button variant="secondary" onClick={() => setRemoving(undefined)}>{t.cancel}</Button>
              <Button
                variant="danger"
                loading={remove.pending}
                onClick={async () => {
                  if (removing) await remove.run(removing);
                  setRemoving(undefined);
                }}
              >
                {t.removeMember}
              </Button>
            </>
          }
        />
      </Dialog>
    </div>
  );
}

/* Onboarding */

export type OnboardingStep = {
  title: string;
  description?: ReactNode;
  content: ReactNode;
  /** Runs before moving on. Return false or reject to stay on this step. */
  validate?: () => boolean | Promise<boolean>;
  /** Shows a skip button for this step. */
  optional?: boolean;
};

export function OnboardingWizard({ steps, initialStep = 0, onStepChange, onComplete, brand, labels, className }: {
  steps: OnboardingStep[];
  initialStep?: number;
  /** Save progress here, then pass it back through `initialStep`. */
  onStepChange?: (index: number) => void;
  onComplete: () => unknown;
  brand?: Brand;
  labels?: Partial<Labels>;
  className?: string;
}) {
  const t = useLabels(labels);
  const fallback = useKora().brand;
  const b = brand ?? fallback;
  const [index, setIndex] = useState(Math.min(Math.max(initialStep, 0), steps.length - 1));
  const go = (next: number) => {
    setIndex(next);
    onStepChange?.(next);
  };
  const step = steps[index];
  const isLast = index === steps.length - 1;
  const advance = useSubmit(async () => {
    if (step?.validate && !(await step.validate())) return;
    if (isLast) await onComplete();
    else go(index + 1);
  }, t.genericError);
  if (!step) return null;

  return (
    <main className={cn("kr:flex kr:min-h-dvh kr:flex-col kr:bg-bg kr:px-4 kr:py-6 kr:text-fg kr:md:py-10", className)}>
      <div className="kr:mx-auto kr:w-full kr:max-w-2xl">
        {b && (
          <div className="kr:mb-6 kr:flex kr:items-center kr:gap-2 kr:text-sm kr:font-semibold">
            {b.logo}
            {b.name}
          </div>
        )}
        <Stepper steps={steps.map((s) => s.title)} current={index} className="kr:mb-6" />
        <Card>
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              void advance.run();
            }}
          >
            <CardContent>
              <h1 className="kr:text-lg kr:font-semibold">{step.title}</h1>
              {step.description && <p className="kr:mt-1 kr:text-sm kr:text-muted">{step.description}</p>}
              {advance.error && <Alert tone="danger" className="kr:mt-4">{advance.error}</Alert>}
              <div className="kr:mt-5">{step.content}</div>
            </CardContent>
            <CardFooter className="kr:justify-between">
              <Button variant="ghost" disabled={index === 0 || advance.pending} onClick={() => go(index - 1)}>{t.back}</Button>
              <div className="kr:flex kr:gap-2">
                {step.optional && !isLast && (
                  <Button variant="ghost" disabled={advance.pending} onClick={() => go(index + 1)}>{t.skip}</Button>
                )}
                <Button type="submit" loading={advance.pending}>{isLast ? t.finish : t.next}</Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}
