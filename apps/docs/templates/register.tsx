"use client";
import { RegisterScreen } from "kora-ui/auth";
import { wait } from "@/lib/demo-data";
import { brand } from "./logo";

export default function Template() {
  return (
    <RegisterScreen
      brand={brand}
      terms="I accept the terms of service"
      onSubmit={async () => {
        await wait();
        window.location.href = "/preview/verify-email";
      }}
      links={{ signIn: "/preview/login" }}
    />
  );
}

