import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, borderRadius, componentSpacing, shadows } from '../../theme';
import { hapticFeedback } from '../../utils/haptics';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: number;
  margin?: number;
  shadow?: boolean;
  disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  padding = componentSpacing.cardPadding,
  margin = componentSpacing.cardMargin,
  shadow = true,
  disabled = false,
}) => {
  const handlePress = () => {
    if (onPress && !disabled) {
      hapticFeedback.light();
      onPress();
    }
  };

  const cardStyle = [
    styles.base,
    {
      padding,
      margin,
    },
    shadow && styles.shadow,
    disabled && styles.disabled,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.95}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  shadow: {
    ...shadows.md,
    shadowColor: colors.shadow.medium,
  },
  disabled: {
    opacity: 0.6,
  },
});
