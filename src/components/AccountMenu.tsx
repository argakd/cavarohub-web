import { Link, useNavigate } from "react-router";
import { LogOut, User } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AccountMenu() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="flex items-center gap-2 rounded-full text-sm text-cream hover:opacity-90">
            <Avatar>
              <AvatarImage src={user.profilePicture ?? undefined} alt={user.name} />
              <AvatarFallback>{user.name.slice(0, 1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline">{user.name}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user.role === "ORGANIZER" ? "Host" : "Attendee"}</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link to="/profile" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              signOut();
              navigate("/");
            }}
            className="flex items-center gap-2 text-destructive"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <Button asChild variant="outline" size="sm">
        <Link to="/login">Sign in</Link>
      </Button>
      <Button asChild size="sm">
        <Link to="/register">Register</Link>
      </Button>
    </div>
  );
}
