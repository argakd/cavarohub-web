import { api } from "./client";
import { Transaction } from "@/types";

export type CreateTransactionInput = {
  eventId: string;
  items: { ticketTypeId?: string; quantity: number }[];
  voucherCode?: string;
  pointsToUseIdr?: number;
};

export async function createTransaction(input: CreateTransactionInput) {
  const { data } = await api.post<Transaction>("/api/transactions", input);
  return data;
}

export async function getTransaction(id: string) {
  const { data } = await api.get<Transaction>(`/api/transactions/${id}`);
  return data;
}

export async function listMyTransactions() {
  const { data } = await api.get<Transaction[]>("/api/transactions/mine");
  return data;
}

export async function listEventTransactions(eventId: string) {
  const { data } = await api.get<Transaction[]>(`/api/transactions/event/${eventId}`);
  return data;
}

export async function uploadPaymentProofUrl(transactionId: string, paymentProofUrl: string) {
  const { data } = await api.post<Transaction>(`/api/transactions/${transactionId}/payment-proof`, {
    paymentProofUrl,
  });
  return data;
}

export async function uploadPaymentProofFile(transactionId: string, file: File) {
  const formData = new FormData();
  formData.append("proof", file);
  const { data } = await api.post<Transaction>(`/api/transactions/${transactionId}/payment-proof`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function decideTransaction(transactionId: string, decision: "ACCEPT" | "REJECT") {
  const { data } = await api.post<Transaction>(`/api/transactions/${transactionId}/decision`, { decision });
  return data;
}

export async function cancelTransaction(transactionId: string) {
  const { data } = await api.post<Transaction>(`/api/transactions/${transactionId}/cancel`);
  return data;
}

export async function getPointsBalance() {
  const { data } = await api.get<{ balanceIdr: number }>("/api/transactions/points-balance");
  return data;
}
