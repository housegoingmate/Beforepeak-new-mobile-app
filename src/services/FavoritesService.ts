import { supabase } from '../lib/supabase';
import { UIRestaurant } from '../types/database';

// Simple Favorites service with graceful fallback for table name
// Preferred table: favorites (id, user_id, restaurant_id, created_at)
// Fallback table: user_favorites (user_id, restaurant_id, created_at)

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

async function tableExists(table: string): Promise<boolean> {
  try {
    const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
    return !error;
  } catch {
    return false;
  }
}

async function getTable(): Promise<string> {
  if (await tableExists('favorites')) return 'favorites';
  if (await tableExists('user_favorites')) return 'user_favorites';
  // Default to favorites; RLS may prevent select head in dev environments
  return 'favorites';
}

export async function isFavorite(restaurant_id: string): Promise<boolean> {
  const user_id = await getUserId();
  if (!user_id) return false;
  const table = await getTable();
  const { data, error } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: false })
    .eq('user_id', user_id)
    .eq('restaurant_id', restaurant_id)
    .limit(1);
  if (error) {
    console.warn('isFavorite error', error);
    return false;
  }
  return (data?.length ?? 0) > 0;
}

export async function toggleFavorite(restaurant_id: string): Promise<boolean> {
  const user_id = await getUserId();
  if (!user_id) throw new Error('Not authenticated');
  const table = await getTable();

  const already = await isFavorite(restaurant_id);
  if (already) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('user_id', user_id)
      .eq('restaurant_id', restaurant_id);
    if (error) throw error;
    return false;
  } else {
    const { error } = await supabase
      .from(table)
      .insert([{ user_id, restaurant_id }]);
    if (error) throw error;
    return true;
  }
}

export async function listFavoriteRestaurants(): Promise<UIRestaurant[]> {
  const user_id = await getUserId();
  if (!user_id) return [];
  const table = await getTable();

  // Join favorites -> restaurants
  const { data, error } = await supabase
    .from(table)
    .select('restaurant_id, restaurants(*)')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('listFavoriteRestaurants error', error);
    return [];
  }
  const restaurants: UIRestaurant[] = (data || [])
    .map((row: any) => ({ ...(row.restaurants || {}), is_favorite: true }))
    .filter((r: any) => r && r.id);
  return restaurants;
}

