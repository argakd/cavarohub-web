import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router";
import { resetPassword } from "@/api/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const resetSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});
type ResetValues = z.infer<typeof resetSchema>;

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { token: searchParams.get("token") ?? "", newPassword: "" },
  });

  async function onSubmit(values: ResetValues) {
    setError(null);
    try {
      await resetPassword(values);
      setDone(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    }
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <Card>
        <CardHeader>
          <CardTitle>Choose a new password</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-3 text-sm font-medium text-destructive">{error}</p>}
          {done ? (
            <p className="text-sm font-medium text-green-700">Password updated! Redirecting to sign in&hellip;</p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="token">Reset token</Label>
                <Input id="token" {...register("token")} />
                {errors.token && <p className="text-sm text-destructive">{errors.token.message}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="newPassword">New password</Label>
                <Input id="newPassword" type="password" {...register("newPassword")} />
                {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword.message}</p>}
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Reset password"}
              </Button>
            </form>
          )}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
