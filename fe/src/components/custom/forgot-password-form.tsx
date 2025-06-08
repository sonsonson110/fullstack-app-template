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

import { forgotPasswordSchema } from "@/schemas/forgot-password.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import type z from "zod";

export default function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const mutation = useMutation({
    mutationFn: authApi.forgotPassword,
  });

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    mutation.mutate(values);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Forgot password request
        </CardTitle>
        <CardDescription>
          Enter your email below to request a password reset link.
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="account@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={mutation.isPending || mutation.isSuccess}
                >
                  {mutation.isPending
                    ? "Processing..."
                    : "Send password reset email"}
                </Button>
                {mutation.isError && (
                  <p className="text-sm text-red-600">
                    {getServerErrorMessage(mutation.error)}
                  </p>
                )}
                {mutation.isSuccess && (
                  <p className="text-sm text-green-600">
                    A mail has been sent to your inbox, please take action
                    within 15 minutes.
                  </p>
                )}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
