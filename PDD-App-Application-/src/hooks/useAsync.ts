import { useCallback, useState } from 'react';

type AsyncFn<T> = (...args: any[]) => Promise<T>;

export function useAsync<T>(fn: AsyncFn<T>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async (...args: any[]) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fn(...args);
        setData(result);
        return result;
      } catch (e: any) {
        const msg = e?.response?.data?.detail ?? e?.message ?? 'An error occurred';
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [fn]
  );

  return { execute, loading, error, data, clearError: () => setError(null) };
}
