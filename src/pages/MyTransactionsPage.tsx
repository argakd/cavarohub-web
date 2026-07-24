import { Link } from "react-router";
import { useMyTransactionsQuery } from "@/hooks/useTransactions";
import { formatDateTime, formatIdr, statusBadgeVariant } from "@/utils/format";
import { EmptyState } from "@/components/EmptyState";
import { Countdown } from "@/components/Countdown";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function MyTransactionsPage() {
  const { data: transactions, isLoading } = useMyTransactionsQuery();

  if (isLoading) return <p className="p-6 text-muted-foreground">Loading your tickets&hellip;</p>;

  if (!transactions || transactions.length === 0) {
    return (
      <div className="p-6">
        <EmptyState title="No tickets yet" description="Browse events and grab a ticket to see it here." />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">My tickets</h1>
      <div className="flex flex-col gap-4">
        {transactions.map((t) => (
          <Link key={t.id} to={`/transactions/${t.id}`}>
            <Card className="transition hover:shadow-md">
              <CardContent className="flex items-center justify-between pt-5">
                <div>
                  <strong>{t.event.name}</strong>
                  <p className="text-sm text-muted-foreground">Ordered {formatDateTime(t.createdAt)}</p>
                </div>
                <div className="text-right">
                  <Badge variant={statusBadgeVariant(t.status)}>{t.status.replaceAll("_", " ")}</Badge>
                  <p>{formatIdr(t.totalIdr)}</p>
                  {t.status === "WAITING_FOR_PAYMENT" && <Countdown dueAt={t.paymentDueAt} />}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
