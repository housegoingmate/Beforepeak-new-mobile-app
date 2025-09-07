import { supabase } from '../lib/supabase';
import { UIRestaurant, SearchFilters, DayAvailability, AvailabilitySlot } from '../types/database';

// Fetch restaurants with filters
export const fetchRestaurants = async (filters: SearchFilters = {}): Promise<UIRestaurant[]> => {
  try {
    let query = supabase
      .from('restaurants')
      .select(`
        *,
        restaurant_photos (
          id,
          url,
          caption,
          is_featured,
          display_order
        )
      `)
      .eq('is_active', true)
      .eq('is_verified', true);

    // Apply filters
    if (filters.cuisine_type && filters.cuisine_type.length > 0) {
      query = query.in('cuisine_type', filters.cuisine_type);
    }

    if (filters.territory && filters.territory.length > 0) {
      query = query.in('territory', filters.territory);
    }

    if (filters.rating_min) {
      query = query.gte('average_rating', filters.rating_min);
    }

    if (filters.query) {
      query = query.or(`name.ilike.%${filters.query}%,description.ilike.%${filters.query}%,cuisine_type.ilike.%${filters.query}%`);
    }

    // Sort
    switch (filters.sort_by) {
      case 'rating':
        query = query.order('average_rating', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      default:
        query = query.order('average_rating', { ascending: false });
    }

    const { data, error } = await query.limit(20);

    if (error) {
      console.error('Error fetching restaurants:', error);
      return [];
    }

    // Transform data for UI
    const restaurants: UIRestaurant[] = (data || []).map(restaurant => ({
      ...restaurant,
      photos: restaurant.restaurant_photos || [],
      distance: filters.location ? calculateDistance(
        filters.location.latitude,
        filters.location.longitude,
        restaurant.latitude,
        restaurant.longitude
      ) : undefined,
    }));

    return restaurants;
  } catch (error) {
    console.error('Error in fetchRestaurants:', error);
    return [];
  }
};

// Fetch single restaurant details
export const fetchRestaurant = async (id: string): Promise<UIRestaurant | null> => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select(`
        *,
        restaurant_photos (
          id,
          url,
          caption,
          is_featured,
          display_order
        ),
        reviews (
          id,
          overall_rating,
          food_rating,
          service_rating,
          ambiance_rating,
          value_rating,
          comment,
          created_at,
          users (
            first_name,
            last_name,
            avatar_url
          )
        )
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching restaurant:', error);
      return null;
    }

    return {
      ...data,
      photos: data.restaurant_photos || [],
      reviews: data.reviews || [],
    };
  } catch (error) {
    console.error('Error in fetchRestaurant:', error);
    return null;
  }
};

// Fetch restaurant availability
export const fetchRestaurantAvailability = async (
  restaurantId: string,
  days: number = 7
): Promise<DayAvailability[]> => {
  try {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + days);

    const { data, error } = await supabase
      .from('time_windows')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date')
      .order('start_time');

    if (error) {
      console.error('Error fetching availability:', error);
      return [];
    }

    // Group by date and transform to UI format
    const availabilityMap = new Map<string, AvailabilitySlot[]>();
    
    (data || []).forEach(timeWindow => {
      const slots = availabilityMap.get(timeWindow.date) || [];
      slots.push({
        id: timeWindow.id,
        time: timeWindow.start_time,
        discount_percentage: timeWindow.discount_percentage,
        available_count: timeWindow.max_capacity - timeWindow.current_bookings,
        max_capacity: timeWindow.max_capacity,
        is_available: timeWindow.current_bookings < timeWindow.max_capacity,
      });
      availabilityMap.set(timeWindow.date, slots);
    });

    // Create day availability array
    const availability: DayAvailability[] = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      availability.push({
        date: dateString,
        day_name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        is_today: i === 0,
        is_tomorrow: i === 1,
        closed: !availabilityMap.has(dateString),
        slots: availabilityMap.get(dateString) || [],
      });
    }

    return availability;
  } catch (error) {
    console.error('Error in fetchRestaurantAvailability:', error);
    return [];
  }
};

// Calculate distance between two coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in kilometers
  return Math.round(d * 10) / 10; // Round to 1 decimal place
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

// Get popular restaurants
export const fetchPopularRestaurants = async (): Promise<UIRestaurant[]> => {
  return fetchRestaurants({
    sort_by: 'rating',
  });
};

// Get nearby restaurants
export const fetchNearbyRestaurants = async (
  latitude: number,
  longitude: number
): Promise<UIRestaurant[]> => {
  return fetchRestaurants({
    location: { latitude, longitude },
    sort_by: 'distance',
  });
};

// Search restaurants
export const searchRestaurants = async (query: string): Promise<UIRestaurant[]> => {
  return fetchRestaurants({
    query,
  });
};
