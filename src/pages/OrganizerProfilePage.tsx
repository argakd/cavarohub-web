import { useParams } from "react-router";
import { useOrganizerRatingSummaryQuery } from "@/hooks/useReviews";
import { formatDate } from "@/utils/format";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent } from "@/components/ui/card";

export function OrganizerProfilePage() {
  const { organizerId } = useParams<{ organizerId: string }>();
  const { data: summary } = useOrganizerRatingSummaryQuery(organizerId);

  if (!summary) return <p className="p-6 text-muted-foreground">Loading&hellip;</p>;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold">Host profile</h1>
      <Card>
        <CardContent className="pt-5">
          <p className="text-2xl font-bold">
            {summary.averageRating ? `${summary.averageRating.toFixed(1)} ★` : "No ratings yet"}
          </p>
          <p className="text-sm text-muted-foreground">{summary.reviewCount} review(s)</p>
        </CardContent>
      </Card>

      {summary.reviews.length === 0 ? (
        <EmptyState title="No reviews yet" description="Reviews appear here" />
      ) : (
        <Card>
          <CardContent className="pt-5">
            {summary.reviews.map((r) => (
              <div key={r.id} className="border-b border-border py-3 last:border-0">
                <strong>{r.user.name}</strong> &middot; {"★".repeat(r.rating)} &middot; {r.event.name}
                <p className="text-sm text-muted-foreground">{formatDate(r.createdAt)}</p>
                {r.comment && <p>{r.comment}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
