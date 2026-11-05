"use client";
import { LoginScreen } from "kora-ui/auth";
import { wait } from "@/lib/demo-data";
import { brand } from "./logo";

export default function Template() {
  return (
    <LoginScreen
      brand={brand}
      variant="split"
      aside={
        <div className="flex h-full flex-col justify-end">
          <p className="max-w-md text-2xl font-medium leading-snug">Every sale, cost, and refund for your store, in one place.</p>
        </div>
      }
      onSubmit={async () => {
        await wait();
        window.location.href = "/preview/dashboard";
      }}
      links={{ forgotPassword: "/preview/forgot-password", register: "/preview/register" }}
    />
  );
}

