import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

// Light tactile feedback for selections and confirmations. The web preview has no haptics.
const enabled = Platform.OS === 'ios' || Platform.OS === 'android'

export const haptics = {
  /** A tab, segment or option changed. */
  selection: () => {
    if (enabled) void Haptics.selectionAsync().catch(() => undefined)
  },
  /** Something was saved or sent. */
  success: () => {
    if (enabled) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined)
  },
  /** A light tap, for removing or toggling off. */
  light: () => {
    if (enabled) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined)
  },
}
