"use client";
import { Card, CardContent, Grid } from "kora-ui";

const box = (text: string) => (
  <Card>
    <CardContent className="text-sm">{text}</CardContent>
  </Card>
);

export default function Demo() {
  return (
    <div className="grid gap-4">
      <Grid min="10rem">
        {box("Fits")}
        {box("as many")}
        {box("columns")}
        {box("as room allows")}
      </Grid>
      <Grid cols="2fr 1fr">
        {box("2fr from 1024px")}
        {box("1fr, stacked below")}
      </Grid>
    </div>
  );
}

