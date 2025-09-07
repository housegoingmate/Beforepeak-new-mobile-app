// Spacing system - 8px base unit like the website
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Component-specific spacing
export const componentSpacing = {
  // Screen padding
  screenPadding: spacing.md,
  screenPaddingHorizontal: spacing.md,
  screenPaddingVertical: spacing.lg,

  // Card spacing
  cardPadding: spacing.md,
  cardMargin: spacing.sm,
  cardRadius: 12,

  // Button spacing
  buttonPaddingHorizontal: spacing.lg,
  buttonPaddingVertical: spacing.md,
  buttonRadius: 8,
  buttonMargin: spacing.sm,

  // Input spacing
  inputPaddingHorizontal: spacing.md,
  inputPaddingVertical: spacing.md,
  inputRadius: 8,
  inputMargin: spacing.sm,

  // List spacing
  listItemPadding: spacing.md,
  listItemMargin: spacing.sm,
  listSeparator: 1,

  // Tab bar
  tabBarHeight: 60,
  tabBarPadding: spacing.sm,

  // Header
  headerHeight: 56,
  headerPadding: spacing.md,

  // Safe area
  safeAreaTop: 44, // iOS status bar
  safeAreaBottom: 34, // iOS home indicator
};

// Border radius system
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

// Shadow system
export const shadows = {
  none: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
};
