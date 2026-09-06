import { useFocusEffect, useRouter } from "expo-router";
import { ReactNode, useCallback } from "react";
import { Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

const TAB_ORDER = ["/", "/streaks", "/statistics"] as const;
const SCREEN_WIDTH = Dimensions.get("window").width;
let lastFocusedIndex = 0;

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
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useFocusEffect(
    useCallback(() => {
      const direction = currentIndex >= lastFocusedIndex ? 1 : -1;
      lastFocusedIndex = currentIndex;
      translateX.value = direction * SCREEN_WIDTH * 0.12;
      opacity.value = 0.82;
      scale.value = 0.985;
      translateX.value = withSpring(0, { damping: 20, stiffness: 180, mass: 0.8 });
      opacity.value = withSpring(1, { damping: 20, stiffness: 180, mass: 0.8 });
      scale.value = withSpring(1, { damping: 20, stiffness: 180, mass: 0.8 });
    }, [currentIndex, opacity, scale, translateX])
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
  }));

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
      <Animated.View
        style={[{ flex: 1 }, animatedStyle]}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
