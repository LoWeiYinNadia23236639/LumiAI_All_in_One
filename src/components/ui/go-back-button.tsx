"use client";

import { useRouter } from "next/navigation";
import { Button } from "./button";

export function GoBackButton({ label }: { label: string }) {
  const router = useRouter();

  return (
    <Button variant="outline" onClick={() => router.back()}>
      {label}
    </Button>
  );
}
