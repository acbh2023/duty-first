import { useState, useEffect } from "react";

/**
 * Custom hook for persisting state to localStorage
 * Handles two-phase loading/saving to avoid hydration issues
 */
export const useLocalStorage = <T,>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] => {
  // Initialize state with a placeholder. We don't read from localStorage yet.
  const [value, setValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // PHASE 1: LOAD
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        setValue(parsed);
      }
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
    } finally {
      setIsLoaded(true); // Only allow saving AFTER we've successfully checked for old data
    }
  }, [key]);

  // PHASE 2: SAVE
  useEffect(() => {
    if (!isLoaded) return; // GUARD: Never save until loading is finished

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  }, [key, value, isLoaded]);

  const setValueWrapper = (newValue: T | ((prev: T) => T)) => {
    setValue(newValue);
  };

  return [value, setValueWrapper];
};
