"use client";
import { Button, Field, Input, Sheet, SheetClose, SheetContent, SheetTrigger, Stack } from "kora-ui";

export default function Demo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary">Edit customer</Button>
      </SheetTrigger>
      <SheetContent
        title="Edit customer"
        description="Changes apply to future orders."
        footer={<SheetClose asChild><Button>Save changes</Button></SheetClose>}
      >
        <Stack gap="md">
          <Field label="Name"><Input defaultValue="Marta Ríos" /></Field>
          <Field label="Email"><Input type="email" defaultValue="marta@example.com" /></Field>
        </Stack>
      </SheetContent>
    </Sheet>
  );
}

