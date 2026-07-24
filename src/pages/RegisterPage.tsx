import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router";
import { register as registerAccount } from "@/api/auth";
import { useAuthStore } from "@/store/auth.store";
import { Role } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  referralCode: z.string().optional(),
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const signIn = useAuthStore((s) => s.signIn);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState<Role>("CUSTOMER");
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { referralCode: searchParams.get("ref") ?? "" },
  });

  async function onSubmit(values: RegisterValues) {
    setError(null);
    try {
      const auth = await registerAccount({ ...values, role, referralCode: values.referralCode || undefined });
      signIn(auth);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register");
    }
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-3 text-sm font-medium text-destructive">{error}</p>}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <Label>I am a...</Label>
              <Tabs value={role} onValueChange={(value) => setRole(value as Role)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="ORGANIZER">Host</TabsTrigger>
                  <TabsTrigger value="CUSTOMER">Attendee</TabsTrigger>
                </TabsList>
              </Tabs>
              <p className="text-xs text-muted-foreground">
                {role === "ORGANIZER" ? "Hosts create and manage events." : "Attendees browse and buy tickets."}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="referralCode">Referral code (optional)</Label>
              <Input
                id="referralCode"
                placeholder="Got a code from a friend? Enter it for a discount coupon"
                {...register("referralCode")}
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating account…" : "Create account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
