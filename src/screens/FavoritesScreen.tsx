import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { RestaurantCard } from '../components/restaurant/RestaurantCard';
import { colors, typography, spacing, commonStyles } from '../theme';
import { UIRestaurant } from '../types/database';
import { listFavoriteRestaurants, toggleFavorite } from '../services/FavoritesService';

export default function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const [favorites, setFavorites] = useState<UIRestaurant[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const data = await listFavoriteRestaurants();
    setFavorites(data);
  };

  useEffect(() => { load(); }, []);
  useFocusEffect(useCallback(() => { load(); }, []));

  const onFavorite = async (restaurantId: string) => {
    const newState = await toggleFavorite(restaurantId);
    setFavorites(prev => prev.filter(r => (newState ? true : r.id !== restaurantId))
      .map(r => (r.id === restaurantId ? { ...r, is_favorite: newState } : r)));
    if (!newState) {
      // If unfavorited, also remove from the list
      setFavorites(prev => prev.filter(r => r.id !== restaurantId));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>My Favorites</Text></View>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
            <RestaurantCard restaurant={item} onPress={(r)=>navigation.navigate('RestaurantDetail',{restaurant:r})} onFavorite={onFavorite} />
          </View>
        )}
        contentContainerStyle={{ paddingVertical: spacing.lg }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async()=>{setRefreshing(true); await load(); setRefreshing(false);}} />}
        ListEmptyComponent={<Text style={styles.empty}>No favorites yet</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { ...commonStyles.container },
  header: { padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border.light },
  title: { ...typography.h4, color: colors.text.primary },
  empty: { ...typography.body2, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.xl },
});

