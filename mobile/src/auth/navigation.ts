import { router } from 'expo-router'

/** Close the sign-in or registration screen, returning to wherever the user came from. */
export function leaveAuthScreen() {
  if (router.canGoBack()) router.back()
  else router.replace('/')
}
