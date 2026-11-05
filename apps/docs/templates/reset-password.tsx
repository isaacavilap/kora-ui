"use client";
import { ResetPasswordScreen } from "kora-ui/auth";
import { wait } from "@/lib/demo-data";
import { brand } from "./logo";

export default function Template() {
  return <ResetPasswordScreen brand={brand} onSubmit={() => wait()} links={{ signIn: "/preview/login" }} />;
}

