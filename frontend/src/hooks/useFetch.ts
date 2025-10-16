import { useState, useEffect, useCallback } from "react";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { api } from "../utils/api";

/**
 * Hook fetch dữ liệu (API trả về object)
 * @template T Kiểu dữ liệu của object trả về từ API
 */
const useFetch = <T extends object>(
    path: string,
    query: Record<string, any> = {},
    config: AxiosRequestConfig = {}
) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchAPI = useCallback(async () => {
        if (!path) return;

        try {
            setLoading(true);
            setError(null);

            const queryString = new URLSearchParams(query).toString();
            const url = queryString ? `${path}?${queryString}` : path;

            const res: AxiosResponse<T> = await api.get(url, config);
            setData(res.data);
        } catch (err: any) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [path, JSON.stringify(query), JSON.stringify(config)]);

    useEffect(() => {
        fetchAPI();
    }, [fetchAPI]);

    return { data, loading, error, refetch: fetchAPI };
};

export default useFetch;
