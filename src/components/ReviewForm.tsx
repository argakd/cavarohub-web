import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useMyTransactionsQuery } from "@/hooks/useTransactions";
import { useCreateReviewMutation } from "@/hooks/useReviews";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const reviewSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().optional(),
});

type ReviewFormInput = z.input<typeof reviewSchema>;
type ReviewFormOutput = z.output<typeof reviewSchema>;

export function ReviewForm({ eventId }: { eventId: string }) {
  const { data: transactions } = useMyTransactionsQuery();
  const createReview = useCreateReviewMutation();

  const eligibleTransaction = useMemo(() => {
    if (!transactions) return null;
    const now = new Date();
    return (
      transactions.find(
        (t) => t.event.id === eventId && t.status === "DONE" && new Date(t.event.endDate) < now && !t.review,
      ) ?? null
    );
  }, [transactions, eventId]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewFormInput, unknown, ReviewFormOutput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, comment: "" },
  });

  if (!eligibleTransaction || createReview.isSuccess) return null;

  async function onSubmit(values: ReviewFormOutput) {
    try {
      await createReview.mutateAsync({
        transactionId: eligibleTransaction!.id,
        rating: values.rating,
        comment: values.comment || undefined,
      });
      toast.success("Thanks for your review!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review");
    }
  }

  return (
    <form className="mt-4 flex flex-col gap-3 border-t border-border pt-4" onSubmit={handleSubmit(onSubmit)}>
      <h4 className="font-bold">Leave a review</h4>
      <div className="flex flex-col gap-1">
        <Label htmlFor="rating">Rating</Label>
        <select
          id="rating"
          className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          {...register("rating")}
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {"★".repeat(n)} ({n})
            </option>
          ))}
        </select>
        {errors.rating && <p className="text-sm text-destructive">{errors.rating.message}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="comment">Comment (optional)</Label>
        <Textarea id="comment" rows={3} {...register("comment")} />
      </div>
      <Button type="submit" className="self-start" disabled={createReview.isPending}>
        {createReview.isPending ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
