export function formatIdr(amount: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    amount,
  );
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

export function eventFromPrice(event: { isPaid: boolean; basePriceIdr: number; ticketTypes: { priceIdr: number }[] }): number {
  if (!event.isPaid) return 0;
  if (event.ticketTypes.length === 0) return event.basePriceIdr;
  return Math.min(...event.ticketTypes.map((t) => t.priceIdr));
}

const statusBadgeVariants: Record<string, "warning" | "info" | "success" | "destructive"> = {
  WAITING_FOR_PAYMENT: "warning",
  WAITING_FOR_ADMIN_CONFIRMATION: "info",
  DONE: "success",
  REJECTED: "destructive",
  EXPIRED: "destructive",
  CANCELED: "destructive",
};

export function statusBadgeVariant(status: string): "warning" | "info" | "success" | "destructive" {
  return statusBadgeVariants[status] ?? "info";
}
