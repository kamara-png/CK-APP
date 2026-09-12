import { ColorScheme } from "@/hooks/useTheme";
import { StyleSheet } from "react-native";
import { fontSize, fontWeight, radius, shadow, spacing } from "./tokens";

/**
 * The backdrop + card + header/title/headerSide combo used by every
 * center-modal editor in the app (AddTodoModal, TodoEditor, HabitEditor,
 * ReminderEditor, and the custom color-picker sheet in the note editor).
 * These four were previously copy-pasted with small, unintended
 * inconsistencies (e.g. one modal's title was 28px/900-weight while the
 * other three were 18px/700) — centralizing them here means a change here
 * changes all of them at once.
 */
export const createModalStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.25)",
      justifyContent: "center",
      padding: spacing.xxl,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      padding: spacing.xl,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.bold,
      color: colors.text,
      flex: 1,
      textAlign: "center",
    },
    headerSide: { width: 22 },
  });

/** The bottom-sheet variant (slides up from the bottom, rounded top corners
 * only) used by the Preferences theme picker and the note editor's options
 * sheet. */
export const createSheetStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.2)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: radius.xl + 8,
      borderTopRightRadius: radius.xl + 8,
      paddingHorizontal: spacing.xl,
      paddingTop: 10,
      paddingBottom: spacing.xxxl,
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: "center",
      marginBottom: spacing.md + 2,
    },
    title: {
      fontSize: fontSize.display - 10,
      fontWeight: fontWeight.heavy,
      color: colors.text,
      marginBottom: spacing.xs,
    },
  });

/** A single-line labeled text-input row: icon + input, used across the
 * sign-in screen and any editor with a plain text field. */
export const createInputStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm + 2,
      backgroundColor: colors.backgrounds.input,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.lg - 2,
    },
    field: {
      flex: 1,
      paddingVertical: 14,
      color: colors.text,
      fontSize: fontSize.md,
    },
    plain: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.lg - 2,
      paddingVertical: spacing.md - 2,
      color: colors.text,
      backgroundColor: colors.backgrounds.editInput,
      minHeight: 60,
      textAlignVertical: "center",
    },
  });

/** Primary / danger action buttons — full-width, rounded, bold centered
 * label — used at the bottom of every editor modal and the sign-in form. */
export const createButtonStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    primary: {
      backgroundColor: colors.primary,
      borderRadius: radius.md,
      paddingVertical: spacing.lg - 1,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryDisabled: {
      backgroundColor: colors.border,
    },
    primaryText: {
      color: "#fff",
      fontWeight: fontWeight.bold,
      fontSize: fontSize.md + 1,
    },
    danger: {
      backgroundColor: colors.danger,
      borderRadius: radius.md,
      paddingVertical: spacing.lg - 1,
      alignItems: "center",
      justifyContent: "center",
    },
  });

/** The floating "+" action button — identical on the Todos and Notes list
 * screens (only the safe-area-aware `bottom` offset differs per screen). */
export const createFabStyle = (colors: ColorScheme) =>
  StyleSheet.create({
    fab: {
      position: "absolute",
      right: spacing.xl,
      width: 58,
      height: 58,
      borderRadius: radius.xl + 2,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      shadowColor: colors.shadow,
      ...shadow.md,
    },
  });

/** The "menu icon — centered title — spacer" header row shared by the
 * Todos/Streaks/Statistics screens. */
export const createScreenHeaderStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    headerAction: { width: 30 },
    title: {
      fontSize: fontSize.display,
      fontWeight: fontWeight.heavy,
      color: colors.text,
      flex: 1,
      textAlign: "center",
    },
  });
