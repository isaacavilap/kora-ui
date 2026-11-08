"use client";
import { useState } from "react";
import { Badge, Button, Field, Grid, Inline, Input, Select, Stack, themeColorsCss, type MenuColor } from "kora-ui";

const menus = [{ value: "default", label: "Default" }, { value: "primary", label: "Primary" }, { value: "secondary", label: "Secondary" }];

export default function Demo() {
  const [primary, setPrimary] = useState("#2563eb");
  const [secondary, setSecondary] = useState("#eff6ff");
  const [menu, setMenu] = useState("default");
  return (
    <Stack>
      <style dangerouslySetInnerHTML={{ __html: themeColorsCss({ primary, secondary, menu: menu as MenuColor }) }} />
      <Grid min="10rem">
        <Field label="Primary"><Input type="color" value={primary} onChange={(event) => setPrimary(event.target.value)} /></Field>
        <Field label="Secondary"><Input type="color" value={secondary} onChange={(event) => setSecondary(event.target.value)} /></Field>
        <Field label="Menu"><Select options={menus} value={menu} onValueChange={setMenu} /></Field>
      </Grid>
      <Inline><Button>Save</Button><Button variant="secondary">Cancel</Button><Badge>Draft</Badge></Inline>
    </Stack>
  );
}
