"use client";
import { ErrorScreen } from "kora-ui/screens";
import { brand } from "./logo";

export default function Template() {
  return <ErrorScreen variant={500} brand={brand} onRetry={() => window.location.reload()} homeHref="/preview/dashboard" />;
}

