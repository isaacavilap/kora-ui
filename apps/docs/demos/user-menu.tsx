"use client";
import { DropdownMenuItem, DropdownMenuSeparator, UserMenu } from "kora-ui";

export default function Demo() {
  return (
    <UserMenu name="Marta Ríos" email="marta@koracoffee.com" seed="marta">
      <DropdownMenuItem>Account</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Sign out</DropdownMenuItem>
    </UserMenu>
  );
}
