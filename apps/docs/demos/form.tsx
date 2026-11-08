"use client";
import { Button, Field, Form, FormActions, Input, toast, Toaster } from "kora-ui";

export default function Demo() {
  return (
    <>
      <Toaster />
      <Form onSubmit={(e) => { e.preventDefault(); toast.success("Customer created."); }}>
        <Field label="Name" required><Input name="name" required /></Field>
        <Field label="Email"><Input name="email" type="email" /></Field>
        <FormActions>
          <Button type="button" variant="secondary">Cancel</Button>
          <Button type="submit">Create customer</Button>
        </FormActions>
      </Form>
    </>
  );
}
