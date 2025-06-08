import { LoginForm } from "@/components/custom/login-form";
import type { JSX } from "react";

export default function LoginPage(): JSX.Element {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}