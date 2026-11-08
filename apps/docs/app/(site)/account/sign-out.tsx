"use client";
import { Button } from "kora-ui";
import { logout } from "../login/actions";

export function SignOut() {
  return <Button variant="secondary" size="sm" onClick={async () => { await logout(); window.location.assign("/"); }}>Sign out</Button>;
}
