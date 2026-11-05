"use client";
import { Card, CardContent, Skeleton } from "kora-ui";

export default function Demo() {
  return (
    <Card className="max-w-sm">
      <CardContent className="grid gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  );
}

