import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 * Delays updating a value until after a specified delay period has elapsed since the last change.
 * Prevents unnecessary re-computations or request flooding on rapid keystrokes.
 */
export const useDebounce = (value, delayMs = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
};
