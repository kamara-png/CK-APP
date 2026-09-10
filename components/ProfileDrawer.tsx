import { ColorScheme } from "@/hooks/useTheme";
import { BlurView } from "expo-blur";
import { useEffect } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from "react-native-reanimated";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const SCREEN_WIDTH = Dimensions.get("window").width;
const DRAWER_WIDTH = Math.min(360, SCREEN_WIDTH * 0.88);
const EDGE_ZONE_WIDTH = 36;
const OPEN_SPRING = { damping: 22, stiffness: 220, mass: 0.8 };
const CLOSE_SPRING = { damping: 24, stiffness: 220, mass: 0.8 };

interface ProfileDrawerProps {
  visible: boolean;
  colors: ColorScheme;
  onClose: () => void;
  /** Called once an edge-swipe commits to fully opening the drawer. */
  onOpen?: () => void;
  /**
   * Whether the left-edge swipe-to-open gesture should be armed at all.
   * The caller only wants this active while looking at the Todos/home tab.
   */
  edgeSwipeEnabled?: boolean;
  children: React.ReactNode;
}

export default function ProfileDrawer({
  visible,
  colors,
  onClose,
  onOpen,
  edgeSwipeEnabled = false,
  children,
}: ProfileDrawerProps) {
  const translateX = useSharedValue(-DRAWER_WIDTH);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateX.value = withSpring(0, OPEN_SPRING);
      backdropOpacity.value = withSpring(1, OPEN_SPRING);
    } else {
      translateX.value = withSpring(-DRAWER_WIDTH, CLOSE_SPRING);
      backdropOpacity.value = withSpring(0, CLOSE_SPRING);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- shared values are stable refs
  }, [visible]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  // Drags the already-open panel — either flicking it closed, or letting go
  // partway and snapping back open.
  const closePan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-18, 18])
    .onUpdate((event) => {
      "worklet";
      const nextX = event.translationX;
      translateX.value = Math.min(0, Math.max(-DRAWER_WIDTH, nextX));
      backdropOpacity.value = Math.max(0, Math.min(1, 1 + nextX / DRAWER_WIDTH));
    })
    .onEnd((event) => {
      "worklet";
      if (event.translationX < -DRAWER_WIDTH * 0.3 || event.velocityX < -500) {
        translateX.value = withSpring(-DRAWER_WIDTH, CLOSE_SPRING);
        backdropOpacity.value = withSpring(0, CLOSE_SPRING);
        runOnJS(onClose)();
      } else {
        translateX.value = withSpring(0, OPEN_SPRING);
        backdropOpacity.value = withSpring(1, OPEN_SPRING);
      }
    });

  // A thin strip at the very left edge of the screen. Dragging right from
  // here reveals the drawer 1:1 with the finger, Instagram-DM-style, rather
  // than just detecting a swipe and playing a canned open animation.
  const edgePan = Gesture.Pan()
    .enabled(edgeSwipeEnabled && !visible)
    .activeOffsetX(15)
    .failOffsetY([-20, 20])
    .onUpdate((event) => {
      "worklet";
      const nextX = -DRAWER_WIDTH + event.translationX;
      translateX.value = Math.min(0, Math.max(-DRAWER_WIDTH, nextX));
      backdropOpacity.value = Math.max(0, Math.min(1, 1 + nextX / DRAWER_WIDTH));
    })
    .onEnd((event) => {
      "worklet";
      if (event.translationX > DRAWER_WIDTH * 0.3 || event.velocityX > 500) {
        translateX.value = withSpring(0, OPEN_SPRING);
        backdropOpacity.value = withSpring(1, OPEN_SPRING);
        if (onOpen) runOnJS(onOpen)();
      } else {
        translateX.value = withSpring(-DRAWER_WIDTH, CLOSE_SPRING);
        backdropOpacity.value = withSpring(0, CLOSE_SPRING);
      }
    });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <AnimatedBlurView
        pointerEvents={visible ? "auto" : "none"}
        intensity={50}
        tint={colors.isDark ? "dark" : "light"}
        style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </AnimatedBlurView>

      {edgeSwipeEnabled && !visible && (
        <GestureDetector gesture={edgePan}>
          <View style={styles.edgeZone} pointerEvents="box-only" />
        </GestureDetector>
      )}

      <GestureDetector gesture={closePan}>
        <Animated.View
          style={[
            styles.panel,
            { width: DRAWER_WIDTH, backgroundColor: colors.bg },
            panelStyle,
          ]}
          pointerEvents={visible ? "auto" : "none"}
        >
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  edgeZone: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: EDGE_ZONE_WIDTH,
  },
  panel: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
