"use client";
import { Badge, Button, Card, Inline, Stack, Text } from "kora-ui";

export default function Demo() {
  return (
    <Stack gap="md">
      <Card className="p-4">
        <Inline justify="between">
          <Text strong>Order 1042</Text>
          <Badge tone="success">Paid</Badge>
        </Inline>
      </Card>
      <Inline>
        <Button>Save</Button>
        <Button variant="secondary">Cancel</Button>
      </Inline>
    </Stack>
  );
}
