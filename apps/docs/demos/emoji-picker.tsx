"use client";
import { useState } from "react";
import { EmojiPicker, Stack, Text } from "kora-ui";

export default function Demo() {
  const [picked, setPicked] = useState("");
  return (
    <Stack>
      <EmojiPicker onSelect={(emoji) => setPicked((p) => p + emoji)} />
      <Text tone="muted">Picked: <span className="text-xl">{picked || "none yet"}</span></Text>
    </Stack>
  );
}
