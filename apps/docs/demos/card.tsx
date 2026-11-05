"use client";
import { Button, Card, CardContent, CardFooter, CardHeader } from "kora-ui";

export default function Demo() {
  return (
    <Card className="max-w-md">
      <CardHeader title="Billing plan" description="Renews on December 1." actions={<Button size="sm" variant="secondary">Change</Button>} />
      <CardContent>
        <p className="text-sm">Team plan with 12 of 20 seats in use.</p>
      </CardContent>
      <CardFooter>
        <Button size="sm">Add seats</Button>
      </CardFooter>
    </Card>
  );
}

