import { useState, useCallback } from "react";
import { api } from "../utils/api";

const useDownload = (path?: string, defaultFileName?: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const downloadFile = useCallback(
    async (customPath?: string, customFileName?: string) => {
      const finalPath = customPath || path;
      const fileName = customFileName || defaultFileName || "file.pdf";

      if (!finalPath) {
        console.warn("❗Không có đường dẫn tải file (path)");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await api.get(finalPath, { responseType: "blob" });

        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [path, defaultFileName]
  );

  return { downloadFile, loading, error };
};

export default useDownload;
