import { useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { useDeleteEventMutation, useMyEventsQuery } from "@/hooks/useEvents";
import { eventFromPrice, formatDate, formatIdr } from "@/utils/format";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function OrganizerEventsPage() {
  const { data: events, isLoading } = useMyEventsQuery();
  const deleteEvent = useDeleteEventMutation();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) return <p className="p-6 text-muted-foreground">Loading your events&hellip;</p>;

  if (!events || events.length === 0) {
    return (
      <div className="p-6">
        <EmptyState title="You haven't created any events yet" description="Use the Create event page to publish your first event." />
      </div>
    );
  }

  async function confirmDelete() {
    if (!pendingDeleteId) return;
    try {
      await deleteEvent.mutateAsync(pendingDeleteId);
      toast.success("Event deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete event");
    } finally {
      setPendingDeleteId(null);
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold">My events</h1>
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Seats</th>
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3">{e.name}</td>
                <td className="px-4 py-3">{formatDate(e.startDate)}</td>
                <td className="px-4 py-3">{e.status}</td>
                <td className="px-4 py-3">
                  {e.availableSeats}/{e.totalSeats}
                </td>
                <td className="px-4 py-3">{e.isPaid ? formatIdr(eventFromPrice(e)) : "Free"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/organizer/events/${e.id}/manage`}>Manage</Link>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setPendingDeleteId(e.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete this event?"
        description="This can't be undone."
        confirmLabel="Delete event"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
