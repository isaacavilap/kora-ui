"use client";
import { useState } from "react";
import { ForgotPasswordScreen, LoginScreen, RegisterScreen, ResetPasswordScreen } from "kora-ui/auth";
import { KoraMark } from "@/components/kora-mark";
import { forgot, login, register, reset } from "./actions";

const brand = { name: "kora-ui", logo: <KoraMark /> };
// The screens fill the viewport by default; under the site header that pushed the form too far down.
const className = "min-h-0! [&>div]:items-start";
const MIN = 10;

export function Login({ next }: { next: string }) {
  return (
    <LoginScreen
      brand={brand}
      className={className}
      labels={{ loginTitle: "Sign in to kora-ui", loginDescription: "Your account opens the template code you bought." }}
      links={{ forgotPassword: "/login/forgot", register: `/register?next=${encodeURIComponent(next)}` }}
      onSubmit={async (v) => {
        const r = await login(v);
        if (r.error) throw new Error(r.error); // the screen shows its own message, which does not reveal the account
        window.location.assign(next); // full load, so server pages read the new session
      }}
    />
  );
}

export function Register({ next }: { next: string }) {
  const [error, setError] = useState<string>();
  return (
    <RegisterScreen
      brand={brand}
      className={className}
      error={error}
      minPasswordLength={MIN}
      links={{ signIn: `/login?next=${encodeURIComponent(next)}` }}
      onSubmit={async (v) => {
        const r = await register(v);
        if (r.error) { setError(r.error); throw new Error(r.error); }
        window.location.assign(next);
      }}
    />
  );
}

export function Forgot() {
  return <ForgotPasswordScreen brand={brand} className={className} links={{ signIn: "/login" }} onSubmit={forgot} />;
}

export function Reset({ token }: { token: string }) {
  const [error, setError] = useState<string>();
  return (
    <ResetPasswordScreen
      brand={brand}
      className={className}
      minPasswordLength={MIN}
      links={{ signIn: "/login" }}
      error={token ? error : "This link is not valid. Ask for a new one."}
      onSubmit={async ({ password }) => {
        const r = await reset({ token, password });
        if (r.error) { setError(r.error); throw new Error(r.error); }
      }}
    />
  );
}
