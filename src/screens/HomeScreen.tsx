import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { RestaurantCard } from '../components/restaurant/RestaurantCard';
import { Button } from '../components/ui/Button';
import { colors, typography, spacing, borderRadius, commonStyles } from '../theme';
import { UIRestaurant } from '../types/database';
import { fetchPopularRestaurants, fetchNearbyRestaurants, fetchDistinctTerritories, fetchDistinctDistricts, fetchTopRatedRestaurants, fetchMostReviewedRestaurants, fetchNewThisWeekRestaurants, fetchTonightOnlyRestaurants, fetchFillingFastRestaurants } from '../services/restaurants';
import { hapticFeedback } from '../utils/haptics';
import { supabase } from '../lib/supabase';
import { toggleFavorite } from '../services/FavoritesService';
// Optional app logo (drop file at mobile-app/beforepeak/assets/beforepeak-logo.png)
let logoSource: any | null = null;
try {
  // Keep path static for Metro bundler
  // @ts-ignore - asset may not exist yet
  logoSource = require('../../assets/beforepeak-logo.png');
} catch (e) {
  logoSource = null;
}


export const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [popularRestaurants, setPopularRestaurants] = useState<UIRestaurant[]>([]);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<UIRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [territoryOptions, setTerritoryOptions] = useState<string[]>([]);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [topRated, setTopRated] = useState<UIRestaurant[]>([]);
  const [mostReviewed, setMostReviewed] = useState<UIRestaurant[]>([]);
  const [newThisWeek, setNewThisWeek] = useState<UIRestaurant[]>([]);
  const [tonightOnly, setTonightOnly] = useState<UIRestaurant[]>([]);
  const [fillingFast, setFillingFast] = useState<UIRestaurant[]>([]);


  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) setIsAuthed(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (mounted) setIsAuthed(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadData = async () => {
    try {
      const [popular, nearby, terr, dist, top, most, recent, tonight, fast] = await Promise.all([
        fetchPopularRestaurants(),
        fetchNearbyRestaurants(22.3193, 114.1694), // Hong Kong coordinates
        fetchDistinctTerritories(),
        fetchDistinctDistricts(),
        fetchTopRatedRestaurants(8),
        fetchMostReviewedRestaurants(8),
        fetchNewThisWeekRestaurants(8),
        fetchTonightOnlyRestaurants(8),
        fetchFillingFastRestaurants(8),
      ]);

      setPopularRestaurants(popular.slice(0, 5));
      setNearbyRestaurants(nearby.slice(0, 5));
      setTerritoryOptions(terr);
      setDistrictOptions(dist);
      setTopRated(top);
      setMostReviewed(most);
      setNewThisWeek(recent);
      setTonightOnly(tonight);
      setFillingFast(fast);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSearch = () => {
    hapticFeedback.light();
    navigation.navigate('Restaurants', { searchQuery });
  };

  const handleRestaurantPress = (restaurant: UIRestaurant) => {
    hapticFeedback.medium();
    navigation.navigate('RestaurantDetail', { restaurant });
  };

  const handleViewAllPopular = () => {
    hapticFeedback.light();
    navigation.navigate('Restaurants', { sortBy: 'rating' });
  };

  const handleViewAllNearby = () => {
    hapticFeedback.light();
    navigation.navigate('Restaurants', { sortBy: 'distance' });
  };

  const handleGetRecommendation = () => {
    hapticFeedback.light();
    navigation.navigate('Restaurants', { showRecommendations: true });
  };

  // Quick filter helpers
  const handleTerritorySelect = (territory: string) => {
    hapticFeedback.selection();
    navigation.navigate('Restaurants', { territory });
  };
  const handleDistrictSelect = (district: string) => {
    hapticFeedback.selection();
    navigation.navigate('Restaurants', { district });
  };

  // Favorites
  const handleToggleFavorite = async (restaurantId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return navigation.navigate('Auth' as never);
    try {
      const newState = await toggleFavorite(restaurantId);
      const toggleOnList = (list: UIRestaurant[]) =>
        list.map(r => (r.id === restaurantId ? { ...r, is_favorite: newState } : r));
      setPopularRestaurants(prev => toggleOnList(prev));
      setNearbyRestaurants(prev => toggleOnList(prev));
      setTopRated(prev => toggleOnList(prev));
      setMostReviewed(prev => toggleOnList(prev));
      setNewThisWeek(prev => toggleOnList(prev));
      setTonightOnly(prev => toggleOnList(prev));
      setFillingFast(prev => toggleOnList(prev));
    } catch (e) {
      console.warn('toggle favorite failed', e);
    }
  };

  const renderRestaurantItem = ({ item }: { item: UIRestaurant }) => (
    <View style={styles.restaurantItem}>
      <RestaurantCard
        restaurant={item}
        onPress={handleRestaurantPress}
        onFavorite={handleToggleFavorite}
        showDistance={true}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          {!isAuthed && (
            <TouchableOpacity style={styles.authButton} onPress={() => navigation.navigate('Auth')}>
              <Text style={styles.authButtonText}>Sign In / Sign Up</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.title}>{t('home.title')}</Text>
          <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={colors.text.tertiary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('home.searchPlaceholder')}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
          <Button
            title={t('common.search')}
            onPress={handleSearch}
            size="medium"
            style={styles.searchButton}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={handleGetRecommendation}>
            <Ionicons name="star" size={24} color={colors.primary.purple} />
            <Text style={styles.quickActionText}>{t('home.getRecommendation')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction} onPress={handleViewAllNearby}>
            <Ionicons name="pin" size={24} color={colors.primary.purple} />
            <Text style={styles.quickActionText}>Nearby</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction} onPress={handleViewAllPopular}>
            <Ionicons name="trending-up" size={24} color={colors.primary.purple} />
            <Text style={styles.quickActionText}>Popular</Text>
          </TouchableOpacity>
        </View>

        {/* Promo banner */}
        <View style={styles.promoBanner}>
          <View style={styles.promoLeft}>
            <View style={styles.logoBadge}>
              {logoSource ? (
                <Image source={logoSource} style={styles.logoImage} resizeMode="contain" />
              ) : (
                <Ionicons name="restaurant" size={18} color={colors.text.inverse} />
              )}
            </View>
            <View>
              <Text style={styles.promoTitle}>Up to 50% OFF</Text>
              <Text style={styles.promoSubtitle}>during non-peak hours</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.promoCta}
            onPress={() => navigation.navigate('Restaurants', { sortBy: 'discount' })}
          >
            <Text style={styles.promoCtaText}>Explore deals</Text>
          </TouchableOpacity>
            <View style={styles.trustRow}>
              <Ionicons name="wallet" size={16} color={colors.text.inverse} />
              <Text style={styles.trustText}> PayMe ready</Text>
            </View>

        </View>
        {/* How it works */}
        <View style={styles.sectionCompact}>
          <View style={styles.howRow}>
            <View style={styles.howItem}>
              <Ionicons name="search" size={18} color={colors.primary.purple} />
              <Text style={styles.howText}>Find a non-peak slot</Text>
            </View>
            <View style={styles.howItem}>
              <Ionicons name="pricetag" size={18} color={colors.primary.purple} />
              <Text style={styles.howText}>Enjoy up to 50% off</Text>
            </View>
            <View style={styles.howItem}>
              <Ionicons name="card" size={18} color={colors.primary.purple} />
              <Text style={styles.howText}>Book with small fee</Text>
            </View>
          </View>

        {/* Tonight only */}
        {tonightOnly.length > 0 && (
          <View className="section" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tonight only</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Restaurants', { date: new Date().toISOString().split('T')[0] })}>
                <Text style={styles.viewAllText}>{t('home.viewAll')}</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={tonightOnly}
              renderItem={renderRestaurantItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Filling fast */}
        {fillingFast.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Filling fast</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Restaurants', { sortBy: 'discount' })}>
                <Text style={styles.viewAllText}>{t('home.viewAll')}</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={fillingFast}
              renderItem={renderRestaurantItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Top rated */}
        {topRated.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top rated</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Restaurants', { sortBy: 'rating' })}>
                <Text style={styles.viewAllText}>{t('home.viewAll')}</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={topRated}
              renderItem={renderRestaurantItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Most reviewed */}
        {mostReviewed.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Most reviewed</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Restaurants', { sortBy: 'rating' })}>
                <Text style={styles.viewAllText}>{t('home.viewAll')}</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={mostReviewed}
              renderItem={renderRestaurantItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* New this week */}
        {newThisWeek.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>New this week</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Restaurants', { sortBy: 'newest' })}>
                <Text style={styles.viewAllText}>{t('home.viewAll')}</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={newThisWeek}
              renderItem={renderRestaurantItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}


        {/* Quick Filters */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Filters</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            <TouchableOpacity style={styles.chip} onPress={handleViewAllNearby}>
              <Text style={styles.chipText}>Near me</Text>
            </TouchableOpacity>
            {(territoryOptions.length ? territoryOptions : ['Hong Kong Island','Kowloon','New Territories']).map(t => (
              <TouchableOpacity key={t} style={styles.chip} onPress={() => handleTerritorySelect(t)}>
                <Text style={styles.chipText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRowSecondary}>
            {(districtOptions.length ? districtOptions.slice(0, 12) : ['Central','Tsim Sha Tsui','Mong Kok','Causeway Bay','Wan Chai','Sha Tin','Yuen Long','Tuen Mun']).map(d => (
              <TouchableOpacity key={d} style={styles.chipSecondary} onPress={() => handleDistrictSelect(d)}>
                <Text style={styles.chipSecondaryText}>{d}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>


        {/* Popular Restaurants */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.popularRestaurants')}</Text>
            <TouchableOpacity onPress={handleViewAllPopular}>
              <Text style={styles.viewAllText}>{t('home.viewAll')}</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={popularRestaurants}
            renderItem={renderRestaurantItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Nearby Restaurants */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.nearbyRestaurants')}</Text>
            <TouchableOpacity onPress={handleViewAllNearby}>
              <Text style={styles.viewAllText}>{t('home.viewAll')}</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={nearbyRestaurants}
            renderItem={renderRestaurantItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.primary.purple,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  promoBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.primary.purple50,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary.purple,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },

  promoTitle: {
    ...typography.h5,
    color: colors.primary.purple,
    fontWeight: '800',
  },
  promoSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  promoCta: {
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary.purple,
    borderRadius: borderRadius.md,
  },
  promoCtaText: {
    ...typography.caption,
    color: colors.text.inverse,
    fontWeight: '700',
  },
  chipsRow: {
    paddingLeft: spacing.lg,
    paddingBottom: spacing.sm,
  },
  chipsRowSecondary: {
    paddingLeft: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  chipText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
  },
  chipSecondary: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  chipSecondaryText: {
    ...typography.caption,
    color: colors.text.secondary,
  },

  authButton: {
    position: 'absolute',
    right: spacing.lg,
    top: spacing.sm,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary.purple,
    backgroundColor: colors.background.primary,
  },
  authButtonText: {
    ...typography.caption,
    color: colors.primary.purple,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
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
  searchButton: {
    paddingHorizontal: spacing.lg,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  quickAction: {
    alignItems: 'center',
    padding: spacing.md,
  },
  quickActionText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
  },
  viewAllText: {
    ...typography.body2,
    color: colors.primary.purple,
    fontWeight: '600',
  },
  horizontalList: {
    paddingLeft: spacing.lg,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  trustText: {
    ...typography.caption,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  sectionCompact: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  howRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  howItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  howText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  learnMoreText: {
    ...typography.caption,
    color: colors.primary.purple,
    fontWeight: '600',
  },
  restaurantItem: {
    marginRight: spacing.md,
    width: 280,
  },
});

