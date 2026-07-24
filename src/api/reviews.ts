import { api } from "./client";
import { Review } from "@/types";

export async function createReview(input: { transactionId: string; rating: number; comment?: string }) {
  const { data } = await api.post<Review>("/api/reviews", input);
  return data;
}

export type OrganizerRatingSummary = {
  averageRating: number | null;
  reviewCount: number;
  reviews: (Review & { event: { id: string; name: string } })[];
};

export async function getOrganizerRatingSummary(organizerId: string) {
  const { data } = await api.get<OrganizerRatingSummary>(`/api/reviews/organizers/${organizerId}/summary`);
  return data;
}
