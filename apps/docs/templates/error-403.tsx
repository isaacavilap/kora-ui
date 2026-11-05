"use client";
import { ErrorScreen } from "kora-ui/screens";
import { brand } from "./logo";

export default function Template() {
  return <ErrorScreen variant={403} brand={brand} homeHref="/preview/dashboard" />;
}

