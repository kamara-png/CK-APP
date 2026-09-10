import ProfileContent from "@/components/ProfileContent";
import ProfileDrawer from "@/components/ProfileDrawer";
import StatisticsScreen from "@/components/screens/StatisticsScreen";
import StreaksScreen from "@/components/screens/StreaksScreen";
import TodosScreen from "@/components/screens/TodosScreen";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useCallback, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import PagerView from "react-native-pager-view";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const TABS = [
  {
    key: "todos",
    label: "Todos",
    icon: "flash-outline" as const,
    activeIcon: "flash" as const,
  },
  {
    key: "streaks",
    label: "Streaks",
    icon: "flame-outline" as const,
    activeIcon: "flame" as const,
  },
  {
    key: "statistics",
    label: "Stats",
    icon: "podium-outline" as const,
    activeIcon: "podium" as const,
  },
];

export default function TabsIndex() {
  const { colors } = useTheme();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const scrollPosition = useSharedValue(0);
  const handlePageScroll = useCallback(
    (event: {
      nativeEvent: {
        position: number;
        offset: number;
      };
    }) => {
      const { position, offset } = event.nativeEvent;
      scrollPosition.value = position + offset;
    },
    [scrollPosition],
  );

  const handlePageSelected = useCallback(
    (event: {
      nativeEvent: {
        position: number;
      };
    }) => {
      setActiveIndex(event.nativeEvent.position);
    },
    [],
  );

  const goToPage = (index: number) => {
    pagerRef.current?.setPage(index);
  };

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const styles = createStyles(colors);

  return (
    <View style={styles.flex}>
      {/*// Main screen */}
      <PagerView
        ref={pagerRef}
        style={styles.flex}
        initialPage={0}
        onPageScroll={handlePageScroll}
        onPageSelected={handlePageSelected}
        scrollEnabled={!drawerOpen}
        overdrag={false}
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

      {/*// floating tab bar */}
      <View pointerEvents="box-none" style={styles.floatingBarContainer}>
        <BlurView
          intensity={100}
          tint={colors.isDark ? "dark" : "light"}
          experimentalBlurMethod="dimezisBlurView"
          style={[
            styles.tabBar,
            {
              borderColor: colors.border + "30",
              backgroundColor: colors.surface + "55",
              shadowColor: colors.shadow,
            },
          ]}
        >
          {TABS.map((tab, index) => (
            <TabBarIcon
              key={tab.key}
              index={index}
              label={tab.label}
              icon={tab.icon}
              activeIcon={tab.activeIcon}
              scrollPosition={scrollPosition}
              pillColor={colors.primary}
              activeIconColor="#fff"
              inactiveColor={colors.textMuted}
              labelColor={colors.text}
              onPress={() => goToPage(index)}
            />
          ))}
        </BlurView>
      </View>

      {/* =========================
          PROFILE DRAWER
      ========================== */}

      <ProfileDrawer
        visible={drawerOpen}
        colors={colors}
        onClose={closeDrawer}
        onOpen={openDrawer}
        edgeSwipeEnabled={activeIndex === 0}
      >
        <ProfileContent onClose={closeDrawer} />
      </ProfileDrawer>
    </View>
  );
}

/* =========================================
   TAB BAR ICON
========================================= */

interface TabBarIconProps {
  index: number;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  scrollPosition: ReturnType<typeof useSharedValue<number>>;
  pillColor: string;
  activeIconColor: string;
  inactiveColor: string;
  labelColor: string;
  onPress: () => void;
}

function TabBarIcon({
  index,
  label,
  icon,
  activeIcon,
  scrollPosition,
  pillColor,
  activeIconColor,
  inactiveColor,
  labelColor,
  onPress,
}: TabBarIconProps) {
  /*
   * Scale animation
   *
   * The closer the tab is to the active page,
   * the larger it becomes.
   */
  const scaleStyle = useAnimatedStyle(() => {
    const distance = Math.min(1, Math.abs(scrollPosition.value - index));

    return {
      transform: [
        {
          scale: 1 + (1 - distance) * 0.08,
        },
      ],
    };
  });

  /*
   * Active icon opacity
   */
  const activeStyle = useAnimatedStyle(() => {
    const distance = Math.min(1, Math.abs(scrollPosition.value - index));

    return {
      opacity: 1 - distance,
    };
  });

  /*
   * Inactive icon opacity
   */
  const inactiveStyle = useAnimatedStyle(() => {
    const distance = Math.min(1, Math.abs(scrollPosition.value - index));

    return {
      opacity: distance,
    };
  });

  /*
   * Active pill background
   */
  const indicatorStyle = useAnimatedStyle(() => {
    const distance = Math.min(1, Math.abs(scrollPosition.value - index));

    return {
      opacity: 1 - distance,
      transform: [
        {
          scale: 0.8 + (1 - distance) * 0.2,
        },
      ],
    };
  });

  return (
    <TouchableOpacity
      style={iconStyles.tabButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Animated.View style={[iconStyles.iconContainer, scaleStyle]}>
        {/* =========================
            ACTIVE PILL (theme-colored)
        ========================== */}

        <Animated.View
          style={[
            iconStyles.activeBackground,
            indicatorStyle,
            { backgroundColor: pillColor },
          ]}
        />

        {/* =========================
            ACTIVE ICON
        ========================== */}

        <Animated.View style={[iconStyles.iconLayer, activeStyle]}>
          <Ionicons name={activeIcon} size={23} color={activeIconColor} />
        </Animated.View>

        {/* =========================
            INACTIVE ICON
        ========================== */}

        <Animated.View style={inactiveStyle}>
          <Ionicons name={icon} size={23} color={inactiveColor} />
        </Animated.View>
      </Animated.View>
      <Animated.Text style={[iconStyles.label, { color: labelColor }]}>
        {label}
      </Animated.Text>
    </TouchableOpacity>
  );
}

/* =========================================
   TAB ICON STYLES
========================================= */

const iconStyles = StyleSheet.create({
  tabButton: {
    flex: 1,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  iconContainer: {
    width: 40,
    height: 32,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  activeBackground: {
    position: "absolute",
    width: 40,
    height: 32,
    borderRadius: 23,
  },

  iconLayer: {
    position: "absolute",
  },

  label: {
    fontSize: 10,
    marginTop: 2,
  },
});

/* =========================================
   SCREEN / TAB BAR STYLES
========================================= */

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: colors.bg,
    },

    /*
     * Keeps the navigation floating above
     * the bottom of the screen.
     */
    floatingBarContainer: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 24,
      alignItems: "center",
      justifyContent: "center",
    },

    /*
     * Main floating pill
     */
    tabBar: {
      width: "78%",
      height: 68,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",

      borderRadius: 40,
      borderWidth: StyleSheet.hairlineWidth,
      overflow: "hidden",

      // iOS shadow
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.22,
      shadowRadius: 18,

      // Android shadow
      elevation: 12,
    },
  });
