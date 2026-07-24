export type Role = "CUSTOMER" | "ORGANIZER";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  referralCode: string;
  profilePicture: string | null;
};

export type Category = { id: string; name: string };

export type TicketType = {
  id: string;
  name: string;
  priceIdr: number;
  totalSeats: number;
  availableSeats: number;
};

export type Voucher = {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  startDate: string;
  endDate: string;
  maxUses: number | null;
  usedCount: number;
};

export type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: string; name: string };
};

export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED";

export type EventSummary = {
  id: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  category: Category;
  startDate: string;
  endDate: string;
  isPaid: boolean;
  basePriceIdr: number;
  totalSeats: number;
  availableSeats: number;
  bannerImageUrl: string | null;
  status: EventStatus;
  ticketTypes: TicketType[];
};

export type EventDetail = EventSummary & {
  organizer: { id: string; name: string; profilePicture: string | null };
  vouchers: Voucher[];
  reviews: Review[];
};

export type TransactionStatus =
  | "WAITING_FOR_PAYMENT"
  | "WAITING_FOR_ADMIN_CONFIRMATION"
  | "DONE"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELED";

export type TransactionItem = {
  id: string;
  ticketTypeId: string | null;
  quantity: number;
  unitPriceIdr: number;
};

export type Transaction = {
  id: string;
  status: TransactionStatus;
  subtotalIdr: number;
  voucherDiscIdr: number;
  couponDiscIdr: number;
  pointsUsedIdr: number;
  totalIdr: number;
  paymentProofUrl: string | null;
  paymentDueAt: string;
  decisionDueAt: string | null;
  createdAt: string;
  items: TransactionItem[];
  event: EventSummary;
  user?: { id: string; name: string; email: string };
  review?: Review | null;
};

export type PaginatedEvents = {
  items: EventSummary[];
  total: number;
  page: number;
  pageSize: number;
};
