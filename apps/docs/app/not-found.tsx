"use client";
import { ErrorScreen } from "kora-ui/screens";
import { KoraMark } from "@/components/kora-mark";

export default function NotFound() {
  return <ErrorScreen variant={404} brand={{ name: "kora-ui", logo: <KoraMark size={24} /> }} homeHref="/" />;
}
