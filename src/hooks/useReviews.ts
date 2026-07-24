import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createReview, getOrganizerRatingSummary } from "@/api/reviews";
import { transactionKeys } from "@/hooks/useTransactions";

export function useOrganizerRatingSummaryQuery(organizerId: string | undefined) {
  return useQuery({
    queryKey: ["reviews", "organizer-summary", organizerId],
    queryFn: () => getOrganizerRatingSummary(organizerId as string),
    enabled: Boolean(organizerId),
  });
}

export function useCreateReviewMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { transactionId: string; rating: number; comment?: string }) => createReview(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.mine() });
    },
  });
}
