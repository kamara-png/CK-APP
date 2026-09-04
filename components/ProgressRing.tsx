import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface ProgressRingProps {
  percent: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color: string;
  trackColor: string;
  children?: React.ReactNode;
}

const ProgressRing = ({
  percent,
  size = 140,
  strokeWidth = 14,
  color,
  trackColor,
  children,
}: ProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const dashOffset = circumference * (1 - clamped / 100);

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          // Start the ring from the top (12 o'clock) instead of the 3 o'clock default.
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      {children}
    </View>
  );
};

export default ProgressRing;
