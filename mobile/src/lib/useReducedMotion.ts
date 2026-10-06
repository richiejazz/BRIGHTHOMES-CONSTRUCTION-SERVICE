import { useEffect, useState } from 'react'
import { AccessibilityInfo } from 'react-native'

/** Whether the user has asked the system to reduce motion. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    let active = true
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => active && setReduced(value))
      .catch(() => undefined)
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced)
    return () => {
      active = false
      subscription.remove()
    }
  }, [])
  return reduced
}
