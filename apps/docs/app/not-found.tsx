"use client";
import { ErrorScreen } from "kora-ui/screens";
import { Logo } from "@/templates/logo";

export default function NotFound() {
  return <ErrorScreen variant={404} brand={{ name: "kora-ui", logo: <Logo /> }} homeHref="/" />;
}
