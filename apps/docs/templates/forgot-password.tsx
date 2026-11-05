"use client";
import { ForgotPasswordScreen } from "kora-ui/auth";
import { wait } from "@/lib/demo-data";
import { brand } from "./logo";

export default function Template() {
  return <ForgotPasswordScreen brand={brand} onSubmit={() => wait()} links={{ signIn: "/preview/login" }} />;
}

