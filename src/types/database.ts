// Database types for BeforePeak mobile app - matching website schema

export interface User {
  id: string;
  auth_id: string | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: 'customer' | 'restaurant_owner' | 'admin' | 'super_admin';
  is_customer: boolean;
  is_restaurant_owner: boolean;
  is_admin: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  last_sign_in_at: string | null;
  is_active: boolean;
  preferred_language: string;
  timezone: string;
  favorite_district: string | null;
  referral_code: string | null;
  referred_by: string | null;
  total_bookings: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface Restaurant {
  id: string;
  owner_id: string | null;
  name: string;
  name_zh?: string;
  description: string | null;
  description_zh?: string;
  cuisine_type: string;
  cuisine_type_zh?: string;
  territory: string;
  address: string;
  address_zh?: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website: string | null;
  image_url: string | null;
  max_party_size: number;
  beverage_required: boolean;
  is_active: boolean;
  is_verified: boolean;
  average_rating: number;
  total_reviews: number;
  discount_percentage?: number;
  created_at: string;
  updated_at: string;
}

export interface TimeWindow {
  id: string;
  restaurant_id: string;
  date: string;
  start_time: string;
  end_time: string;
  discount_percentage: number;
  max_capacity: number;
  current_bookings: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  restaurant_id: string;
  time_window_id: string;
  party_size: number;
  booking_fee: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  special_requests: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  restaurant?: Restaurant;
  time_window?: TimeWindow;
  user?: User;
}

export interface Review {
  id: string;
  booking_id: string;
  user_id: string;
  restaurant_id: string;
  overall_rating: number;
  food_rating: number;
  service_rating: number;
  ambiance_rating: number;
  value_rating: number;
  comment: string | null;
  photos: string[];
  is_verified: boolean;
  restaurant_response: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: User;
  restaurant?: Restaurant;
}

export interface RestaurantPhoto {
  id: string;
  restaurant_id: string;
  public_id: string;
  url: string;
  caption: string | null;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// UI-specific types for mobile app
export interface UIRestaurant extends Restaurant {
  distance?: number;
  next_available_time?: string;
  available_slots?: number;
  photos?: RestaurantPhoto[];
  reviews?: Review[];
  is_favorite?: boolean;
}

export interface AvailabilitySlot {
  id: string;
  time: string;
  discount_percentage: number;
  available_count: number;
  max_capacity: number;
  is_available: boolean;
}

export interface DayAvailability {
  date: string;
  day_name: string;
  is_today: boolean;
  is_tomorrow: boolean;
  closed: boolean;
  slots: AvailabilitySlot[];
}

// Search and filter types
export interface SearchFilters {
  query?: string;
  cuisine_type?: string[];
  territory?: string[];
  price_range?: string[];
  rating_min?: number;
  discount_min?: number;
  party_size?: number;
  date?: string;
  time?: string;
  sort_by?: 'distance' | 'rating' | 'discount' | 'price' | 'newest';
  location?: {
    latitude: number;
    longitude: number;
  };
}

// Booking flow types
export interface BookingRequest {
  restaurant_id: string;
  time_window_id: string;
  party_size: number;
  special_requests?: string;
}

export interface PaymentRequest {
  booking_id: string;
  amount: number;
  currency: string;
  payment_method: 'payme' | 'credit_card' | 'alipay' | 'wechat_pay';
}

// Location types
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  district?: string;
}

// Notification types
export interface Notification {
  id: string;
  user_id: string;
  type: 'booking_confirmed' | 'booking_reminder' | 'review_request' | 'promotion';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
}
