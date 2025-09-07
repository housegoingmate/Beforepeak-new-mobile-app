import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, commonStyles } from '../theme';
import { Button } from '../components/ui/Button';

export const MapScreen: React.FC = () => {
  const { t } = useTranslation();
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);

  useEffect(() => {
    // For now, we'll use Hong Kong's coordinates as default
    setLocation({ latitude: 22.3193, longitude: 114.1694 });
  }, []);

  const handleGetLocation = () => {
    Alert.alert(
      'Location Access',
      'This feature will be available when location permissions are implemented.',
      [{ text: 'OK' }]
    );
  };

  const handleSearchArea = () => {
    Alert.alert(
      'Search Area',
      'Map search functionality will be implemented with react-native-maps.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('map.title')}</Text>
      </View>

      <View style={styles.mapPlaceholder}>
        <Ionicons name="pin" size={48} color={colors.primary.purple} />
        <Text style={styles.placeholderTitle}>Map View</Text>
        <Text style={styles.placeholderText}>
          Interactive map with restaurant locations will be displayed here using react-native-maps.
        </Text>
        
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            Current Location: Hong Kong
          </Text>
          <Text style={styles.coordinatesText}>
            {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Loading...'}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <Button
          title="Get Current Location"
          onPress={handleGetLocation}
          variant="primary"
          style={styles.controlButton}
          icon={<Ionicons name="navigate" size={16} color={colors.text.inverse} />}
        />
        
        <Button
          title={t('map.searchThisArea')}
          onPress={handleSearchArea}
          variant="secondary"
          style={styles.controlButton}
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.infoTitle}>{t('map.nearbyRestaurants')}</Text>
        <Text style={styles.infoText}>
          Nearby restaurants with available time slots will be shown on the map with discount indicators.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    margin: spacing.lg,
    borderRadius: 12,
    padding: spacing.xl,
  },
  placeholderTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  placeholderText: {
    ...typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  locationInfo: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  locationText: {
    ...typography.body2,
    color: colors.text.primary,
    fontWeight: '600',
  },
  coordinatesText: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  controls: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  controlButton: {
    marginBottom: spacing.sm,
  },
  info: {
    padding: spacing.lg,
    backgroundColor: colors.background.secondary,
  },
  infoTitle: {
    ...typography.h6,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.body2,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});
