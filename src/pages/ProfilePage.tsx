import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { changePassword, updateProfile } from "@/api/auth";
import { usePointsBalanceQuery } from "@/hooks/useTransactions";
import { useAuthStore } from "@/store/auth.store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatIdr } from "@/utils/format";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  profilePicture: z.string().optional(),
});
type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});
type PasswordValues = z.infer<typeof passwordSchema>;

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const { data: pointsBalance } = usePointsBalanceQuery(user?.role === "CUSTOMER");

  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "", profilePicture: user?.profilePicture ?? "" },
  });

  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  if (!user) return null;

  async function submitProfile(values: ProfileValues) {
    setProfileError(null);
    setProfileMessage(null);
    try {
      const updated = await updateProfile({ name: values.name, profilePicture: values.profilePicture || undefined });
      updateUser(updated);
      setProfileMessage("Profile updated.");
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Failed to update profile");
    }
  }

  async function submitPassword(values: PasswordValues) {
    setPasswordError(null);
    setPasswordMessage(null);
    try {
      await changePassword(values);
      setPasswordMessage("Password changed.");
      passwordForm.reset();
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password");
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">Your profile</h1>

      <Card>
        <CardContent className="pt-5">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Referral code</h2>
          <p className="text-lg font-bold text-primary">{user.referralCode}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Share this with friends when they register. You earn 10,000 points (expiring in 3 months) for every
            referral, and they get a discount coupon.
          </p>
          {user.role === "CUSTOMER" && pointsBalance && (
            <p className="mt-2 text-sm">
              Current points balance: <strong>{formatIdr(pointsBalance.balanceIdr)}</strong>
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit profile</CardTitle>
        </CardHeader>
        <CardContent>
          {profileError && <p className="mb-2 text-sm font-medium text-destructive">{profileError}</p>}
          {profileMessage && <p className="mb-2 text-sm font-medium text-green-700">{profileMessage}</p>}
          <form onSubmit={profileForm.handleSubmit(submitProfile)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...profileForm.register("name")} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="profilePicture">Profile picture URL</Label>
              <Input id="profilePicture" placeholder="https://..." {...profileForm.register("profilePicture")} />
            </div>
            <Button type="submit">Save profile</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardContent>
          {passwordError && <p className="mb-2 text-sm font-medium text-destructive">{passwordError}</p>}
          {passwordMessage && <p className="mb-2 text-sm font-medium text-green-700">{passwordMessage}</p>}
          <form onSubmit={passwordForm.handleSubmit(submitPassword)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input id="currentPassword" type="password" {...passwordForm.register("currentPassword")} />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="newPassword">New password</Label>
              <Input id="newPassword" type="password" {...passwordForm.register("newPassword")} />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <Button type="submit">Change password</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
