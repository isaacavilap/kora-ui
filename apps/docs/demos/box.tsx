"use client";
import { Box, Checkbox, Fieldset, Field, List, ListItem, Stack, Text } from "kora-ui";

export default function Demo() {
  return (
    <Stack gap="md">
      <Box as="section" aria-label="Team">
        <List gap="xs">
          <ListItem><Text>Ana Castillo</Text></ListItem>
          <ListItem><Text>Tomás Vega</Text></ListItem>
        </List>
      </Box>
      <Fieldset legend="Notifications">
        <Field label="Email"><Checkbox /></Field>
        <Field label="Text message"><Checkbox /></Field>
      </Fieldset>
    </Stack>
  );
}
