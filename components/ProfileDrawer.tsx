import { ColorScheme } from "@/hooks/useTheme";
import { useEffect } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from "react-native-reanimated";

const SCREEN_WIDTH = Dimensions.get("window").width;
const DRAWER_WIDTH = Math.min(320, SCREEN_WIDTH * 0.82);

interface ProfileDrawerProps {
  visible: boolean;
  colors: ColorScheme;
  onClose: () => void;
  children: React.ReactNode;
}

export default function ProfileDrawer({ visible, colors, onClose, children }: ProfileDrawerProps) {
  const translateX = useSharedValue(-DRAWER_WIDTH);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateX.value = withSpring(0, { damping: 22, stiffness: 220, mass: 0.8 });
      backdropOpacity.value = withSpring(1, { damping: 22, stiffness: 220, mass: 0.8 });
    } else {
      translateX.value = withSpring(-DRAWER_WIDTH, { damping: 24, stiffness: 220, mass: 0.8 });
      backdropOpacity.value = withSpring(0, { damping: 24, stiffness: 220, mass: 0.8 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- shared values are stable refs
  }, [visible]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const drawerPan = Gesture.Pan()
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
        translateX.value = withSpring(-DRAWER_WIDTH, { damping: 24, stiffness: 220 });
        backdropOpacity.value = withSpring(0, { damping: 24, stiffness: 220 });
        runOnJS(onClose)();
      } else {
        translateX.value = withSpring(0, { damping: 22, stiffness: 220 });
        backdropOpacity.value = withSpring(1, { damping: 22, stiffness: 220 });
      }
    });


  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? "auto" : "box-none"}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <GestureDetector gesture={drawerPan}>
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
    backgroundColor: "rgba(0,0,0,0.5)",
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
