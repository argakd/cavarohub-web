import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEvent,
  createVoucher,
  CreateEventInput,
  CreateVoucherInput,
  deleteEvent,
  getEventBySlug,
  listCategories,
  listEvents,
  listMyEvents,
  ListEventsParams,
} from "@/api/events";

export const eventKeys = {
  all: ["events"] as const,
  list: (params: ListEventsParams) => [...eventKeys.all, "list", params] as const,
  detail: (slug: string) => [...eventKeys.all, "detail", slug] as const,
  mine: () => [...eventKeys.all, "mine"] as const,
  categories: () => [...eventKeys.all, "categories"] as const,
};

export function useEventsQuery(params: ListEventsParams) {
  return useQuery({ queryKey: eventKeys.list(params), queryFn: () => listEvents(params) });
}

export function useEventQuery(slug: string | undefined) {
  return useQuery({
    queryKey: eventKeys.detail(slug ?? ""),
    queryFn: () => getEventBySlug(slug as string),
    enabled: Boolean(slug),
  });
}

export function useCategoriesQuery() {
  return useQuery({ queryKey: eventKeys.categories(), queryFn: listCategories });
}

export function useMyEventsQuery() {
  return useQuery({ queryKey: eventKeys.mine(), queryFn: listMyEvents });
}

export function useCreateEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEventInput) => createEvent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.mine() });
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

export function useDeleteEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.mine() });
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

export function useCreateVoucherMutation(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateVoucherInput) => createVoucher(eventId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.mine() });
    },
  });
}
