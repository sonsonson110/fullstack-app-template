import { authApi } from "@/api/auth";
import { getServerErrorMessage } from "@/api/response-type";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { resetPasswordSchema } from "@/schemas/reset-password.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router";
import z from "zod";

export default function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { resetToken } = useParams();
  const mutation = useMutation({
    mutationFn: authApi.resetPassword,
  });

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      resetToken: resetToken,
      newPassword: "",
    },
  });

  function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    mutation.mutate(values);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>
          Enter your your new password below to reset your account password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={cn("flex flex-col gap-6", className)}
            {...props}
          >
            <div className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Processing..." : "Reset password"}
                </Button>
                {mutation.isError && (
                  <p className="text-sm text-red-600">
                    {getServerErrorMessage(mutation.error)}
                  </p>
                )}
                {mutation.isSuccess && (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-green-600">
                      Password reset successfully.
                    </p>
                    <Link
                      to="/login"
                      className="p-0 h-auto text-blue-600 underline"
                    >
                      Back to login
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
