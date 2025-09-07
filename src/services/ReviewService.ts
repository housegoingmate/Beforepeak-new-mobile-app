import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

interface PendingReview {
  bookingId: string;
  restaurantId: string;
  restaurantName: string;
  bookingDate: string;
  userId: string;
  createdAt: string;
}

interface ReviewData {
  bookingId: string;
  restaurantId: string;
  rating: number;
  foodQuality: number;
  service: number;
  ambiance: number;
  valueForMoney: number;
  comment?: string;
  privateNotes?: string;
  wouldRecommend: boolean;
}

class ReviewService {
  private static instance: ReviewService;

  static getInstance(): ReviewService {
    if (!ReviewService.instance) {
      ReviewService.instance = new ReviewService();
    }
    return ReviewService.instance;
  }

  async addPendingReview(booking: any): Promise<void> {
    try {
      const pendingReview: PendingReview = {
        bookingId: booking.id,
        restaurantId: booking.restaurant_id,
        restaurantName: booking.restaurant_name,
        bookingDate: booking.date,
        userId: booking.user_id,
        createdAt: new Date().toISOString(),
      };

      // Store locally
      const existing = await this.getPendingReviews();
      const updated = [...existing, pendingReview];
      await AsyncStorage.setItem('pending_reviews', JSON.stringify(updated));

      // Also store in Supabase
      await supabase
        .from('pending_reviews')
        .insert([pendingReview]);

    } catch (error) {
      console.error('Failed to add pending review:', error);
    }
  }

  async getPendingReviews(): Promise<PendingReview[]> {
    try {
      const stored = await AsyncStorage.getItem('pending_reviews');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get pending reviews:', error);
      return [];
    }
  }

  async hasPendingReviews(): Promise<boolean> {
    const pending = await this.getPendingReviews();
    return pending.length > 0;
  }

  async submitReview(reviewData: ReviewData): Promise<boolean> {
    try {
      // Submit review to Supabase
      const { error } = await supabase
        .from('reviews')
        .insert([{
          booking_id: reviewData.bookingId,
          restaurant_id: reviewData.restaurantId,
          overall_rating: reviewData.rating,
          food_quality: reviewData.foodQuality,
          service_rating: reviewData.service,
          ambiance_rating: reviewData.ambiance,
          value_rating: reviewData.valueForMoney,
          comment: reviewData.comment,
          private_notes: reviewData.privateNotes,
          would_recommend: reviewData.wouldRecommend,
          created_at: new Date().toISOString(),
        }]);

      if (error) throw error;

      // Remove from pending reviews
      await this.removePendingReview(reviewData.bookingId);

      // Update restaurant rating
      await this.updateRestaurantRating(reviewData.restaurantId);

      return true;
    } catch (error) {
      console.error('Failed to submit review:', error);
      return false;
    }
  }

  private async removePendingReview(bookingId: string): Promise<void> {
    try {
      // Remove from local storage
      const pending = await this.getPendingReviews();
      const filtered = pending.filter(r => r.bookingId !== bookingId);
      await AsyncStorage.setItem('pending_reviews', JSON.stringify(filtered));

      // Remove from Supabase
      await supabase
        .from('pending_reviews')
        .delete()
        .eq('booking_id', bookingId);

    } catch (error) {
      console.error('Failed to remove pending review:', error);
    }
  }

  private async updateRestaurantRating(restaurantId: string): Promise<void> {
    try {
      // Calculate new average rating
      const { data: reviews } = await supabase
        .from('reviews')
        .select('overall_rating')
        .eq('restaurant_id', restaurantId);

      if (reviews && reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.overall_rating, 0);
        const averageRating = totalRating / reviews.length;

        // Update restaurant rating
        await supabase
          .from('restaurants')
          .update({ 
            rating: averageRating,
            review_count: reviews.length 
          })
          .eq('id', restaurantId);
      }
    } catch (error) {
      console.error('Failed to update restaurant rating:', error);
    }
  }

  async checkMandatoryReview(): Promise<PendingReview | null> {
    const pending = await this.getPendingReviews();
    
    // Return the oldest pending review
    if (pending.length > 0) {
      return pending.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )[0];
    }
    
    return null;
  }

  async shouldBlockNavigation(): Promise<boolean> {
    const pending = await this.getPendingReviews();
    
    // Block navigation if there are pending reviews older than 24 hours
    const now = new Date().getTime();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    return pending.some(review => 
      new Date(review.createdAt).getTime() < oneDayAgo
    );
  }

  async getReviewStats(restaurantId: string): Promise<any> {
    try {
      const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (!reviews || reviews.length === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          aspectRatings: {
            foodQuality: 0,
            service: 0,
            ambiance: 0,
            valueForMoney: 0,
          },
        };
      }

      const totalReviews = reviews.length;
      const averageRating = reviews.reduce((sum, r) => sum + r.overall_rating, 0) / totalReviews;

      const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviews.forEach(review => {
        ratingBreakdown[review.overall_rating as keyof typeof ratingBreakdown]++;
      });

      const aspectRatings = {
        foodQuality: reviews.reduce((sum, r) => sum + (r.food_quality || 0), 0) / totalReviews,
        service: reviews.reduce((sum, r) => sum + (r.service_rating || 0), 0) / totalReviews,
        ambiance: reviews.reduce((sum, r) => sum + (r.ambiance_rating || 0), 0) / totalReviews,
        valueForMoney: reviews.reduce((sum, r) => sum + (r.value_rating || 0), 0) / totalReviews,
      };

      return {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        ratingBreakdown,
        aspectRatings,
        recentReviews: reviews
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5),
      };
    } catch (error) {
      console.error('Failed to get review stats:', error);
      return null;
    }
  }

  async markBookingForReview(bookingId: string): Promise<void> {
    try {
      // Get booking details
      const { data: booking } = await supabase
        .from('bookings')
        .select('*, restaurants(name)')
        .eq('id', bookingId)
        .single();

      if (booking) {
        await this.addPendingReview({
          id: booking.id,
          restaurant_id: booking.restaurant_id,
          restaurant_name: booking.restaurants?.name || 'Unknown Restaurant',
          date: booking.date,
          user_id: booking.user_id,
        });
      }
    } catch (error) {
      console.error('Failed to mark booking for review:', error);
    }
  }
}

export default ReviewService;
