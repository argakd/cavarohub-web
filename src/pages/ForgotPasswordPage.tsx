import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router";
import { forgotPassword } from "@/api/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const forgotSchema = z.object({ email: z.string().email("Enter a valid email") });
type ForgotValues = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema) });

  async function onSubmit(values: ForgotValues) {
    setError(null);
    try {
      const res = await forgotPassword(values.email);
      setMessage(res.message);
      setDevResetUrl(res.devResetUrl ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <Card>
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-3 text-sm font-medium text-destructive">{error}</p>}
          {message && <p className="mb-3 text-sm font-medium text-green-700">{message}</p>}
          {devResetUrl && (
            <p className="mb-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              Dev mode (no real email server configured): reset link is{" "}
              <Link to={devResetUrl.replace(/^.*\/reset-password/, "/reset-password")} className="underline">
                here
              </Link>
              .
            </p>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending…" : "Send reset link"}
            </Button>
          </form>
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
