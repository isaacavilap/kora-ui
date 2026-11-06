"use client";
import { Gauge, Grid } from "kora-ui";

export default function Demo() {
  return (
    <Grid min="9rem" className="max-w-lg">
      <Gauge label="CPU" value={72} tone="warning" />
      <Gauge label="Memory" value={58} tone="success" />
      <Gauge label="Disk" value={91} tone="danger" />
    </Grid>
  );
}
