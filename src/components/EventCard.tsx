import { Link } from "react-router";
import { EventSummary } from "@/types";
import { eventFromPrice, formatDate, formatIdr } from "@/utils/format";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function EventCard({ event }: { event: EventSummary }) {
  const price = eventFromPrice(event);

  return (
    <Link to={`/events/${event.slug}`} className="block">
      <Card className="flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
        <div className="h-36 bg-accent/10">
          {event.bannerImageUrl ? (
            <img src={event.bannerImageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-semibold text-primary">
              {event.category.name}
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-4">
          <Badge variant="secondary" className="w-fit">
            {event.category.name}
          </Badge>
          <h3 className="font-bold text-foreground">{event.name}</h3>
          <p className="text-sm text-muted-foreground">
            {formatDate(event.startDate)} &middot; {event.location}
          </p>
          <div className="mt-auto flex items-center justify-between pt-2 text-sm">
            <span className="font-bold text-foreground">{event.isPaid ? formatIdr(price) : "Free"}</span>
            <span className="text-muted-foreground">{event.availableSeats} seats left</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
