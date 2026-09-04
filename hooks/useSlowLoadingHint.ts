import { useEffect, useState } from "react";

/**
 * Returns true once `loading` has been true for longer than `delayMs`.
 * Used to show a "still loading? check your connection" hint instead of
 * spinning forever with no explanation when a Convex query never resolves
 * (e.g. `npx convex dev` isn't running, or EXPO_PUBLIC_CONVEX_URL points
 * at the wrong deployment).
 */
export function useSlowLoadingHint(loading: boolean, delayMs = 6000) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!loading) {
      setSlow(false);
      return;
    }
    const timer = setTimeout(() => setSlow(true), delayMs);
    return () => clearTimeout(timer);
  }, [loading, delayMs]);

  return slow;
}
