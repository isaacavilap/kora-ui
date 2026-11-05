"use client";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "kora-ui";
import { Copy, Pencil, Trash2 } from "lucide-react";

export default function Demo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Order KR-2048</DropdownMenuLabel>
        <DropdownMenuItem><Pencil aria-hidden />Edit</DropdownMenuItem>
        <DropdownMenuItem><Copy aria-hidden />Duplicate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem danger><Trash2 aria-hidden />Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

