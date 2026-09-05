import { useEffect } from "react";
import { useRouter } from "expo-router";

// This tab's icon is intercepted in app/(tabs)/_layout.tsx and opens
// /profile as an overlay instead. This screen only exists so the route is
// registered; if it's ever reached directly, send the person to /profile.
export default function SettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile");
  }, [router]);

  return null;
}
