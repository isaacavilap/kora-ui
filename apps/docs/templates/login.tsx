"use client";
import { LoginScreen } from "kora-ui/auth";
import { wait } from "@/lib/demo-data";
import { brand } from "./logo";

/* Try any email with the password "wrong" to see the failure state. */
export default function Template() {
  return (
    <LoginScreen
      brand={brand}
      providers={["google", "microsoft"]}
      onProvider={() => wait()}
      onMagicLink={() => wait()}
      onSubmit={async ({ password }) => {
        await wait();
        if (password === "wrong") throw new Error("Invalid credentials");
        window.location.href = "/preview/dashboard";
      }}
      links={{ forgotPassword: "/preview/forgot-password", register: "/preview/register" }}
    />
  );
}

