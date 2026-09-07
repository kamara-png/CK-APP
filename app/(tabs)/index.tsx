import ProfileContent from "@/components/ProfileContent";
import ProfileDrawer from "@/components/ProfileDrawer";
import StatisticsScreen from "@/components/screens/StatisticsScreen";
import StreaksScreen from "@/components/screens/StreaksScreen";
import TodosScreen from "@/components/screens/TodosScreen";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import PagerView from "react-native-pager-view";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const TABS = [
  { key: "todos", icon: "flash-outline" as const, activeIcon: "flash" as const },
  { key: "streaks", icon: "flame-outline" as const, activeIcon: "flame" as const },
  { key: "statistics", icon: "podium-outline" as const, activeIcon: "podium" as const },
];

// How far in from the left edge a swipe has to start to count as "open the
// drawer" rather than a normal page swipe. Mirrors iOS's own edge-swipe
// hit zone for back gestures.
const EDGE_ZONE_WIDTH = 36;
const OPEN_DRAG_THRESHOLD = 50;

export default function TabsIndex() {
  const { colors } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  // Continuous 0..(TABS.length - 1) scroll position, updated on every frame
  // of the drag — not just on settle — so the tab bar can track the finger
  // the same way Instagram's bottom bar highlight tracks its feed/reels swipe.
  const scrollPosition = useSharedValue(0);

  const handlePageScroll = useCallback(
    (event: { nativeEvent: { position: number; offset: number } }) => {
      const { position, offset } = event.nativeEvent;
      scrollPosition.value = position + offset;
    },
    [scrollPosition]
  );

  const handlePageSelected = useCallback(
    (event: { nativeEvent: { position: number } }) => {
      setActiveIndex(event.nativeEvent.position);
    },
    []
  );

  const goToPage = (index: number) => {
    pagerRef.current?.setPage(index);
  };

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // Profile access lives only on the Todos/home tab (via the hamburger, or
  // this edge swipe). Todos is always page 0, so there's no "previous page"
  // for the pager to scroll to from there anyway — the edge is free to
  // repurpose for revealing the drawer, exactly like Instagram's DMs swipe.
  const edgeSwipe = Gesture.Pan()
    .enabled(activeIndex === 0 && !drawerOpen)
    .activeOffsetX(15)
    .failOffsetY([-20, 20])
    .onEnd((event) => {
      "worklet";
      if (event.translationX > OPEN_DRAG_THRESHOLD || event.velocityX > 600) {
        runOnJS(openDrawer)();
      }
    });

  const styles = createStyles(colors);

  return (
    <View style={styles.flex}>
      <PagerView
        ref={pagerRef}
        style={styles.flex}
        initialPage={0}
        onPageScroll={handlePageScroll}
        onPageSelected={handlePageSelected}
      >
        <View key="todos" style={styles.flex}>
          <TodosScreen onMenuPress={openDrawer} />
        </View>
        <View key="streaks" style={styles.flex}>
          <StreaksScreen />
        </View>
        <View key="statistics" style={styles.flex}>
          <StatisticsScreen />
        </View>
      </PagerView>

      {activeIndex === 0 && (
        <GestureDetector gesture={edgeSwipe}>
          <View style={styles.edgeZone} pointerEvents="box-only" />
        </GestureDetector>
      )}

      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {TABS.map((tab, index) => (
          <TabBarIcon
            key={tab.key}
            index={index}
            icon={tab.icon}
            activeIcon={tab.activeIcon}
            scrollPosition={scrollPosition}
            activeColor={colors.primary}
            inactiveColor={colors.textMuted}
            onPress={() => goToPage(index)}
          />
        ))}
      </View>

      <ProfileDrawer visible={drawerOpen} colors={colors} onClose={closeDrawer}>
        <ProfileContent onClose={closeDrawer} />
      </ProfileDrawer>
    </View>
  );
}

interface TabBarIconProps {
  index: number;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  scrollPosition: ReturnType<typeof useSharedValue<number>>;
  activeColor: string;
  inactiveColor: string;
  onPress: () => void;
}

function TabBarIcon({
  index,
  icon,
  activeIcon,
  scrollPosition,
  activeColor,
  inactiveColor,
  onPress,
}: TabBarIconProps) {
  // Distance (0 = dead-center-active, 1 = one full page away) drives both a
  // scale bump and a cross-fade between the outline/filled icon,
  // continuously as the pager is dragged — this is the bit that makes the
  // bar feel alive mid-swipe instead of just snapping at the end.
  const scaleStyle = useAnimatedStyle(() => {
    const distance = Math.min(1, Math.abs(scrollPosition.value - index));
    return {
      transform: [{ scale: 1 + (1 - distance) * 0.12 }],
    };
  });

  const activeStyle = useAnimatedStyle(() => {
    const distance = Math.min(1, Math.abs(scrollPosition.value - index));
    return { opacity: 1 - distance };
  });

  const inactiveStyle = useAnimatedStyle(() => {
    const distance = Math.min(1, Math.abs(scrollPosition.value - index));
    return { opacity: distance };
  });

  return (
    <TouchableOpacity style={iconStyles.tabButton} onPress={onPress} activeOpacity={0.7}>
      <Animated.View style={scaleStyle}>
        <Animated.View style={[iconStyles.iconLayer, activeStyle]}>
          <Ionicons name={activeIcon} size={26} color={activeColor} />
        </Animated.View>
        <Animated.View style={inactiveStyle}>
          <Ionicons name={icon} size={26} color={inactiveColor} />
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const iconStyles = StyleSheet.create({
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconLayer: {
    position: "absolute",
  },
});

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    edgeZone: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 90,
      width: EDGE_ZONE_WIDTH,
    },
    tabBar: {
      flexDirection: "row",
      height: 90,
      paddingBottom: 30,
      paddingTop: 10,
      borderTopWidth: 1,
    },
  });
