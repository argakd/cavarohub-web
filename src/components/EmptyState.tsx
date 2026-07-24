type Props = { title: string; description?: string };

export function EmptyState({ title, description }: Props) {
  return (
    <div className="rounded-xl border border-dashed border-border px-4 py-12 text-center" role="status">
      <p className="text-lg font-semibold text-foreground">{title}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
