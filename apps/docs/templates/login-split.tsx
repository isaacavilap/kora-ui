"use client";
import { Inline, Text } from "kora-ui";
import { LoginScreen } from "kora-ui/auth";
import { wait } from "@/lib/demo-data";
import { brand } from "./logo";

export default function Template() {
  return (
    <LoginScreen
      brand={brand}
      variant="split"
      aside={
        <Inline gap="none" align="stretch" justify="end" wrap={false} className="h-full flex-col">
          <Text strong className="max-w-md text-2xl leading-snug text-inherit">Every sale, cost, and refund for your store, in one place.</Text>
        </Inline>
      }
      onSubmit={async () => {
        await wait();
        window.location.href = "/preview/dashboard";
      }}
      links={{ forgotPassword: "/preview/forgot-password", register: "/preview/register" }}
    />
  );
}

