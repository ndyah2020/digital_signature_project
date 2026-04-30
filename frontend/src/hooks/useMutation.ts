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
      if (isLoading) return Promise.reject(new Error("Đang xử lý, vui lòng chờ..."));
      setIsLoading(true);
      setError(null);
      try {
        const result = await mutationFn(variables);
        setData(result);
        options?.onSuccess?.(result, variables);
        return result;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Đã xảy ra lỗi không xác định";
        const normalizedError = new Error(message);

        setError(normalizedError);
        options?.onError?.(normalizedError, variables);

        throw normalizedError;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn, options]
  );

  const mutateAsync = useCallback(
    (variables: TVariables) => mutate(variables),
    [mutate]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { mutate, mutateAsync, data, isLoading, error, reset };
}
