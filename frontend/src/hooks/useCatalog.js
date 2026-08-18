import { useCallback, useEffect, useState } from "react";
import { BARBERSHOP_ID } from "../api/client.js";
import { catalogApi } from "../api/services.js";
export function useCatalog() {
  const [data, setData] = useState({ services: [], professionals: [] }),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const load = useCallback(async () => {
    if (!BARBERSHOP_ID) {
      setError("Configure VITE_BARBERSHOP_ID no arquivo .env do frontend.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [services, professionals] = await Promise.all([
        catalogApi.services(),
        catalogApi.professionals(),
      ]);
      setData({ services, professionals });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  return { ...data, loading, error, retry: load };
}
