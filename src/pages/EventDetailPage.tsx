import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useEventQuery } from "@/hooks/useEvents";
import { TicketType } from "@/types";
import { eventFromPrice, formatDate, formatDateTime, formatIdr } from "@/utils/format";
import { useAuthStore } from "@/store/auth.store";
import { ReviewForm } from "@/components/ReviewForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { data: event, isLoading, error } = useEventQuery(slug);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType | null>(null);
  const [quantity, setQuantity] = useState(1);

  const activeTicketType = selectedTicketType ?? event?.ticketTypes[0] ?? null;

  if (isLoading) return <p className="p-6 text-muted-foreground">Loading event&hellip;</p>;
  if (error || !event) return <p className="p-6 text-sm font-medium text-destructive">{error instanceof Error ? error.message : "Event not found"}</p>;

  const hasEnded = new Date(event.endDate) < new Date();
  const soldOut = event.availableSeats <= 0;

  function goToCheckout() {
    navigate(`/events/${event!.slug}/checkout`, {
      state: { ticketTypeId: activeTicketType?.id, quantity },
    });
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      {event.bannerImageUrl && (
        <img src={event.bannerImageUrl} alt={event.name} className="h-64 w-full rounded-xl object-cover sm:h-80" />
      )}
      <div className="flex flex-col gap-1">
        <Badge variant="secondary" className="w-fit">
          {event.category.name}
        </Badge>
        <h1 className="text-3xl font-bold">{event.name}</h1>
        <p className="text-muted-foreground">
          {formatDate(event.startDate)} &ndash; {formatDate(event.endDate)} &middot; {event.location}
        </p>
        <p>
          Organized by{" "}
          <Link to={`/organizers/${event.organizer.id}`} className="text-primary hover:underline">
            <strong>{event.organizer.name}</strong>
          </Link>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="pt-5">
              <h3 className="mb-2 text-lg font-bold">About this event</h3>
              <p className="text-foreground/80">{event.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <h3 className="mb-2 text-lg font-bold">Reviews ({event.reviews.length})</h3>
              {event.reviews.length === 0 ? (
                <p className="text-muted-foreground">No reviews yet.</p>
              ) : (
                event.reviews.map((r) => (
                  <div key={r.id} className="border-b border-border py-3 last:border-0">
                    <strong>{r.user.name}</strong> &middot; {"★".repeat(r.rating)}
                    {r.comment && <p className="text-muted-foreground">{r.comment}</p>}
                  </div>
                ))
              )}
              {user?.role === "CUSTOMER" && <ReviewForm eventId={event.id} />}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="pt-5">
              <h3 className="mb-2 text-lg font-bold">Tickets</h3>
              {!event.isPaid && (
                <div className="flex items-center justify-between border-b border-border py-3">
                  <span>Free entry</span>
                  <span>{formatIdr(0)}</span>
                </div>
              )}
              {event.ticketTypes.map((tt) => (
                <label key={tt.id} className="flex items-center justify-between border-b border-border py-3 last:border-0">
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="ticketType"
                      checked={activeTicketType?.id === tt.id}
                      onChange={() => setSelectedTicketType(tt)}
                    />
                    {tt.name} ({tt.availableSeats} left)
                  </span>
                  <span>{formatIdr(tt.priceIdr)}</span>
                </label>
              ))}

              {event.ticketTypes.length > 0 && (
                <div className="mt-3 flex flex-col gap-1">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    max={activeTicketType?.availableSeats ?? 1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  />
                </div>
              )}

              {event.vouchers.length > 0 && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Active vouchers: {event.vouchers.map((v) => v.code).join(", ")}
                </p>
              )}

              <p className="mt-3 font-bold">From {formatIdr(eventFromPrice(event))}</p>

              {hasEnded ? (
                <p className="mt-2 text-sm font-medium text-destructive">This event has ended.</p>
              ) : soldOut ? (
                <p className="mt-2 text-sm font-medium text-destructive">Sold out.</p>
              ) : user?.role === "CUSTOMER" ? (
                <Button className="mt-3 w-full" onClick={goToCheckout}>
                  Get tickets
                </Button>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Sign in as an attendee to purchase tickets.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <h3 className="mb-2 text-lg font-bold">Details</h3>
              <p className="text-sm text-muted-foreground">Starts: {formatDateTime(event.startDate)}</p>
              <p className="text-sm text-muted-foreground">Ends: {formatDateTime(event.endDate)}</p>
              <p className="text-sm text-muted-foreground">
                {event.availableSeats} / {event.totalSeats} seats available
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
