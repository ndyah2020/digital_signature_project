import { useState } from "react";

/**
 * Hook quản lý object query (filter/search params)
 * @template T Kiểu dữ liệu của query object
 */

const useQuery = <T extends Record<string, any>>(initial: T) => {
    const [query, setQuery] = useState<T>(initial);

    const updateQuery = (newQuery: Partial<T>) => {
        setQuery((prev) => ({
            ...prev,
            ...newQuery,
        }));
    };

    const resetQuery = () => {
        setQuery(initial);
    };

    return { query, updateQuery, resetQuery };
};

export default useQuery;
