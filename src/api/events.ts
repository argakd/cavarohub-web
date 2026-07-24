import { api } from "./client";
import { Category, EventDetail, PaginatedEvents } from "@/types";

export type ListEventsParams = {
  search?: string;
  category?: string;
  location?: string;
  page?: number;
  pageSize?: number;
};

export async function listEvents(params: ListEventsParams) {
  const { data } = await api.get<PaginatedEvents>("/api/events", { params });
  return data;
}

export async function getEventBySlug(slug: string) {
  const { data } = await api.get<EventDetail>(`/api/events/${slug}`);
  return data;
}

export async function listCategories() {
  const { data } = await api.get<Category[]>("/api/events/categories");
  return data;
}

export async function listMyEvents() {
  const { data } = await api.get<EventDetail[]>("/api/events/mine");
  return data;
}

export type CreateEventInput = {
  name: string;
  description: string;
  location: string;
  categoryName: string;
  startDate: string;
  endDate: string;
  isPaid: boolean;
  basePriceIdr: number;
  totalSeats: number;
  bannerImageUrl?: string;
  ticketTypes?: { name: string; priceIdr: number; totalSeats: number }[];
};

export async function createEvent(input: CreateEventInput) {
  const { data } = await api.post<EventDetail>("/api/events", input);
  return data;
}

export type CreateVoucherInput = {
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  startDate: string;
  endDate: string;
  maxUses?: number;
};

export async function createVoucher(eventId: string, input: CreateVoucherInput) {
  const { data } = await api.post(`/api/events/${eventId}/vouchers`, input);
  return data;
}

export async function deleteEvent(eventId: string) {
  await api.delete(`/api/events/${eventId}`);
}
