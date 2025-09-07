import { Platform } from 'react-native';

// Font weights
export const fontWeights = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

// Font families - Inter font system like the website
export const fontFamilies = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
  }),
};

// Typography scale - following website design
export const typography = {
  // Headings
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: fontWeights.bold,
    fontFamily: fontFamilies.bold,
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: fontWeights.bold,
    fontFamily: fontFamilies.bold,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: fontWeights.semibold,
    fontFamily: fontFamilies.medium,
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: fontWeights.semibold,
    fontFamily: fontFamilies.medium,
  },
  h5: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: fontWeights.medium,
    fontFamily: fontFamilies.medium,
  },
  h6: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: fontWeights.medium,
    fontFamily: fontFamilies.medium,
  },

  // Body text
  body1: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: fontWeights.normal,
    fontFamily: fontFamilies.regular,
  },
  body2: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: fontWeights.normal,
    fontFamily: fontFamilies.regular,
  },

  // Small text
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: fontWeights.normal,
    fontFamily: fontFamilies.regular,
  },
  overline: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: fontWeights.medium,
    fontFamily: fontFamilies.medium,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
  },

  // Button text
  button: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: fontWeights.semibold,
    fontFamily: fontFamilies.medium,
  },
  buttonSmall: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: fontWeights.medium,
    fontFamily: fontFamilies.medium,
  },

  // Navigation
  tabLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: fontWeights.medium,
    fontFamily: fontFamilies.medium,
  },
  navTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: fontWeights.semibold,
    fontFamily: fontFamilies.medium,
  },

  // Form elements
  input: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: fontWeights.normal,
    fontFamily: fontFamilies.regular,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: fontWeights.medium,
    fontFamily: fontFamilies.medium,
  },
};
