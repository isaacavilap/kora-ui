"use client";
import { Alert } from "kora-ui";

export default function Demo() {
  return (
    <div className="grid gap-2">
      <Alert title="Export ready">Your file is in Downloads.</Alert>
      <Alert tone="success">Changes saved.</Alert>
      <Alert tone="warning" title="Plan limit near">You have used 90% of this month's rows.</Alert>
      <Alert tone="danger" title="Payment failed">Update the card on file to keep access.</Alert>
    </div>
  );
}

