import { FormEvent, useState } from "react";
import { useParams } from "react-router";
import { useCancelTransactionMutation, useTransactionQuery, useUploadProofMutation } from "@/hooks/useTransactions";
import { formatIdr } from "@/utils/format";
import { Countdown } from "@/components/Countdown";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { statusBadgeVariant } from "@/utils/format";

export function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: transaction, refetch } = useTransactionQuery(id);
  const uploadProof = useUploadProofMutation(id ?? "");
  const cancelTransaction = useCancelTransactionMutation(id ?? "");

  const [proofUrl, setProofUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  if (!transaction) return <p className="p-6 text-muted-foreground">Loading order&hellip;</p>;

  async function submitProof(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await uploadProof.mutateAsync({ file: file ?? undefined, url: proofUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload proof");
    }
  }

  async function doCancel() {
    try {
      await cancelTransaction.mutateAsync();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel order");
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold">Order details</h1>
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <Card>
        <CardContent className="pt-5">
          <h3 className="mb-2 text-lg font-bold">{transaction.event.name}</h3>
          <p className="mb-2">
            <Badge variant={statusBadgeVariant(transaction.status)}>{transaction.status.replaceAll("_", " ")}</Badge>
          </p>
          <p>Subtotal: {formatIdr(transaction.subtotalIdr)}</p>
          {transaction.voucherDiscIdr > 0 && <p>Voucher discount: -{formatIdr(transaction.voucherDiscIdr)}</p>}
          {transaction.couponDiscIdr > 0 && <p>Coupon discount: -{formatIdr(transaction.couponDiscIdr)}</p>}
          {transaction.pointsUsedIdr > 0 && <p>Points used: -{formatIdr(transaction.pointsUsedIdr)}</p>}
          <p className="mt-1 font-bold">Total: {formatIdr(transaction.totalIdr)}</p>
        </CardContent>
      </Card>

      {transaction.status === "WAITING_FOR_PAYMENT" && (
        <Card>
          <CardContent className="pt-5">
            <h3 className="mb-3 text-lg font-bold">
              Upload payment proof &mdash; time left: <Countdown dueAt={transaction.paymentDueAt} onExpire={() => refetch()} />
            </h3>
            <form onSubmit={submitProof} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor="proofFile">Upload a screenshot/receipt</Label>
                <input
                  id="proofFile"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="text-sm"
                />
              </div>
              <p className="text-sm text-muted-foreground">— or —</p>
              <div className="flex flex-col gap-1">
                <Label htmlFor="proofUrl">Paste a proof URL</Label>
                <Input id="proofUrl" value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} placeholder="https://..." />
              </div>
              <Button type="submit" disabled={uploadProof.isPending}>
                Submit payment proof
              </Button>
            </form>
            <Button variant="outline" className="mt-3" onClick={() => setConfirmCancelOpen(true)}>
              Cancel order
            </Button>
          </CardContent>
        </Card>
      )}

      {transaction.status === "WAITING_FOR_ADMIN_CONFIRMATION" && (
        <Card>
          <CardContent className="pt-5">
            <p>Waiting for the host to confirm your payment (within 3 days).</p>
            {transaction.paymentProofUrl && (
              <a href={transaction.paymentProofUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                View uploaded proof
              </a>
            )}
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={confirmCancelOpen}
        title="Cancel this order?"
        description="Your seat(s), voucher use, and any points spent will be restored."
        confirmLabel="Cancel order"
        destructive
        onConfirm={() => {
          setConfirmCancelOpen(false);
          doCancel();
        }}
        onCancel={() => setConfirmCancelOpen(false)}
      />
    </div>
  );
}
