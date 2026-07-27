import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import { useDeleteEventMutation, useMyEventsQuery, useCreateVoucherMutation } from "@/hooks/useEvents";
import { useDecideTransactionMutation, useEventTransactionsQuery } from "@/hooks/useTransactions";
import { formatDateTime, formatIdr, statusBadgeVariant } from "@/utils/format";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";

const voucherSchema = z.object({
  code: z.string().min(1, "Code is required"),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.coerce.number().min(1),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});
type VoucherInput = z.input<typeof voucherSchema>;
type VoucherOutput = z.output<typeof voucherSchema>;

export function OrganizerEventManagePage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { data: events } = useMyEventsQuery();
  const event = events?.find((e) => e.id === eventId) ?? null;
  const { data: transactions } = useEventTransactionsQuery(eventId);
  const createVoucher = useCreateVoucherMutation(eventId ?? "");
  const decideTransaction = useDecideTransactionMutation(eventId);
  const deleteEvent = useDeleteEventMutation();

  const [error, setError] = useState<string | null>(null);
  const [pendingDecision, setPendingDecision] = useState<{ id: string; decision: "ACCEPT" | "REJECT" } | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VoucherInput, unknown, VoucherOutput>({
    resolver: zodResolver(voucherSchema),
    defaultValues: { discountType: "PERCENTAGE", discountValue: 10 },
  });

  if (!event) return <p className="p-6 text-muted-foreground">Loading&hellip;</p>;

  const list = transactions ?? [];
  const stats = {
    waitingPayment: list.filter((t) => t.status === "WAITING_FOR_PAYMENT").length,
    waitingConfirmation: list.filter((t) => t.status === "WAITING_FOR_ADMIN_CONFIRMATION").length,
    done: list.filter((t) => t.status === "DONE").length,
    revenue: list.filter((t) => t.status === "DONE").reduce((sum, t) => sum + t.totalIdr, 0),
  };
  const attendees = list.filter((t) => t.status === "DONE");

  async function submitVoucher(values: VoucherOutput) {
    setError(null);
    try {
      await createVoucher.mutateAsync({
        code: values.code,
        discountType: values.discountType,
        discountValue: values.discountValue,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
      });
      reset({ code: "", discountType: values.discountType, discountValue: values.discountValue, startDate: "", endDate: "" });
      toast.success("Voucher created.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create voucher");
    }
  }

  async function confirmDecision() {
    if (!pendingDecision) return;
    try {
      await decideTransaction.mutateAsync({ transactionId: pendingDecision.id, decision: pendingDecision.decision });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update transaction");
    } finally {
      setPendingDecision(null);
    }
  }

  async function confirmDeleteEvent() {
    if (!event) return;
    try {
      await deleteEvent.mutateAsync(event.id);
      toast.success("Event deleted.");
      navigate("/organizer/events");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete event");
    } finally {
      setConfirmDeleteOpen(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{event.name}</h1>
        <Button variant="destructive" size="sm" onClick={() => setConfirmDeleteOpen(true)}>
          <Trash2 className="h-4 w-4" /> Delete event
        </Button>
      </div>
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Waiting for payment: {stats.waitingPayment}</p>
          <p>Waiting for your confirmation: {stats.waitingConfirmation}</p>
          <p>Completed: {stats.done}</p>
          <p className="mt-1 font-bold">Revenue: {formatIdr(stats.revenue)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create a voucher</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(submitVoucher)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex flex-1 flex-col gap-1">
                <Label htmlFor="vCode">Code</Label>
                <Input id="vCode" {...register("code")} />
                {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <Label htmlFor="vType">Type</Label>
                <Select value={watch("discountType")} onValueChange={(v) => setValue("discountType", v as "PERCENTAGE" | "FIXED")}>
                  <SelectTrigger id="vType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FIXED">Fixed (IDR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <Label htmlFor="vValue">Value</Label>
                <Input id="vValue" type="number" min={1} {...register("discountValue")} />
              </div>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex flex-1 flex-col gap-1">
                <Label htmlFor="vStart">Starts</Label>
                <Input id="vStart" type="datetime-local" {...register("startDate")} />
                {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <Label htmlFor="vEnd">Ends</Label>
                <Input id="vEnd" type="datetime-local" {...register("endDate")} />
                {errors.endDate && <p className="text-sm text-destructive">{errors.endDate.message}</p>}
              </div>
            </div>
            <Button type="submit" className="self-start" disabled={createVoucher.isPending}>
              Create voucher
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 pr-2">Attendee</th>
                  <th className="py-2 pr-2">Status</th>
                  <th className="py-2 pr-2">Total</th>
                  <th className="py-2 pr-2">Proof</th>
                  <th className="py-2 pr-2" />
                </tr>
              </thead>
              <tbody>
                {list.map((t) => (
                  <tr key={t.id} className="border-b border-border/60 last:border-0">
                    <td className="py-2 pr-2">{t.user?.name}</td>
                    <td className="py-2 pr-2">
                      <Badge variant={statusBadgeVariant(t.status)}>{t.status.replaceAll("_", " ")}</Badge>
                    </td>
                    <td className="py-2 pr-2">{formatIdr(t.totalIdr)}</td>
                    <td className="py-2 pr-2">
                      {t.paymentProofUrl ? (
                        <a href={t.paymentProofUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                          View
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2 pr-2">
                      {t.status === "WAITING_FOR_ADMIN_CONFIRMATION" && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => setPendingDecision({ id: t.id, decision: "ACCEPT" })}>
                            Accept
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => setPendingDecision({ id: t.id, decision: "REJECT" })}>
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendees ({attendees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 pr-2">Name</th>
                  <th className="py-2 pr-2">Tickets</th>
                  <th className="py-2 pr-2">Total paid</th>
                  <th className="py-2 pr-2">Purchased</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((t) => (
                  <tr key={t.id} className="border-b border-border/60 last:border-0">
                    <td className="py-2 pr-2">{t.user?.name}</td>
                    <td className="py-2 pr-2">{t.items.reduce((s, i) => s + i.quantity, 0)}</td>
                    <td className="py-2 pr-2">{formatIdr(t.totalIdr)}</td>
                    <td className="py-2 pr-2">{formatDateTime(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={pendingDecision !== null}
        title={pendingDecision?.decision === "ACCEPT" ? "Accept this payment?" : "Reject this payment?"}
        description={
          pendingDecision?.decision === "ACCEPT"
            ? "The attendee will be marked as attending and their order becomes final."
            : "The attendee's seats, voucher use, and points will be restored, and they'll be notified by email."
        }
        confirmLabel={pendingDecision?.decision === "ACCEPT" ? "Accept" : "Reject"}
        destructive={pendingDecision?.decision === "REJECT"}
        onConfirm={confirmDecision}
        onCancel={() => setPendingDecision(null)}
      />

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete this event?"
        description="This can't be undone."
        confirmLabel="Delete event"
        destructive
        onConfirm={confirmDeleteEvent}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}
