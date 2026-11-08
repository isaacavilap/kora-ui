"use client";
import { Heading, Stack, Text } from "kora-ui";

export default function Demo() {
  return (
    <Stack gap="sm">
      <Heading size="lg">Monthly report</Heading>
      <Text>Sales grew in every location.</Text>
      <Text size="sm" tone="muted">Updated today at 09:30.</Text>
      <Text size="sm" tone="danger" strong>Two payments failed.</Text>
    </Stack>
  );
}
