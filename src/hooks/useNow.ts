import { useEffect, useState } from 'react';

/** Re-renders every `intervalMs` so time-derived values (order status) stay fresh. */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id); // cleanup: no leaked timer after unmount
  }, [intervalMs]);
  return now;
}
