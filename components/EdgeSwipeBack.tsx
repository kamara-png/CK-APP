import { useRouter } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

const EDGE_ZONE_WIDTH = 24;
const BACK_THRESHOLD = 70;

/**
 * iOS gets a real native interactive swipe-back gesture for free from
 * react-native-screens (see `fullScreenGestureEnabled` in the root Stack).
 * Android's equivalent support is much less consistent across RN/Expo
 * versions, so this renders a small transparent strip along the left edge
 * that reliably triggers `router.back()` there instead. It's a no-op on iOS
 * so it never fights the native gesture.
 */
export default function EdgeSwipeBack() {
  const router = useRouter();

  const pan = Gesture.Pan()
    .enabled(Platform.OS === "android")
    .activeOffsetX(12)
    .failOffsetY([-20, 20])
    .onEnd((event) => {
      "worklet";
      if (event.translationX > BACK_THRESHOLD || event.velocityX > 700) {
        runOnJS(router.back)();
      }
    });

  if (Platform.OS !== "android") return null;

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.edgeZone} pointerEvents="box-only" />
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  edgeZone: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: EDGE_ZONE_WIDTH,
    zIndex: 10,
  },
});
