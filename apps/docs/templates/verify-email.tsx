"use client";
import { VerifyEmailScreen } from "kora-ui/auth";
import { wait } from "@/lib/demo-data";
import { brand } from "./logo";

export default function Template() {
  return <VerifyEmailScreen brand={brand} email="marta@example.com" onResend={() => wait()} links={{ signIn: "/preview/login" }} />;
}

