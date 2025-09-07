// Formatting utilities for the mobile app

// Format currency for Hong Kong
export const formatCurrency = (amount: number): string => {
  return `HK$${amount.toFixed(0)}`;
};

// Format discount percentage
export const formatDiscount = (percentage: number): string => {
  return `${percentage}% OFF`;
};

// Format rating
export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

// Format review count
export const formatReviewCount = (count: number): string => {
  if (count === 0) return 'No reviews';
  if (count === 1) return '1 review';
  if (count < 1000) return `${count} reviews`;
  return `${(count / 1000).toFixed(1)}k reviews`;
};

// Format distance
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

// Format time
export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const minute = parseInt(minutes, 10);
  
  if (hour === 0) {
    return `12:${minute.toString().padStart(2, '0')} AM`;
  } else if (hour < 12) {
    return `${hour}:${minute.toString().padStart(2, '0')} AM`;
  } else if (hour === 12) {
    return `12:${minute.toString().padStart(2, '0')} PM`;
  } else {
    return `${hour - 12}:${minute.toString().padStart(2, '0')} PM`;
  }
};

// Format date
export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Check if it's today
  if (d.toDateString() === today.toDateString()) {
    return 'Today';
  }

  // Check if it's tomorrow
  if (d.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }

  // Format as day of week for this week
  const daysDiff = Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff >= 0 && daysDiff < 7) {
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  }

  // Format as date
  return d.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return d.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

// Format phone number for Hong Kong
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Hong Kong phone number formatting
  if (digits.startsWith('852')) {
    const number = digits.substring(3);
    if (number.length === 8) {
      return `+852 ${number.substring(0, 4)} ${number.substring(4)}`;
    }
  }
  
  if (digits.length === 8) {
    return `${digits.substring(0, 4)} ${digits.substring(4)}`;
  }
  
  return phone;
};
