import { api } from "./client";

export type StatsBucket = { period: string; revenueIdr: number; transactionCount: number };

export type DashboardStats = {
  totals: { events: number; transactions: number; revenueIdr: number; attendees: number };
  byDay: StatsBucket[];
  byMonth: StatsBucket[];
  byYear: StatsBucket[];
};

export async function getDashboardStats() {
  const { data } = await api.get<DashboardStats>("/api/dashboard/stats");
  return data;
}
