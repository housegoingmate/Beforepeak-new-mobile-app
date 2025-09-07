import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert, Linking } from 'react-native';

interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'booking_reminder' | 'review_request' | 'promotion' | 'general';
  data?: any;
  scheduledTime?: Date;
}

class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Request permissions
      await this.requestPermissions();
      
      // Initialize notification handlers
      this.setupNotificationHandlers();
      
      this.isInitialized = true;
      console.log('NotificationService initialized');
    } catch (error) {
      console.error('Failed to initialize NotificationService:', error);
    }
  }

  private async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        // For iOS, we'll use a simple alert-based system for now
        // In production, you'd integrate with Firebase or APNs
        return true;
      } else {
        // For Android, similar approach
        return true;
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  private setupNotificationHandlers(): void {
    // Handle notification taps
    // In production, integrate with react-native-push-notification or Firebase
  }

  async scheduleBookingReminder(bookingId: string, restaurantName: string, bookingTime: Date): Promise<void> {
    const reminderTime = new Date(bookingTime.getTime() - 2 * 60 * 60 * 1000); // 2 hours before
    
    const notification: NotificationData = {
      id: `booking_reminder_${bookingId}`,
      title: 'Booking Reminder',
      message: `Your booking at ${restaurantName} is in 2 hours`,
      type: 'booking_reminder',
      data: { bookingId, restaurantName },
      scheduledTime: reminderTime,
    };

    await this.scheduleNotification(notification);
  }

  async scheduleReviewRequest(bookingId: string, restaurantName: string): Promise<void> {
    // Schedule review request for 1 hour after booking time
    const reviewTime = new Date(Date.now() + 60 * 60 * 1000);
    
    const notification: NotificationData = {
      id: `review_request_${bookingId}`,
      title: 'How was your experience?',
      message: `Please rate your visit to ${restaurantName}`,
      type: 'review_request',
      data: { bookingId, restaurantName },
      scheduledTime: reviewTime,
    };

    await this.scheduleNotification(notification);
  }

  private async scheduleNotification(notification: NotificationData): Promise<void> {
    try {
      // Store notification for later processing
      const storedNotifications = await this.getStoredNotifications();
      storedNotifications.push(notification);
      
      await AsyncStorage.setItem(
        'scheduled_notifications',
        JSON.stringify(storedNotifications)
      );

      // For now, we'll use a simple timeout-based system
      // In production, use proper push notification scheduling
      if (notification.scheduledTime) {
        const delay = notification.scheduledTime.getTime() - Date.now();
        if (delay > 0) {
          setTimeout(() => {
            this.showLocalNotification(notification);
          }, delay);
        }
      }
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  }

  private async showLocalNotification(notification: NotificationData): Promise<void> {
    // For development, use Alert
    // In production, use proper push notifications
    Alert.alert(
      notification.title,
      notification.message,
      [
        { text: 'Dismiss', style: 'cancel' },
        {
          text: 'View',
          onPress: () => this.handleNotificationTap(notification),
        },
      ]
    );
  }

  private handleNotificationTap(notification: NotificationData): void {
    switch (notification.type) {
      case 'booking_reminder':
        // Navigate to booking details
        console.log('Navigate to booking:', notification.data.bookingId);
        break;
      case 'review_request':
        // Navigate to review screen
        console.log('Navigate to review:', notification.data.bookingId);
        break;
      default:
        break;
    }
  }

  private async getStoredNotifications(): Promise<NotificationData[]> {
    try {
      const stored = await AsyncStorage.getItem('scheduled_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get stored notifications:', error);
      return [];
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      const storedNotifications = await this.getStoredNotifications();
      const filtered = storedNotifications.filter(n => n.id !== notificationId);
      
      await AsyncStorage.setItem(
        'scheduled_notifications',
        JSON.stringify(filtered)
      );
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  async sendBookingConfirmation(bookingDetails: any): Promise<void> {
    // Send email notification via EmailJS (same as web)
    try {
      const emailData = {
        to_email: bookingDetails.userEmail,
        restaurant_name: bookingDetails.restaurantName,
        booking_date: bookingDetails.date,
        booking_time: bookingDetails.time,
        party_size: bookingDetails.partySize,
        booking_id: bookingDetails.id,
      };

      // In production, integrate with EmailJS or your email service
      console.log('Sending booking confirmation email:', emailData);
      
      // Also schedule local reminder
      await this.scheduleBookingReminder(
        bookingDetails.id,
        bookingDetails.restaurantName,
        new Date(bookingDetails.dateTime)
      );
    } catch (error) {
      console.error('Failed to send booking confirmation:', error);
    }
  }

  async checkPendingReviews(): Promise<void> {
    // Check if user has pending reviews and show notification
    try {
      const pendingReviews = await AsyncStorage.getItem('pending_reviews');
      if (pendingReviews) {
        const reviews = JSON.parse(pendingReviews);
        if (reviews.length > 0) {
          Alert.alert(
            'Pending Reviews',
            `You have ${reviews.length} restaurant(s) waiting for your review`,
            [
              { text: 'Later', style: 'cancel' },
              { text: 'Review Now', onPress: () => console.log('Navigate to reviews') },
            ]
          );
        }
      }
    } catch (error) {
      console.error('Failed to check pending reviews:', error);
    }
  }
}

export default NotificationService;
