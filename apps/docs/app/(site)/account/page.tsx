import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button, Card, CardContent, CardHeader, DescriptionList } from "kora-ui";
import { currentUser } from "@/lib/auth";
import { SignOut } from "./sign-out";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

export default async function Page() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/account");
  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <Card>
        <CardHeader title="Your account" actions={<SignOut />} />
        <CardContent>
          <DescriptionList items={[
            { label: "Name", value: user.name },
            { label: "Email", value: user.email },
          ]} />
          <Button asChild variant="secondary" className="mt-4"><Link href="/templates">See templates</Link></Button>
        </CardContent>
      </Card>
    </main>
  );
}
