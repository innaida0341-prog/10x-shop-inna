import { isApiError } from '../api/ApiError';

export function isAbortError(e: unknown): boolean {
  return e instanceof DOMException && e.name === 'AbortError';
}

export function getErrorMessage(e: unknown, fallback: string): string {
  if (isApiError(e)) return `${fallback} (error ${e.status})`;
  return fallback;
}
