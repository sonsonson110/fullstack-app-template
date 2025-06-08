import { authApi } from "@/api/auth";
import ResetPasswordForm from "@/components/custom/reset-password-form";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { useNavigate, useParams } from "react-router";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { resetToken } = useParams();
  const mutation = useMutation({
    mutationFn: authApi.verifyResetToken,
    onError: () => {
      navigate("/not-found");
    },
  });
  React.useEffect(() => {
    mutation.mutate(resetToken!);
  }, [resetToken]);

  if (mutation.isPending) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="text-center">
          <p>Verifying reset token...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
