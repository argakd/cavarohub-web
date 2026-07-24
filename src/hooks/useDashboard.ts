import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/api/dashboard";

export function useDashboardStatsQuery() {
  return useQuery({ queryKey: ["dashboard", "stats"], queryFn: getDashboardStats });
}
