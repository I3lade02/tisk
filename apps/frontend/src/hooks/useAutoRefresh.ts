import { useEffect, useRef } from "react";

export function useAutoRefresh(callback: () => void | Promise<void>, intervalMs: number) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const id = window.setInterval(() => {
      void callbackRef.current();
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [intervalMs]);
}
