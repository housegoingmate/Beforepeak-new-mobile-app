import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type Restaurant = {
  name: string;
  name_zh?: string;
  image: string;
  discount: string;
  cuisine: string;
  rating: string | number;
  reviews?: number;
  district: string;
  availableToday?: boolean;
  nextSlot?: string;
  priceRange?: string;
};

type Props = {
  restaurant: Restaurant;
  onPress?: () => void;
  style?: 'grid' | 'horizontal' | 'list';
  size?: 'small' | 'medium' | 'large';
  locale?: 'zh-HK' | 'en';
};

export default function RestaurantCard({ restaurant, onPress, style = 'grid', size = 'medium', locale = 'zh-HK' }: Props) {
  const cardWidth = size === 'small' ? (width - 80) / 3 : size === 'medium' ? (width - 60) / 2 : width - 40;
  const isZhHK = locale === 'zh-HK';
  const restaurantName = isZhHK && restaurant.name_zh ? restaurant.name_zh : restaurant.name;

  if (style === 'horizontal') {
    return (
      <TouchableOpacity style={[styles.horizontalCard, { width: cardWidth }]} onPress={onPress}>
        <Image source={{ uri: restaurant.image }} style={styles.horizontalImage} />
        <View style={styles.discountBadgeSmall}>
          <Text style={styles.discountTextSmall}>{restaurant.discount}</Text>
        </View>
        <View style={styles.horizontalContent}>
          <Text style={styles.horizontalName} numberOfLines={1}>{restaurantName}</Text>
          <Text style={styles.horizontalCuisine}>{restaurant.cuisine}</Text>
          <View style={styles.horizontalMeta}>
            <View style={styles.rating}>
              <Icon name="star" size={10} color="#F59E0B" />
              <Text style={styles.ratingTextSmall}>{restaurant.rating}</Text>
            </View>
            <Text style={styles.districtSmall}>{restaurant.district}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (style === 'list') {
    return (
      <TouchableOpacity style={styles.listCard} onPress={onPress}>
        <Image source={{ uri: restaurant.image }} style={styles.listImage} />
        <View style={styles.listContent}>
          <View style={styles.listHeader}>
            <Text style={styles.listName} numberOfLines={1}>{restaurantName}</Text>
            <View style={styles.discountBadgeSmall}>
              <Text style={styles.discountTextSmall}>{restaurant.discount}</Text>
            </View>
          </View>
          <Text style={styles.listCuisine}>{restaurant.cuisine} • {restaurant.district}</Text>
          <View style={styles.listMeta}>
            <View style={styles.rating}>
              <Icon name="star" size={12} color="#F59E0B" />
              <Text style={styles.ratingText}>{restaurant.rating}</Text>
              {restaurant.reviews ? <Text style={styles.reviewCount}>({restaurant.reviews})</Text> : null}
            </View>
            {restaurant.priceRange ? <Text style={styles.priceRange}>{restaurant.priceRange}</Text> : <View />}
          </View>
          <View style={styles.availability}>
            <Icon name="schedule" size={12} color={restaurant.availableToday ? '#059669' : '#6B7280'} />
            <Text style={[styles.nextSlot, { color: restaurant.availableToday ? '#059669' : '#6B7280' }]}>{restaurant.nextSlot}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={[styles.gridCard, { width: cardWidth }]} onPress={onPress}>
      <Image source={{ uri: restaurant.image }} style={styles.gridImage} />
      <View style={styles.discountBadge}>
        <Text style={styles.discountText}>{restaurant.discount}</Text>
      </View>
      <View style={styles.gridContent}>
        <Text style={styles.gridName} numberOfLines={1}>{restaurantName}</Text>
        <Text style={styles.gridCuisine}>{restaurant.cuisine}</Text>
        <View style={styles.gridMeta}>
          <View style={styles.rating}>
            <Icon name="star" size={12} color="#F59E0B" />
            <Text style={styles.ratingTextSmall}>{restaurant.rating}</Text>
          </View>
          <Text style={styles.district}>{restaurant.district}</Text>
        </View>
        <View style={styles.availability}>
          <Icon name="schedule" size={10} color={restaurant.availableToday ? '#059669' : '#6B7280'} />
          <Text style={[styles.nextSlotSmall, { color: restaurant.availableToday ? '#059669' : '#6B7280' }]}>{restaurant.nextSlot}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  horizontalCard: {
    backgroundColor: '#FFFFFF', borderRadius: 8, marginRight: 12, overflow: 'hidden', elevation: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
  },
  horizontalImage: { width: '100%', height: 80, backgroundColor: '#E5E7EB' },
  horizontalContent: { padding: 8 },
  horizontalName: { fontSize: 12, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  horizontalCuisine: { fontSize: 10, color: '#6B7280', marginBottom: 4 },
  horizontalMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  gridCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 16, marginRight: 16, overflow: 'hidden', elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  gridImage: { width: '100%', height: 120, backgroundColor: '#E5E7EB' },
  gridContent: { padding: 12 },
  gridName: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  gridCuisine: { fontSize: 12, color: '#6B7280', marginBottom: 8 },
  gridMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },

  listCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 12, overflow: 'hidden', elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  listImage: { width: 80, height: 80, backgroundColor: '#E5E7EB' },
  listContent: { flex: 1, padding: 12 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  listName: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1F2937', marginRight: 8 },
  listCuisine: { fontSize: 14, color: '#6B7280', marginBottom: 6 },
  listMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },

  discountBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#DC2626', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, zIndex: 1 },
  discountBadgeSmall: { backgroundColor: '#DC2626', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, position: 'absolute', top: 6, right: 6, zIndex: 1 },
  discountText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  discountTextSmall: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },

  rating: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 12, color: '#374151', marginLeft: 4 },
  ratingTextSmall: { fontSize: 10, color: '#374151', marginLeft: 2 },
  reviewCount: { fontSize: 12, color: '#6B7280', marginLeft: 2 },
  district: { fontSize: 10, color: '#6B7280' },
  districtSmall: { fontSize: 8, color: '#6B7280' },
  priceRange: { fontSize: 12, color: '#374151', fontWeight: '500' },

  availability: { flexDirection: 'row', alignItems: 'center' },
  nextSlot: { fontSize: 12, marginLeft: 4, fontWeight: '500' },
  nextSlotSmall: { fontSize: 10, marginLeft: 2, fontWeight: '500' },
});

