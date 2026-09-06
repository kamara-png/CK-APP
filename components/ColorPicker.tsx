import { useEffect, useRef, useState } from "react";
import { PanResponder, StyleSheet, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { hexToHsv, hsvToHex, isValidHex, normalizeHex } from "@/lib/color";
import { ColorScheme } from "@/hooks/useTheme";

const SV_SIZE = 220;
const HUE_HEIGHT = 22;

const HUE_STOPS = [
  "#ff0000",
  "#ffff00",
  "#00ff00",
  "#00ffff",
  "#0000ff",
  "#ff00ff",
  "#ff0000",
] as const;

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  colors: ColorScheme;
}

export default function ColorPicker({ value, onChange, colors }: ColorPickerProps) {
  const initial = hexToHsv(value) ?? { h: 0, s: 1, v: 1 };
  const [hue, setHue] = useState(initial.h);
  const [sat, setSat] = useState(initial.s);
  const [val, setVal] = useState(initial.v);
  const [hexText, setHexText] = useState(value);

  const hueRef = useRef(hue);
  const satRef = useRef(sat);
  const valRef = useRef(val);
  hueRef.current = hue;
  satRef.current = sat;
  valRef.current = val;

  const commit = (h: number, s: number, v: number) => {
    const hex = hsvToHex(h, s, v);
    setHexText(hex);
    onChange(hex);
  };

  const svResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt) => {
        const x = Math.max(0, Math.min(SV_SIZE, evt.nativeEvent.locationX));
        const y = Math.max(0, Math.min(SV_SIZE, evt.nativeEvent.locationY));
        const s = x / SV_SIZE;
        const v = 1 - y / SV_SIZE;
        setSat(s);
        setVal(v);
        commit(hueRef.current, s, v);
      },
    })
  ).current;

  const hueResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt) => {
        const x = Math.max(0, Math.min(SV_SIZE, evt.nativeEvent.locationX));
        const h = (x / SV_SIZE) * 360;
        setHue(h);
        commit(h, satRef.current, valRef.current);
      },
    })
  ).current;

  useEffect(() => {
    setHexText(hsvToHex(hue, sat, val));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleHexChange = (text: string) => {
    setHexText(text);
    if (isValidHex(text)) {
      const hex = normalizeHex(text);
      const hsv = hexToHsv(hex);
      if (hsv) {
        setHue(hsv.h);
        setSat(hsv.s);
        setVal(hsv.v);
        onChange(hex);
      }
    }
  };

  const pureHue = hsvToHex(hue, 1, 1);
  const styles = createStyles(colors);

  return (
    <View>
      <View style={[styles.svSquare, { width: SV_SIZE, height: SV_SIZE }]} {...svResponder.panHandlers}>
        <LinearGradient
          colors={["#ffffff", pureHue] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={["transparent", "#000000"] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View
          pointerEvents="none"
          style={[
            styles.svIndicator,
            {
              left: sat * SV_SIZE - 9,
              top: (1 - val) * SV_SIZE - 9,
            },
          ]}
        />
      </View>

      <View
        style={[styles.hueSlider, { width: SV_SIZE, height: HUE_HEIGHT }]}
        {...hueResponder.panHandlers}
      >
        <LinearGradient
          colors={HUE_STOPS}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <View pointerEvents="none" style={[styles.hueIndicator, { left: (hue / 360) * SV_SIZE - 3 }]} />
      </View>

      <View style={styles.hexRow}>
        <View style={[styles.swatch, { backgroundColor: isValidHex(hexText) ? normalizeHex(hexText) : "#000" }]} />
        <TextInput
          style={styles.hexInput}
          value={hexText}
          onChangeText={handleHexChange}
          placeholder="#rrggbb"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          maxLength={7}
        />
      </View>
    </View>
  );
}

const createStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    svSquare: {
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 12,
    },
    svIndicator: {
      position: "absolute",
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 3,
      borderColor: "#fff",
      shadowColor: "#000",
      shadowOpacity: 0.4,
      shadowRadius: 2,
      elevation: 3,
    },
    hueSlider: {
      borderRadius: 11,
      overflow: "hidden",
      marginBottom: 16,
    },
    hueIndicator: {
      position: "absolute",
      top: -2,
      width: 6,
      height: HUE_HEIGHT + 4,
      borderRadius: 3,
      borderWidth: 2,
      borderColor: "#fff",
      backgroundColor: "transparent",
    },
    hexRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    swatch: {
      width: 32,
      height: 32,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    hexInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      color: colors.text,
      backgroundColor: colors.backgrounds.input,
    },
  });
