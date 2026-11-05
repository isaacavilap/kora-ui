"use client";
import { Button, Dialog, DialogClose, DialogContent, DialogTrigger } from "kora-ui";

export default function Demo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="danger">Delete order</Button>
      </DialogTrigger>
      <DialogContent
        title="Delete order KR-2048?"
        description="This removes the order and its invoice. You cannot undo this."
        footer={
          <>
            <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
            <DialogClose asChild><Button variant="danger">Delete order</Button></DialogClose>
          </>
        }
      />
    </Dialog>
  );
}

