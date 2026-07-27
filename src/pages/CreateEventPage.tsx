import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router";
import { useCreateEventMutation } from "@/hooks/useEvents";
import { ApiError } from "@/api/client";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

const ticketTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  priceIdr: z.coerce.number().min(0),
  totalSeats: z.coerce.number().min(1),
});

const createEventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  categoryName: z.string().min(1, "Category is required"),
  bannerImageUrl: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isPaid: z.boolean(),
  basePriceIdr: z.coerce.number().min(0),
  totalSeats: z.coerce.number().min(1),
  ticketTypes: z.array(ticketTypeSchema),
});

type CreateEventInput = z.input<typeof createEventSchema>;
type CreateEventOutput = z.output<typeof createEventSchema>;

function describeCreateEventError(err: unknown): string {
  if (err instanceof ApiError && err.details) {
    const details = err.details as { fieldErrors?: Record<string, string[]> };
    const firstEntry = Object.entries(details.fieldErrors ?? {}).find(([, msgs]) => msgs?.length);
    if (firstEntry) {
      const [field, msgs] = firstEntry;
      return `${field}: ${msgs[0]}`;
    }
  }
  if (err instanceof Error) return err.message;
  return "Failed to create event";
}

export function CreateEventPage() {
  const navigate = useNavigate();
  const createEvent = useCreateEventMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CreateEventInput, unknown, CreateEventOutput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      isPaid: true,
      basePriceIdr: 0,
      totalSeats: 50,
      ticketTypes: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "ticketTypes" });
  const isPaid = watch("isPaid");
  const ticketTypes = watch("ticketTypes");
  const usesTicketTypes = ticketTypes.length > 0;
  const seatsFromTicketTypes = ticketTypes.reduce((sum, t) => sum + (Number(t.totalSeats) || 0), 0);

  async function onConfirm(values: CreateEventOutput) {
    setError(null);
    try {
      const event = await createEvent.mutateAsync({
        name: values.name,
        description: values.description,
        location: values.location,
        categoryName: values.categoryName,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
        isPaid: values.isPaid,
        basePriceIdr: values.isPaid ? values.basePriceIdr : 0,
        totalSeats: usesTicketTypes ? seatsFromTicketTypes : values.totalSeats,
        bannerImageUrl: values.bannerImageUrl?.trim() ? values.bannerImageUrl.trim() : undefined,
        ticketTypes: usesTicketTypes ? values.ticketTypes : undefined,
      });
      navigate(`/events/${event.slug}`);
    } catch (err) {
      setError(describeCreateEventError(err));
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create an event</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-3 text-sm font-medium text-destructive">{error}</p>}

          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setConfirmOpen(true);
            }}
          >
            <div className="flex flex-col gap-1">
              <Label htmlFor="name">Event name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={4} {...register("description")} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex flex-1 flex-col gap-1">
                <Label htmlFor="location">Location</Label>
                <Input id="location" {...register("location")} />
                {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <Label htmlFor="category">Category</Label>
                <Input id="category" placeholder="e.g. Music, Technology" {...register("categoryName")} />
                {errors.categoryName && <p className="text-sm text-destructive">{errors.categoryName.message}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="bannerImageUrl">Image URL (optional)</Label>
              <Input id="bannerImageUrl" type="url" placeholder="https://..." {...register("bannerImageUrl")} />
              <p className="text-xs text-muted-foreground">
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex flex-1 flex-col gap-1">
                <Label htmlFor="startDate">Start date &amp; time</Label>
                <Input id="startDate" type="datetime-local" {...register("startDate")} />
                {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <Label htmlFor="endDate">End date &amp; time</Label>
                <Input id="endDate" type="datetime-local" {...register("endDate")} />
                {errors.endDate && <p className="text-sm text-destructive">{errors.endDate.message}</p>}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("isPaid")} /> Paid event
            </label>

            {isPaid && !usesTicketTypes && (
              <div className="flex flex-col gap-1">
                <Label htmlFor="basePrice">Ticket price (IDR)</Label>
                <Input id="basePrice" type="number" min={0} {...register("basePriceIdr")} />
              </div>
            )}

            {!usesTicketTypes && (
              <div className="flex flex-col gap-1">
                <Label htmlFor="totalSeats">Total seats</Label>
                <Input id="totalSeats" type="number" min={1} {...register("totalSeats")} />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-foreground/80">
                Ticket types (optional)
              </span>
              {fields.map((field, i) => (
                <div key={field.id} className="flex items-end gap-2">
                  <div className="flex flex-1 flex-col gap-1">
                    <Label htmlFor={`tt-name-${i}`} className="text-xs font-normal text-muted-foreground">
                      Name
                    </Label>
                    <Input id={`tt-name-${i}`} {...register(`ticketTypes.${i}.name` as const)} />
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <Label htmlFor={`tt-price-${i}`} className="text-xs font-normal text-muted-foreground">
                      Price (IDR)
                    </Label>
                    <Input id={`tt-price-${i}`} type="number" min={0} {...register(`ticketTypes.${i}.priceIdr` as const)} />
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <Label htmlFor={`tt-seats-${i}`} className="text-xs font-normal text-muted-foreground">
                      Seats
                    </Label>
                    <Input id={`tt-seats-${i}`} type="number" min={1} {...register(`ticketTypes.${i}.totalSeats` as const)} />
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => remove(i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() => append({ name: "", priceIdr: 0, totalSeats: 10 })}
              >
                <Plus className="h-4 w-4" /> Add ticket type
              </Button>
            </div>

            <Button type="submit" disabled={createEvent.isPending}>
              Create event
            </Button>
          </form>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title="Publish this event?"
        description="You can still edit most details afterwards."
        confirmLabel="Confirm"
        onConfirm={handleSubmit((values) => {
          setConfirmOpen(false);
          onConfirm(values);
        })}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
