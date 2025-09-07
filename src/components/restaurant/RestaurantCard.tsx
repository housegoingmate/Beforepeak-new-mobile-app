import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
// Use FastImage when available, fallback to RN Image for Snack
import { Image } from 'react-native';
let FastImage: any = Image as any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  FastImage = require('react-native-fast-image');
} catch (e) {
  // Fallback remains Image
  FastImage.resizeMode = Image.resizeMode || { cover: 'cover' };
}

import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { UIRestaurant, DayAvailability } from '../../types/database';
import { formatRating, formatReviewCount, formatDistance, formatCurrency } from '../../utils/formatting';
import { hapticFeedback } from '../../utils/haptics';
import { fetchRestaurantAvailability } from '../../services/restaurants';

const { width } = Dimensions.get('window');
const cardWidth = width - (spacing.md * 2);

interface RestaurantCardProps {
  restaurant: UIRestaurant;
  onPress: (restaurant: UIRestaurant) => void;
  onFavorite?: (restaurantId: string) => void;
  showDistance?: boolean;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onPress,
  onFavorite,
  showDistance = true,
}) => {
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);

  useEffect(() => {
    loadAvailability();
  }, [restaurant.id]);

  const loadAvailability = async () => {
    try {
      setIsLoadingAvailability(true);
      const data = await fetchRestaurantAvailability(restaurant.id, 3);
      setAvailability(data);
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  const handlePress = () => {
    hapticFeedback.medium();
    onPress(restaurant);
  };

  const handleFavorite = () => {
    hapticFeedback.light();
    onFavorite?.(restaurant.id);
  };

  const featuredImage = restaurant.photos?.find(p => p.is_featured)?.url || 
                       restaurant.photos?.[0]?.url || 
                       restaurant.image_url;

  const nextAvailableSlot = availability
    .find(day => !day.closed && day.slots.length > 0)
    ?.slots.find(slot => slot.is_available);

  return (
    <Card onPress={handlePress} padding={0} style={styles.card}>
      {/* Restaurant Image */}
      <View style={styles.imageContainer}>
        <FastImage
          source={{
            uri: featuredImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
            priority: FastImage.priority.normal,
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

        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavorite}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={restaurant.is_favorite ? 'heart' : 'heart-outline'}
            size={20}
            color={restaurant.is_favorite ? colors.error.500 : colors.text.inverse}
          />
        </TouchableOpacity>
      </View>

      {/* Restaurant Info */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color={colors.rating.star} />
            <Text style={styles.ratingText}>
              {formatRating(restaurant.average_rating)}
            </Text>
            <Text style={styles.reviewCount}>
              ({formatReviewCount(restaurant.total_reviews)})
            </Text>
          </View>
        </View>

        <View style={styles.details}>
          <Text style={styles.cuisine} numberOfLines={1}>
            {restaurant.cuisine_type}
          </Text>
          <View style={styles.location}>
            <Ionicons name="pin" size={12} color={colors.text.tertiary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {restaurant.territory}
              {showDistance && restaurant.distance && ` • ${formatDistance(restaurant.distance)}`}
            </Text>
          </View>
        </View>

        {/* Availability */}
        {!isLoadingAvailability && nextAvailableSlot && (
          <View style={styles.availability}>
            <Ionicons name="time" size={12} color={colors.success.600} />
            <Text style={styles.availabilityText}>
              Next available: Today {nextAvailableSlot.time}
            </Text>
            <Text style={styles.discountSmall}>
              -{nextAvailableSlot.discount_percentage}%
            </Text>
          </View>
        )}

        {/* Quick Book Button */}
        {nextAvailableSlot && (
          <TouchableOpacity
            style={styles.quickBookButton}
            onPress={handlePress}
          >
            <Text style={styles.quickBookText}>
              Quick Book • {formatCurrency(50)} fee
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    marginBottom: spacing.md,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.warning.500,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  discountText: {
    ...typography.overline,
    color: colors.text.inverse,
    fontWeight: '700',
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.h5,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
    marginLeft: 2,
  },
  reviewCount: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginLeft: 2,
  },
  details: {
    marginBottom: spacing.sm,
  },
  cuisine: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginLeft: 4,
    flex: 1,
  },
  availability: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  availabilityText: {
    ...typography.caption,
    color: colors.success.600,
    marginLeft: 4,
    flex: 1,
  },
  discountSmall: {
    ...typography.caption,
    color: colors.warning.600,
    fontWeight: '600',
  },
  quickBookButton: {
    backgroundColor: colors.primary.purple,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  quickBookText: {
    ...typography.buttonSmall,
    color: colors.text.inverse,
  },
});
