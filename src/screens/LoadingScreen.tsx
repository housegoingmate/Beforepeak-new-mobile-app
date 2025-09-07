import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { colors, typography, commonStyles } from '../theme';

export const LoadingScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>BeforePeak</Text>
        <Text style={styles.subtitle}>Loading...</Text>
        <ActivityIndicator
          size="large"
          color={colors.primary.purple}
          style={styles.loader}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  content: {
    ...commonStyles.centerContent,
  },
  title: {
    ...typography.h1,
    color: colors.primary.purple,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.h5,
    color: colors.text.secondary,
    marginBottom: 32,
  },
  loader: {
    marginTop: 16,
  },
});
