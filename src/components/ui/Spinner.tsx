export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-16 text-gray-500">
      <span className="size-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
      <span>{label}</span>
    </div>
  );
}
