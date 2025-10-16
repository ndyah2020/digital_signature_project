import { useState, useCallback } from "react";

type TMutationFn<TData, TVariables> = (variables: TVariables) => Promise<TData>;

interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables?: TVariables) => void;
}

export function useMutation<TData = unknown, TVariables = unknown>(
  mutationFn: TMutationFn<TData, TVariables>,
  options?: UseMutationOptions<TData, TVariables>
) {
  const [data, setData] = useState<TData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await mutationFn(variables);
        setData(result);
        options?.onSuccess?.(result, variables);
        return result;
      } catch (err) {
        setError(err as Error);
        options?.onError?.(err as Error, variables);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn, options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { mutate, data, isLoading, error, reset };
}
