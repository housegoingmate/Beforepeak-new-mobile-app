import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { RestaurantCard } from '../components/restaurant/RestaurantCard';
import { Button } from '../components/ui/Button';
import { MapboxAddressInput } from '../components/MapboxAddressInput';
import { colors, typography, spacing, borderRadius, commonStyles } from '../theme';
import { UIRestaurant, SearchFilters } from '../types/database';
import { fetchRestaurants, searchRestaurants } from '../services/restaurants';
import { hapticFeedback } from '../utils/haptics';

const CUISINE_TYPES = [
  'Chinese', 'Japanese', 'Korean', 'Thai', 'Vietnamese', 'Indian',
  'Italian', 'French', 'American', 'Mexican', 'Mediterranean', 'Fusion'
];

const TERRITORIES = [
  'Central', 'Admiralty', 'Wan Chai', 'Causeway Bay', 'Tsim Sha Tsui',
  'Mong Kok', 'Yau Ma Tei', 'Jordan', 'Sheung Wan', 'Soho'
];

const SORT_OPTIONS = [
  { key: 'rating', label: 'Highest Rated' },
  { key: 'distance', label: 'Nearest' },
  { key: 'discount', label: 'Best Discount' },
  { key: 'newest', label: 'Newest' },
];

export const RestaurantsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();

  const [restaurants, setRestaurants] = useState<UIRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    cuisine_type: [],
    territory: [],
    district: [],
    rating_min: 0,
    discount_min: 0,
    sort_by: 'rating',
  });

  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    coordinates: [number, number];
  } | null>(null);

  useEffect(() => {
    // Handle navigation params
    const params = route.params as any;
    if (params?.searchQuery) {
      setSearchQuery(params.searchQuery);
      setFilters(prev => ({ ...prev, query: params.searchQuery }));
    }
    if (params?.sortBy) {
      setFilters(prev => ({ ...prev, sort_by: params.sortBy }));
    }
    if (params?.territory) {
      const territories = Array.isArray(params.territory) ? params.territory : [params.territory];
      setFilters(prev => ({ ...prev, territory: territories }));
    }
    if (params?.district) {
      const districts = Array.isArray(params.district) ? params.district : [params.district];
      setFilters(prev => ({ ...prev, district: districts }));
    }

    loadRestaurants();
  }, [route.params, loadRestaurants]);

  const loadRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchRestaurants(filters);
      setRestaurants(data);
    } catch (error) {
      console.error('Error loading restaurants:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRestaurants();
    setRefreshing(false);
  }, [loadRestaurants]);

  const handleSearch = useCallback(async () => {
    if (searchQuery.trim()) {
      hapticFeedback.light();
      const updatedFilters = { ...filters, query: searchQuery.trim() };
      setFilters(updatedFilters);

      try {
        setLoading(true);
        const data = await fetchRestaurants(updatedFilters);
        setRestaurants(data);
      } catch (error) {
        console.error('Error searching restaurants:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [searchQuery, filters]);

  const handleAddressSelect = (address: any) => {
    setSelectedLocation({
      address: address.place_name,
      coordinates: address.center,
    });

    // Update filters to search near this location
    const updatedFilters = {
      ...filters,
      location: address.center,
      territory: [] // Clear territory filter when using specific location
    };
    setFilters(updatedFilters);

    // Reload restaurants with new location
    loadRestaurants();
  };

  const handleRestaurantPress = (restaurant: UIRestaurant) => {
    hapticFeedback.medium();
    navigation.navigate('RestaurantDetail', { restaurant });
  };

  const handleApplyFilters = async () => {
    hapticFeedback.light();
    setShowFilters(false);
    await loadRestaurants();
  };

  const handleClearFilters = () => {
    hapticFeedback.light();
    setFilters({
      query: searchQuery,
      cuisine_type: [],
      territory: [],
      rating_min: 0,
      discount_min: 0,
      sort_by: 'rating',
    });
  };

  const toggleCuisineFilter = (cuisine: string) => {
    hapticFeedback.selection();
    setFilters(prev => ({
      ...prev,
      cuisine_type: prev.cuisine_type?.includes(cuisine)
        ? prev.cuisine_type.filter(c => c !== cuisine)
        : [...(prev.cuisine_type || []), cuisine]
    }));
  };

  const toggleTerritoryFilter = (territory: string) => {
    hapticFeedback.selection();
    setFilters(prev => ({
      ...prev,
      territory: prev.territory?.includes(territory)
        ? prev.territory.filter(t => t !== territory)
        : [...(prev.territory || []), territory]
    }));
  };

  const renderRestaurantItem = ({ item }: { item: UIRestaurant }) => (
    <RestaurantCard
      restaurant={item}
      onPress={handleRestaurantPress}
      showDistance={true}
    />
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{t('restaurants.filters')}</Text>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Sort By */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>{t('restaurants.sortBy')}</Text>
            {SORT_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterOption,
                  filters.sort_by === option.key && styles.filterOptionSelected
                ]}
                onPress={() => setFilters(prev => ({ ...prev, sort_by: option.key as any }))}
              >
                <Text style={[
                  styles.filterOptionText,
                  filters.sort_by === option.key && styles.filterOptionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Cuisine Types */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>{t('restaurants.cuisine')}</Text>
            <View style={styles.filterGrid}>
              {CUISINE_TYPES.map(cuisine => (
                <TouchableOpacity
                  key={cuisine}
                  style={[
                    styles.filterChip,
                    filters.cuisine_type?.includes(cuisine) && styles.filterChipSelected
                  ]}
                  onPress={() => toggleCuisineFilter(cuisine)}
                >
                  <Text style={[
                    styles.filterChipText,
                    filters.cuisine_type?.includes(cuisine) && styles.filterChipTextSelected
                  ]}>
                    {cuisine}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Areas */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>{t('restaurants.area')}</Text>
            <View style={styles.filterGrid}>
              {TERRITORIES.map(territory => (
                <TouchableOpacity
                  key={territory}
                  style={[
                    styles.filterChip,
                    filters.territory?.includes(territory) && styles.filterChipSelected
                  ]}
                  onPress={() => toggleTerritoryFilter(territory)}
                >
                  <Text style={[
                    styles.filterChipText,
                    filters.territory?.includes(territory) && styles.filterChipTextSelected
                  ]}>
                    {territory}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <Button
            title="Clear All"
            onPress={handleClearFilters}
            variant="secondary"
            style={styles.modalButton}
          />
          <Button
            title="Apply Filters"
            onPress={handleApplyFilters}
            style={styles.modalButton}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('restaurants.title')}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.text.tertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('restaurants.searchPlaceholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter" size={20} color={colors.primary.purple} />
        </TouchableOpacity>
      </View>

      {/* Location Search */}
      <View style={styles.locationContainer}>
        <Ionicons name="pin" size={16} color={colors.text.tertiary} style={styles.locationIcon} />
        <MapboxAddressInput
          onAddressSelect={handleAddressSelect}
          placeholder={t('restaurants.searchLocation')}
          value={selectedLocation?.address}
          style={styles.locationInput}
        />
      </View>

      {/* Results */}
      <FlatList
        data={restaurants}
        renderItem={renderRestaurantItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>{t('restaurants.noResults')}</Text>
              <Text style={styles.emptyText}>{t('restaurants.tryDifferentFilters')}</Text>
            </View>
          ) : null
        }
      />

      {renderFilterModal()}
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body1,
    color: colors.text.primary,
    paddingVertical: spacing.md,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    padding: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    ...typography.h5,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    ...typography.h4,
    color: colors.text.primary,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  modalButton: {
    flex: 1,
  },
  // Filter styles
  filterSection: {
    marginBottom: spacing.xl,
  },
  filterTitle: {
    ...typography.h6,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  filterOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    backgroundColor: colors.background.secondary,
  },
  filterOptionSelected: {
    backgroundColor: colors.primary.purple,
  },
  filterOptionText: {
    ...typography.body2,
    color: colors.text.primary,
  },
  filterOptionTextSelected: {
    color: colors.text.inverse,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  filterChipSelected: {
    backgroundColor: colors.primary.purple,
    borderColor: colors.primary.purple,
  },
  filterChipText: {
    ...typography.caption,
    color: colors.text.primary,
  },
  filterChipTextSelected: {
    color: colors.text.inverse,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.secondary,
  },
  locationIcon: {
    marginRight: spacing.sm,
  },
  locationInput: {
    flex: 1,
  },
});

