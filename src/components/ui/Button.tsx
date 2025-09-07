import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography, borderRadius, componentSpacing } from '../../theme';
import { hapticFeedback } from '../../utils/haptics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
}) => {
  const handlePress = () => {
    if (!disabled && !loading) {
      hapticFeedback.light();
      onPress();
    }
  };

  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyleCombined = [
    styles.baseText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.text.inverse : colors.primary.purple}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text style={textStyleCombined}>{title}</Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    minHeight: 44, // iOS minimum touch target
  },

  // Variants
  primary: {
    backgroundColor: colors.primary.purple,
  },
  secondary: {
    backgroundColor: colors.background.tertiary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary.purple,
  },
  ghost: {
    backgroundColor: 'transparent',
  },

  // Sizes
  small: {
    paddingHorizontal: componentSpacing.buttonPaddingHorizontal / 2,
    paddingVertical: componentSpacing.buttonPaddingVertical / 2,
  },
  medium: {
    paddingHorizontal: componentSpacing.buttonPaddingHorizontal,
    paddingVertical: componentSpacing.buttonPaddingVertical,
  },
  large: {
    paddingHorizontal: componentSpacing.buttonPaddingHorizontal * 1.5,
    paddingVertical: componentSpacing.buttonPaddingVertical * 1.2,
  },

  // Disabled state
  disabled: {
    opacity: 0.5,
  },

  // Text styles
  baseText: {
    textAlign: 'center',
  },
  primaryText: {
    ...typography.button,
    color: colors.text.inverse,
  },
  secondaryText: {
    ...typography.button,
    color: colors.text.primary,
  },
  outlineText: {
    ...typography.button,
    color: colors.primary.purple,
  },
  ghostText: {
    ...typography.button,
    color: colors.primary.purple,
  },

  // Text sizes
  smallText: {
    ...typography.buttonSmall,
  },
  mediumText: {
    ...typography.button,
  },
  largeText: {
    ...typography.button,
    fontSize: 18,
  },

  disabledText: {
    opacity: 0.7,
  },
});
