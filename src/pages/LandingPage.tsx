import { useState } from "react";
import { Link } from "react-router";
import { CalendarDays, MapPin, Sparkles } from "lucide-react";
import { useCategoriesQuery, useEventsQuery } from "@/hooks/useEvents";
import { SearchBar } from "@/components/SearchBar";
import { EventCard } from "@/components/EventCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/auth.store";

export function LandingPage() {
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const { data: categories } = useCategoriesQuery();
  const { data, isLoading, error } = useEventsQuery({
    search,
    category: category === "all" ? undefined : category,
    location,
    page,
    pageSize,
  });

  const events = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex flex-col gap-10">
      <section className="bg-background px-6 py-16 text-foreground sm:py-24">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-forest">
            <Sparkles className="h-3.5 w-3.5" /> Discover Events
          </span>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            Find, host, and manage events
          </h1>
          <p className="max-w-xl text-muted-foreground">
            CavaroHub provides a plaform for organizing events,
            grabbing tickets, and manage your own event,
            vouchers, and attendees from a single dashboard.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href="#browse">Browse events</a>
            </Button>
            {!user && (
              <Button asChild size="lg" variant="outline">
                <Link to="/register">Become a Host</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <section
        id="browse"
        className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 pb-16"
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">Upcoming events</h2>
          <p className="text-muted-foreground">
            Filter by category and location, or search by event name.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <SearchBar
            onSearch={(value) => {
              setPage(1);
              setSearch(value);
            }}
          />
          <Select
            value={category}
            onValueChange={(value) => {
              setPage(1);
              setCategory(value);
            }}
          >
            <SelectTrigger
              className="w-auto min-w-40"
              aria-label="Filter by category"
            >
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Location"
              value={location}
              onChange={(e) => {
                setPage(1);
                setLocation(e.target.value);
              }}
              aria-label="Filter by location"
              className="w-auto pl-9"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm font-medium text-destructive">
            {error instanceof Error ? error.message : "Failed to load events"}
          </p>
        )}

        {isLoading ? (
          <p className="text-muted-foreground">Loading events&hellip;</p>
        ) : events.length === 0 ? (
          <EmptyState
            title="No events found"
            description="Try a different search term, category, or location."
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" /> Page {page} of{" "}
                  {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
