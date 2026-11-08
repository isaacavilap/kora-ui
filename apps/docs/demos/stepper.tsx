"use client";
import { useState } from "react";
import { Button, Inline, Stack, Stepper } from "kora-ui";

const steps = ["Workspace", "Invite team", "Connect data", "Done"];

export default function Demo() {
  const [current, setCurrent] = useState(1);
  return (
    <Stack gap="md">
      <Stepper steps={steps} current={current} />
      <Inline align="stretch" wrap={false}>
        <Button variant="secondary" disabled={current === 0} onClick={() => setCurrent(current - 1)}>Back</Button>
        <Button disabled={current === steps.length - 1} onClick={() => setCurrent(current + 1)}>Next</Button>
      </Inline>
    </Stack>
  );
}

