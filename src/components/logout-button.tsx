"use client";

import { Button } from "@/components/ui/button";
import { logout } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function handleLogout() {
    await logout();
    // Force a full page reload to ensure the layout re-renders with fresh session state
    window.location.href = "/login";
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(handleLogout);
      }}
    >
      <Button
        variant="ghost"
        size="sm"
        type="submit"
        disabled={pending}
        className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5"
      >
        {pending ? "Wird ausgeloggt..." : "Ausloggen"}
      </Button>
    </form>
  );
}
