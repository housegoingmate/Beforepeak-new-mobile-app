// Haptics wrapper that gracefully degrades on Expo Snack / web
let HapticModule: any = null;
try {
  // Try to load native module; will fail on Snack/web
  HapticModule = require('react-native-haptic-feedback').default;
}
 catch (e) {
  HapticModule = null;
}

const trigger = (type: string) => {
  if (HapticModule) {
    HapticModule.trigger(type, {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
  } else {
    // No-op on Snack/web
  }
};

export const hapticFeedback = {
  light: () => trigger('impactLight'),
  medium: () => trigger('impactMedium'),
  heavy: () => trigger('impactHeavy'),
  success: () => trigger('notificationSuccess'),
  warning: () => trigger('notificationWarning'),
  error: () => trigger('notificationError'),
  selection: () => trigger('selection'),
};
