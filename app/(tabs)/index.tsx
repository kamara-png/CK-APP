import ProfileContent from "@/components/ProfileContent";
import ProfileDrawer from "@/components/ProfileDrawer";
import StatisticsScreen from "@/components/screens/StatisticsScreen";
import StreaksScreen from "@/components/screens/StreaksScreen";
import TodosScreen from "@/components/screens/TodosScreen";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import PagerView from "react-native-pager-view";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const TABS = [
  { key: "todos", icon: "flash-outline" as const, activeIcon: "flash" as const },
  { key: "streaks", icon: "flame-outline" as const, activeIcon: "flame" as const },
  { key: "statistics", icon: "podium-outline" as const, activeIcon: "podium" as const },
];

export default function TabsIndex() {
  const { colors } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
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

  const goToPage = (index: number) => {
    pagerRef.current?.setPage(index);
  };

  const openDrawer = useCallback(() => setDrawerOpen(true), []);

  const styles = createStyles(colors);

  return (
    <View style={styles.flex}>
      <PagerView
        ref={pagerRef}
        style={styles.flex}
        initialPage={0}
        onPageScroll={handlePageScroll}
      >
        <View key="todos" style={styles.flex}>
          <TodosScreen onMenuPress={openDrawer} />
        </View>
        <View key="streaks" style={styles.flex}>
          <StreaksScreen onMenuPress={openDrawer} />
        </View>
        <View key="statistics" style={styles.flex}>
          <StatisticsScreen onMenuPress={openDrawer} />
        </View>
      </PagerView>

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

      <ProfileDrawer visible={drawerOpen} colors={colors} onClose={() => setDrawerOpen(false)}>
        <ProfileContent onClose={() => setDrawerOpen(false)} />
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
    tabBar: {
      flexDirection: "row",
      height: 90,
      paddingBottom: 30,
      paddingTop: 10,
      borderTopWidth: 1,
    },
  });
