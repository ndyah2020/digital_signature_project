// src/hooks/useMutation.ts
import { useState, useCallback } from 'react';

// TMutationFn là hàm async nhận vào biến và trả về dữ liệu
type TMutationFn<TData, TVariables> = (variables: TVariables) => Promise<TData>;

interface UseMutationOptions<TData> {
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
}

export function useMutation<TData = unknown, TVariables = unknown>(
    mutationFn: TMutationFn<TData, TVariables>,
    options?: UseMutationOptions<TData>
) {
  const [data, setData] = useState<TData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (variables: TVariables) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await mutationFn(variables);
      setData(result);
      options?.onSuccess?.(result); // Gọi callback khi thành công
      return result;
    } catch (err) {
      setError(err as Error);
      options?.onError?.(err as Error); // Gọi callback khi có lỗi
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn, options]);

  return { mutate, data, isLoading, error };
}