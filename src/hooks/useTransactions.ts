import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelTransaction,
  createTransaction,
  CreateTransactionInput,
  decideTransaction,
  getPointsBalance,
  getTransaction,
  listEventTransactions,
  listMyTransactions,
  uploadPaymentProofFile,
  uploadPaymentProofUrl,
} from "@/api/transactions";

export const transactionKeys = {
  all: ["transactions"] as const,
  detail: (id: string) => [...transactionKeys.all, "detail", id] as const,
  mine: () => [...transactionKeys.all, "mine"] as const,
  forEvent: (eventId: string) => [...transactionKeys.all, "event", eventId] as const,
  pointsBalance: () => [...transactionKeys.all, "points-balance"] as const,
};

export function useTransactionQuery(id: string | undefined) {
  return useQuery({
    queryKey: transactionKeys.detail(id ?? ""),
    queryFn: () => getTransaction(id as string),
    enabled: Boolean(id),
  });
}

export function useMyTransactionsQuery() {
  return useQuery({ queryKey: transactionKeys.mine(), queryFn: listMyTransactions });
}

export function useEventTransactionsQuery(eventId: string | undefined) {
  return useQuery({
    queryKey: transactionKeys.forEvent(eventId ?? ""),
    queryFn: () => listEventTransactions(eventId as string),
    enabled: Boolean(eventId),
  });
}

export function usePointsBalanceQuery(enabled: boolean) {
  return useQuery({ queryKey: transactionKeys.pointsBalance(), queryFn: getPointsBalance, enabled });
}

export function useCreateTransactionMutation() {
  return useMutation({ mutationFn: (input: CreateTransactionInput) => createTransaction(input) });
}

export function useUploadProofMutation(transactionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { file?: File; url?: string }) =>
      payload.file ? uploadPaymentProofFile(transactionId, payload.file) : uploadPaymentProofUrl(transactionId, payload.url ?? ""),
    onSuccess: (data) => {
      queryClient.setQueryData(transactionKeys.detail(transactionId), data);
    },
  });
}

export function useCancelTransactionMutation(transactionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cancelTransaction(transactionId),
    onSuccess: (data) => {
      queryClient.setQueryData(transactionKeys.detail(transactionId), data);
    },
  });
}

export function useDecideTransactionMutation(eventId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ transactionId, decision }: { transactionId: string; decision: "ACCEPT" | "REJECT" }) =>
      decideTransaction(transactionId, decision),
    onSuccess: () => {
      if (eventId) queryClient.invalidateQueries({ queryKey: transactionKeys.forEvent(eventId) });
    },
  });
}
