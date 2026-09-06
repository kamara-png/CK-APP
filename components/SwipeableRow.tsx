import { useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

interface SwipeableRowProps {
  children: React.ReactNode;
  onSwipeComplete?: () => void;
  onSwipeDelete?: () => void;
  completeColor: string;
  deleteColor: string;
  leftLabel?: string;
  rightLabel?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  style?: object;
}

export default function SwipeableRow({
  children,
  onSwipeComplete,
  onSwipeDelete,
  completeColor,
  deleteColor,
  leftLabel = "Complete",
  rightLabel = "Delete",
  leftIcon = "checkmark-circle",
  rightIcon = "trash",
  style,
}: SwipeableRowProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>) => {
    if (!onSwipeComplete) return null;
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 1],
      extrapolate: "clamp",
    });
    return (
      <View style={[styles.actionContainer, { backgroundColor: completeColor }]}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name={leftIcon} size={26} color="#fff" />
        </Animated.View>
        <Text style={styles.actionLabel}>{leftLabel}</Text>
      </View>
    );
  };

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => {
    if (!onSwipeDelete) return null;
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 1],
      extrapolate: "clamp",
    });
    return (
      <View style={[styles.actionContainer, { backgroundColor: deleteColor, alignItems: "flex-end" }]}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name={rightIcon} size={24} color="#fff" />
        </Animated.View>
        <Text style={styles.actionLabel}>{rightLabel}</Text>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      containerStyle={style}
      renderLeftActions={onSwipeComplete ? renderLeftActions : undefined}
      renderRightActions={onSwipeDelete ? renderRightActions : undefined}
      leftThreshold={60}
      rightThreshold={60}
      onSwipeableOpen={(direction) => {
        if (direction === "left") onSwipeComplete?.();
        if (direction === "right") onSwipeDelete?.();
        swipeableRef.current?.close();
      }}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  actionContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 4,
  },
  actionLabel: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
});
