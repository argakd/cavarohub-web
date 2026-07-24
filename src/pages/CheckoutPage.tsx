import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { useEventQuery } from "@/hooks/useEvents";
import { useCreateTransactionMutation, usePointsBalanceQuery } from "@/hooks/useTransactions";
import { formatIdr } from "@/utils/format";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type LocationState = { ticketTypeId?: string; quantity?: number };

export function CheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { ticketTypeId, quantity: initialQuantity } = (state as LocationState) ?? {};

  const { data: event } = useEventQuery(slug);
  const { data: pointsBalance } = usePointsBalanceQuery(true);
  const createTransaction = useCreateTransactionMutation();

  const [quantity] = useState(initialQuantity ?? 1);
  const [voucherCode, setVoucherCode] = useState("");
  const [pointsToUse, setPointsToUse] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!event) return <p className="p-6 text-muted-foreground">Loading checkout&hellip;</p>;

  const balance = pointsBalance?.balanceIdr ?? 0;
  const ticketType = event.ticketTypes.find((t) => t.id === ticketTypeId);
  const unitPrice = ticketType ? ticketType.priceIdr : event.isPaid ? event.basePriceIdr : 0;
  const subtotal = unitPrice * quantity;

  async function submit() {
    setError(null);
    try {
      const transaction = await createTransaction.mutateAsync({
        eventId: event!.id,
        items: [{ ticketTypeId: ticketType?.id, quantity }],
        voucherCode: voucherCode || undefined,
        pointsToUseIdr: pointsToUse,
      });
      navigate(`/transactions/${transaction.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create transaction");
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <h3 className="text-lg font-semibold text-foreground/80">{event.name}</h3>
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <Card>
        <CardContent className="flex items-center justify-between pt-5">
          <span>
            {ticketType?.name ?? "Ticket"} &times; {quantity}
          </span>
          <span>{formatIdr(subtotal)}</span>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-1">
        <Label htmlFor="voucherCode">Voucher code (optional)</Label>
        <Input id="voucherCode" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="points">Use points (balance: {formatIdr(balance)})</Label>
        <Input
          id="points"
          type="number"
          min={0}
          max={balance}
          value={pointsToUse}
          onChange={(e) => setPointsToUse(Math.min(balance, Math.max(0, Number(e.target.value))))}
        />
      </div>

      <p className="text-sm text-muted-foreground">
        Final total (after voucher/points) is calculated at checkout. Once you confirm, you'll have{" "}
        <strong>2 hours</strong> to upload payment proof.
      </p>

      <Button disabled={createTransaction.isPending} onClick={() => setConfirmOpen(true)}>
        Confirm order
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirm this order?"
        description={`You're purchasing ${quantity} × ${ticketType?.name ?? "ticket"} for ${event.name}. This reserves your seat(s) immediately.`}
        confirmLabel="Place order"
        onConfirm={() => {
          setConfirmOpen(false);
          submit();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
