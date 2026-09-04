import { useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

interface DateTimeFieldProps {
  value: Date;
  onChange: (date: Date) => void;
  color: string;
  mutedColor: string;
  borderColor: string;
}

export default function DateTimeField({
  value,
  onChange,
  color,
  mutedColor,
  borderColor,
}: DateTimeFieldProps) {
  const [step, setStep] = useState<"none" | "date" | "time">("none");
  const [pendingDate, setPendingDate] = useState<Date>(value);

  const openPicker = () => setStep("date");

  const handleDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") setStep("none");
    if (event.type === "dismissed" || !selected) {
      setStep("none");
      return;
    }
    const merged = new Date(pendingDate);
    merged.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
    setPendingDate(merged);
    if (Platform.OS === "android") {
      // Android shows one native dialog at a time — chain straight into the time step.
      setTimeout(() => setStep("time"), 0);
    }
  };

  const handleTimeChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") setStep("none");
    if (event.type === "dismissed" || !selected) {
      setStep("none");
      return;
    }
    const merged = new Date(pendingDate);
    merged.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    setPendingDate(merged);
    onChange(merged);
    if (Platform.OS !== "android") setStep("none");
  };

  const label = value.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <View>
      <TouchableOpacity
        onPress={openPicker}
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor,
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
      >
        <Text style={{ color }}>{label}</Text>
      </TouchableOpacity>

      {step === "date" && (
        <DateTimePicker
          value={pendingDate}
          mode="date"
          minimumDate={new Date()}
          onChange={handleDateChange}
          {...(Platform.OS === "ios" ? { display: "inline" } : {})}
        />
      )}
      {step === "time" && (
        <DateTimePicker
          value={pendingDate}
          mode="time"
          onChange={handleTimeChange}
          {...(Platform.OS === "ios" ? { display: "spinner" } : {})}
        />
      )}
      {Platform.OS === "ios" && step === "time" && (
        <TouchableOpacity
          onPress={() => setStep("none")}
          style={{ alignSelf: "flex-end", paddingVertical: 8, paddingHorizontal: 4 }}
        >
          <Text style={{ color, fontWeight: "600" }}>Done</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
