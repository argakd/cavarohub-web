import { NavLink, Outlet } from "react-router";
import { AccountMenu } from "@/components/AccountMenu";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn("font-medium transition-colors", isActive ? "text-gold" : "text-cream/70 hover:text-cream");

export function Layout() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-gold/20 bg-forest px-6 py-3 text-cream">
        <nav className="flex flex-wrap items-center gap-6">
          <NavLink to="/" className="flex items-center gap-2 font-serif-brand text-lg font-bold text-gold" end>
            <img src="/cavaro-logo.png" alt="CavaroHub" className="h-8 w-8 object-contain" />
            CavaroHub
          </NavLink>
          <div className="flex flex-wrap gap-4">
            <NavLink to="/" className={navLinkClass} end>
              Browse
            </NavLink>
            {user?.role === "CUSTOMER" && (
              <NavLink to="/my-tickets" className={navLinkClass}>
                My tickets
              </NavLink>
            )}
            {user?.role === "ORGANIZER" && (
              <NavLink to="/organizer/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
            )}
            {user?.role === "ORGANIZER" && (
              <NavLink to="/organizer/events" className={navLinkClass}>
                My events
              </NavLink>
            )}
            {user?.role === "ORGANIZER" && (
              <NavLink to="/organizer/events/new" className={navLinkClass}>
                Create event
              </NavLink>
            )}
          </div>
        </nav>
        <AccountMenu />
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border bg-card px-6 py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} CavaroHub. Built for discovering and hosting great events.
      </footer>
    </div>
  );
}
