"use client";
import { useState } from "react";
import { Button, Stepper } from "kora-ui";

const steps = ["Workspace", "Invite team", "Connect data", "Done"];

export default function Demo() {
  const [current, setCurrent] = useState(1);
  return (
    <div className="grid gap-4">
      <Stepper steps={steps} current={current} />
      <div className="flex gap-2">
        <Button variant="secondary" disabled={current === 0} onClick={() => setCurrent(current - 1)}>Back</Button>
        <Button disabled={current === steps.length - 1} onClick={() => setCurrent(current + 1)}>Next</Button>
      </div>
    </div>
  );
}

