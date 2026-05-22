// ============================================================
// useDebounce — delays value updates to throttle API requests
// REQUIRED on every search input across the entire site
// ============================================================
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set timer to update debounced value after delay
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    // Clear timer if value changes before delay fires
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
