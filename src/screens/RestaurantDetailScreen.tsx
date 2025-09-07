import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { colors, typography, spacing, borderRadius, commonStyles } from '../theme';
import { UIRestaurant, DayAvailability } from '../types/database';
import { fetchRestaurant, fetchRestaurantAvailability } from '../services/restaurants';
import { hapticFeedback } from '../utils/haptics';
import { formatRating, formatReviewCount, formatTime, formatDate } from '../utils/formatting';

const { width } = Dimensions.get('window');

export const RestaurantDetailScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();

  const [restaurant, setRestaurant] = useState<UIRestaurant | null>(null);
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const params = route.params as any;
    if (params?.restaurant) {
      setRestaurant(params.restaurant);
      loadRestaurantDetails(params.restaurant.id);
    }
  }, [route.params]);

  const loadRestaurantDetails = async (restaurantId: string) => {
    try {
      setLoading(true);
      const [restaurantData, availabilityData] = await Promise.all([
        fetchRestaurant(restaurantId),
        fetchRestaurantAvailability(restaurantId, 7),
      ]);

      if (restaurantData) {
        setRestaurant(restaurantData);
      }
      setAvailability(availabilityData);
    } catch (error) {
      console.error('Error loading restaurant details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    hapticFeedback.light();
    navigation.goBack();
  };

  const handleFavorite = () => {
    hapticFeedback.medium();
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite functionality
  };

  const handleShare = () => {
    hapticFeedback.light();
    // TODO: Implement share functionality
  };

  const handleCall = () => {
    if (restaurant?.phone) {
      hapticFeedback.light();
      Linking.openURL(`tel:${restaurant.phone}`);
    }
  };

  const handleBookNow = () => {
    if (restaurant) {
      hapticFeedback.medium();
      navigation.navigate('Booking', { restaurant });
    }
  };

  const handleTimeSlotPress = (dayAvailability: DayAvailability, slotId: string) => {
    if (restaurant) {
      hapticFeedback.light();
      navigation.navigate('Booking', {
        restaurant,
        selectedDate: dayAvailability.date,
        selectedTimeSlot: slotId
      });
    }
  };

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const featuredImage = restaurant.photos?.find(p => p.is_featured)?.url ||
                       restaurant.photos?.[0]?.url ||
                       restaurant.image_url;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleFavorite}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? colors.error.500 : colors.text.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Restaurant Image */}
        <View style={styles.imageContainer}>
          <FastImage
            source={{
              uri: featuredImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
              priority: FastImage.priority.high,
            }}
            style={styles.image}
            resizeMode={FastImage.resizeMode.cover}
          />

          {/* Discount Badge */}
          {restaurant.discount_percentage && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {restaurant.discount_percentage}% OFF
              </Text>
            </View>
          )}
        </View>

        {/* Restaurant Info */}
        <View style={styles.content}>
          <View style={styles.restaurantHeader}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color={colors.rating.star} />
              <Text style={styles.ratingText}>
                {formatRating(restaurant.average_rating)}
              </Text>
              <Text style={styles.reviewCount}>
                ({formatReviewCount(restaurant.total_reviews)})
              </Text>
            </View>
          </View>

          <Text style={styles.cuisine}>{restaurant.cuisine_type}</Text>

          <View style={styles.locationContainer}>
            <Ionicons name="pin" size={16} color={colors.text.tertiary} />
            <Text style={styles.locationText}>{restaurant.address}</Text>
          </View>

          {restaurant.description && (
            <Text style={styles.description}>{restaurant.description}</Text>
          )}

          {/* Contact Info */}
          <Card style={styles.contactCard}>
            <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
              <Ionicons name="call" size={20} color={colors.primary.purple} />
              <Text style={styles.contactText}>{restaurant.phone}</Text>
            </TouchableOpacity>
          </Card>

          {/* Availability */}
          <View style={styles.availabilitySection}>
            <Text style={styles.sectionTitle}>Available Times</Text>
            {availability.map((day) => (
              <Card key={day.date} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayName}>
                    {day.is_today ? 'Today' : day.is_tomorrow ? 'Tomorrow' : formatDate(day.date)}
                  </Text>
                  <Text style={styles.dayDate}>{day.date}</Text>
                </View>

                {day.closed ? (
                  <Text style={styles.closedText}>Closed</Text>
                ) : (
                  <View style={styles.slotsContainer}>
                    {day.slots.map((slot) => (
                      <TouchableOpacity
                        key={slot.id}
                        style={[
                          styles.timeSlot,
                          !slot.is_available && styles.timeSlotDisabled
                        ]}
                        onPress={() => handleTimeSlotPress(day, slot.id)}
                        disabled={!slot.is_available}
                      >
                        <Text style={[
                          styles.timeSlotText,
                          !slot.is_available && styles.timeSlotTextDisabled
                        ]}>
                          {formatTime(slot.time)}
                        </Text>
                        <Text style={styles.discountSmall}>
                          -{slot.discount_percentage}%
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <Button
          title={t('restaurant.bookNow')}
          onPress={handleBookNow}
          style={styles.bookButton}
          icon={<Ionicons name="calendar" size={20} color={colors.text.inverse} />}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  loadingContainer: {
    ...commonStyles.centerContent,
  },
  loadingText: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 250,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    backgroundColor: colors.warning.500,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  discountText: {
    ...typography.overline,
    color: colors.text.inverse,
    fontWeight: '700',
  },
  content: {
    padding: spacing.lg,
  },
  restaurantHeader: {
    marginBottom: spacing.md,
  },
  restaurantName: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...typography.body2,
    color: colors.text.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  reviewCount: {
    ...typography.body2,
    color: colors.text.tertiary,
    marginLeft: 4,
  },
  cuisine: {
    ...typography.body1,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  locationText: {
    ...typography.body2,
    color: colors.text.tertiary,
    marginLeft: spacing.xs,
    flex: 1,
  },
  description: {
    ...typography.body1,
    color: colors.text.secondary,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  contactCard: {
    marginBottom: spacing.lg,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    ...typography.body1,
    color: colors.text.primary,
    marginLeft: spacing.md,
  },
  availabilitySection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  dayCard: {
    marginBottom: spacing.md,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dayName: {
    ...typography.h6,
    color: colors.text.primary,
  },
  dayDate: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  closedText: {
    ...typography.body2,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeSlot: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary.purple50,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary.purple,
    alignItems: 'center',
  },
  timeSlotDisabled: {
    backgroundColor: colors.background.tertiary,
    borderColor: colors.border.medium,
  },
  timeSlotText: {
    ...typography.caption,
    color: colors.primary.purple,
    fontWeight: '600',
  },
  timeSlotTextDisabled: {
    color: colors.text.tertiary,
  },
  discountSmall: {
    ...typography.overline,
    color: colors.warning.600,
    fontSize: 10,
  },
  bottomAction: {
    padding: spacing.lg,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  bookButton: {
    width: '100%',
  },
});

