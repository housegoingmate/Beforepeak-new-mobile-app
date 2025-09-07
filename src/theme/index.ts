import { colors } from './colors';
import { typography } from './typography';
import { spacing, componentSpacing, borderRadius, shadows } from './spacing';

// Main theme object
export const theme = {
  colors,
  typography,
  spacing,
  componentSpacing,
  borderRadius,
  shadows,
};

export type Theme = typeof theme;

// Export individual theme parts
export { colors } from './colors';
export { typography } from './typography';
export { spacing, componentSpacing, borderRadius, shadows } from './spacing';

// Common style combinations
export const commonStyles = {
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingHorizontal: componentSpacing.screenPaddingHorizontal,
  },

  // Card styles
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: componentSpacing.cardPadding,
    ...shadows.md,
    shadowColor: colors.shadow.medium,
  },

  // Button styles
  primaryButton: {
    backgroundColor: colors.primary.purple,
    paddingHorizontal: componentSpacing.buttonPaddingHorizontal,
    paddingVertical: componentSpacing.buttonPaddingVertical,
    borderRadius: borderRadius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  secondaryButton: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: componentSpacing.buttonPaddingHorizontal,
    paddingVertical: componentSpacing.buttonPaddingVertical,
    borderRadius: borderRadius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  // Text styles
  primaryButtonText: {
    ...typography.button,
    color: colors.text.inverse,
  },

  secondaryButtonText: {
    ...typography.button,
    color: colors.text.primary,
  },

  // Input styles
  input: {
    ...typography.input,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    paddingHorizontal: componentSpacing.inputPaddingHorizontal,
    paddingVertical: componentSpacing.inputPaddingVertical,
    color: colors.text.primary,
  },

  // List styles
  listItem: {
    paddingHorizontal: componentSpacing.listItemPadding,
    paddingVertical: componentSpacing.listItemPadding,
    borderBottomWidth: componentSpacing.listSeparator,
    borderBottomColor: colors.border.light,
  },

  // Center content
  centerContent: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },

  // Row layout
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },

  // Space between
  spaceBetween: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
};
