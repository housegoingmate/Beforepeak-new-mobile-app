import { supabase } from '../lib/supabase';
import { Booking, BookingRequest, PaymentRequest } from '../types/database';

// Create a new booking
export const createBooking = async (bookingRequest: BookingRequest): Promise<Booking | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get user profile
    const { data: userProfile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // Calculate booking fee based on party size
    const bookingFee = calculateBookingFee(bookingRequest.party_size);

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        user_id: userProfile.id,
        restaurant_id: bookingRequest.restaurant_id,
        time_window_id: bookingRequest.time_window_id,
        party_size: bookingRequest.party_size,
        booking_fee: bookingFee,
        special_requests: bookingRequest.special_requests,
        status: 'pending',
      })
      .select(`
        *,
        restaurant:restaurants(*),
        time_window:time_windows(*),
        user:users(*)
      `)
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      return null;
    }

    // Update time window current bookings
    await supabase.rpc('increment_booking_count', {
      time_window_id: bookingRequest.time_window_id,
      increment: bookingRequest.party_size,
    });

    return data;
  } catch (error) {
    console.error('Error in createBooking:', error);
    return null;
  }
};

// Fetch user bookings
export const fetchUserBookings = async (): Promise<Booking[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    // Get user profile
    const { data: userProfile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (!userProfile) {
      return [];
    }

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        restaurant:restaurants(*),
        time_window:time_windows(*)
      `)
      .eq('user_id', userProfile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchUserBookings:', error);
    return [];
  }
};

// Fetch single booking
export const fetchBooking = async (bookingId: string): Promise<Booking | null> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        restaurant:restaurants(*),
        time_window:time_windows(*),
        user:users(*)
      `)
      .eq('id', bookingId)
      .single();

    if (error) {
      console.error('Error fetching booking:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in fetchBooking:', error);
    return null;
  }
};

// Cancel booking
export const cancelBooking = async (bookingId: string): Promise<boolean> => {
  try {
    const { data: booking } = await supabase
      .from('bookings')
      .select('time_window_id, party_size')
      .eq('id', bookingId)
      .single();

    if (!booking) {
      return false;
    }

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (error) {
      console.error('Error cancelling booking:', error);
      return false;
    }

    // Update time window current bookings
    await supabase.rpc('increment_booking_count', {
      time_window_id: booking.time_window_id,
      increment: -booking.party_size,
    });

    return true;
  } catch (error) {
    console.error('Error in cancelBooking:', error);
    return false;
  }
};

// Process payment for booking
export const processPayment = async (paymentRequest: PaymentRequest): Promise<boolean> => {
  try {
    // For now, we'll simulate payment processing
    // In a real app, you would integrate with PayMe or other payment providers
    
    // Update booking status to confirmed
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', paymentRequest.booking_id);

    if (error) {
      console.error('Error processing payment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in processPayment:', error);
    return false;
  }
};

// Calculate booking fee based on party size
const calculateBookingFee = (partySize: number): number => {
  const fees = {
    2: 50,
    3: 70,
    4: 80,
    5: 100,
    6: 120,
  };
  
  return fees[partySize as keyof typeof fees] || 50;
};

// Get upcoming bookings
export const fetchUpcomingBookings = async (): Promise<Booking[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    // Get user profile
    const { data: userProfile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (!userProfile) {
      return [];
    }

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        restaurant:restaurants(*),
        time_window:time_windows(*)
      `)
      .eq('user_id', userProfile.id)
      .in('status', ['confirmed', 'pending'])
      .gte('time_windows.date', today)
      .order('time_windows.date')
      .order('time_windows.start_time');

    if (error) {
      console.error('Error fetching upcoming bookings:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchUpcomingBookings:', error);
    return [];
  }
};

// Get booking history
export const fetchBookingHistory = async (): Promise<Booking[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    // Get user profile
    const { data: userProfile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (!userProfile) {
      return [];
    }

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        restaurant:restaurants(*),
        time_window:time_windows(*)
      `)
      .eq('user_id', userProfile.id)
      .or(`status.eq.completed,status.eq.cancelled,time_windows.date.lt.${today}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching booking history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchBookingHistory:', error);
    return [];
  }
};
