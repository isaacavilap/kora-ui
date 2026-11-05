"use client";
import { OtpScreen } from "kora-ui/auth";
import { wait } from "@/lib/demo-data";
import { brand } from "./logo";

/* Any code works except 000000, which shows the failure state. */
export default function Template() {
  return (
    <OtpScreen
      brand={brand}
      onResend={() => wait()}
      onSubmit={async ({ code }) => {
        await wait();
        if (code === "000000") throw new Error("Invalid code");
        window.location.href = "/preview/dashboard";
      }}
      links={{ signIn: "/preview/login" }}
    />
  );
}

