"use client";
import { Field, ImageInput } from "kora-ui";

export default function Demo() {
  return (
    <Field label="Product photos" className="max-w-md">
      <ImageInput multiple maxFiles={4} maxSize={1600} hint="Up to 4 images. They are compressed before upload." />
    </Field>
  );
}
