import { useCallback, useEffect, useState } from 'react';
import type { AsyncState } from '../types/api';
import { getErrorMessage, isAbortError } from '../utils/errors';

/**
 * Runs `fetcher` whenever it changes (memoize it with useCallback).
 * The previous request is aborted so an old response can never overwrite a new one.
 */
export function useFetch<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  errorMessage = 'Could not load data',
): { state: AsyncState<T>; retry: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ status: 'idle' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });
    fetcher(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ status: 'success', data });
      })
      .catch((e: unknown) => {
        if (isAbortError(e) || controller.signal.aborted) return;
        setState({ status: 'error', message: getErrorMessage(e, errorMessage) });
      });
    return () => controller.abort();
  }, [fetcher, attempt, errorMessage]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { state, retry };
}
