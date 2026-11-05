"use client";
import { ErrorScreen } from "kora-ui/screens";
import { brand } from "./logo";

export default function Template() {
  return <ErrorScreen variant="maintenance" brand={brand} onRetry={() => window.location.reload()} />;
}

