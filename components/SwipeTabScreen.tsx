import { ReactNode } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { runOnJS } from "react-native-reanimated";

const TAB_ORDER = ["/", "/streaks", "/statistics"] as const;

interface SwipeTabScreenProps {
  path: (typeof TAB_ORDER)[number];
  children: ReactNode;
}

/**
 * A lightweight approximation of Instagram/Spotify-style swipe-between-panels:
 * a horizontal swipe past a distance threshold switches to the next or
 * previous tab. This is a discrete "swipe triggers navigation" gesture
 * rather than a true continuously-dragged pager (that would need replacing
 * expo-router's whole tab navigator with a custom pager-backed one) — but it
 * gives the same left/right swipe-to-switch-panels feel from either edge.
 */
export default function SwipeTabScreen({ path, children }: SwipeTabScreenProps) {
  const router = useRouter();
  const currentIndex = TAB_ORDER.indexOf(path);

  const goTo = (index: number) => {
    if (index < 0 || index >= TAB_ORDER.length) return;
    router.navigate(TAB_ORDER[index]);
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-15, 15])
    .onEnd((e) => {
      "worklet";
      if (e.translationX < -60 && Math.abs(e.velocityX) > 200) {
        runOnJS(goTo)(currentIndex + 1);
      } else if (e.translationX > 60 && Math.abs(e.velocityX) > 200) {
        runOnJS(goTo)(currentIndex - 1);
      }
    });

  return (
    <GestureDetector gesture={pan}>
      <View style={{ flex: 1 }}>{children}</View>
    </GestureDetector>
  );
}
