"use client";
import { Grid, KpiCard } from "kora-ui";

export default function Demo() {
  return (
    <Grid min="14rem">
      <KpiCard label="Revenue" value="$84,300" delta={7.3} deltaLabel="vs last month" trend={[61, 59, 65, 70, 74, 79, 84]} />
      <KpiCard label="Refund rate" value="1.8%" delta={-0.4} invertDelta deltaLabel="vs last month" />
      <KpiCard label="Orders" value="" loading />
    </Grid>
  );
}

