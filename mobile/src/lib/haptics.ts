import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// Thin, tasteful haptics wrapper. No-ops off iOS/Android. Fire-and-forget.
const on = Platform.OS === 'ios' || Platform.OS === 'android';

/** Light tap — default for button presses. */
export const tap = () => {
  if (on) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

/** Selection change — tabs, toggles, picking an option. */
export const select = () => {
  if (on) Haptics.selectionAsync();
};

/** Medium impact — a more deliberate action. */
export const impact = () => {
  if (on) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

/** Success — a flow completed (signup, tool run, interview saved). */
export const success = () => {
  if (on) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

/** Warning/soft error. */
export const warn = () => {
  if (on) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};
