"use client";
import { Inline, Separator, Stack, Text } from "kora-ui";

export default function Demo() {
  return (
    <Stack gap="none" className="max-w-sm text-sm">
      <Text className="pb-3">Account</Text>
      <Separator />
      <Inline wrap={false} className="h-10 gap-3">
        <Text inline>Profile</Text>
        <Separator orientation="vertical" className="h-4" />
        <Text inline>Security</Text>
      </Inline>
    </Stack>
  );
}

