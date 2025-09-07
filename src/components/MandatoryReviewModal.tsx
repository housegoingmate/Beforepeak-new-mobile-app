import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import ReviewService from '../services/ReviewService';

interface MandatoryReviewModalProps {
  visible: boolean;
  pendingReview: {
    bookingId: string;
    restaurantId: string;
    restaurantName: string;
    bookingDate: string;
  } | null;
  onComplete: () => void;
}

export const MandatoryReviewModal: React.FC<MandatoryReviewModalProps> = ({
  visible,
  pendingReview,
  onComplete,
}) => {
  const { t } = useTranslation();
  const [ratings, setRatings] = useState({
    overall: 0,
    foodQuality: 0,
    service: 0,
    ambiance: 0,
    valueForMoney: 0,
  });
  const [comment, setComment] = useState('');
  const [privateNotes, setPrivateNotes] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const StarRating = ({ 
    rating, 
    onRatingChange, 
    label 
  }: { 
    rating: number; 
    onRatingChange: (rating: number) => void; 
    label: string;
  }) => (
    <View style={styles.ratingRow}>
      <Text style={styles.ratingLabel}>{label}</Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onRatingChange(star)}
            style={styles.starButton}
          >
            <Text style={[
              styles.star,
              { color: star <= rating ? '#FFD700' : '#DDD' }
            ]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const handleSubmit = async () => {
    if (!pendingReview) return;

    // Validate required fields
    if (ratings.overall === 0) {
      Alert.alert('Required', 'Please provide an overall rating');
      return;
    }

    if (wouldRecommend === null) {
      Alert.alert('Required', 'Please indicate if you would recommend this restaurant');
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        bookingId: pendingReview.bookingId,
        restaurantId: pendingReview.restaurantId,
        rating: ratings.overall,
        foodQuality: ratings.foodQuality || ratings.overall,
        service: ratings.service || ratings.overall,
        ambiance: ratings.ambiance || ratings.overall,
        valueForMoney: ratings.valueForMoney || ratings.overall,
        comment: comment.trim(),
        privateNotes: privateNotes.trim(),
        wouldRecommend,
      };

      const success = await ReviewService.getInstance().submitReview(reviewData);

      if (success) {
        Alert.alert(
          'Thank you!',
          'Your review has been submitted successfully.',
          [{ text: 'OK', onPress: onComplete }]
        );
      } else {
        Alert.alert('Error', 'Failed to submit review. Please try again.');
      }
    } catch (error) {
      console.error('Review submission error:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRatings({
      overall: 0,
      foodQuality: 0,
      service: 0,
      ambiance: 0,
      valueForMoney: 0,
    });
    setComment('');
    setPrivateNotes('');
    setWouldRecommend(null);
  };

  if (!pendingReview) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {}} // Prevent dismissal
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Review Required</Text>
          <Text style={styles.subtitle}>
            Please review your recent visit to {pendingReview.restaurantName}
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overall Rating *</Text>
            <StarRating
              rating={ratings.overall}
              onRatingChange={(rating) => setRatings(prev => ({ ...prev, overall: rating }))}
              label=""
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detailed Ratings</Text>
            <StarRating
              rating={ratings.foodQuality}
              onRatingChange={(rating) => setRatings(prev => ({ ...prev, foodQuality: rating }))}
              label="Food Quality"
            />
            <StarRating
              rating={ratings.service}
              onRatingChange={(rating) => setRatings(prev => ({ ...prev, service: rating }))}
              label="Service"
            />
            <StarRating
              rating={ratings.ambiance}
              onRatingChange={(rating) => setRatings(prev => ({ ...prev, ambiance: rating }))}
              label="Ambiance"
            />
            <StarRating
              rating={ratings.valueForMoney}
              onRatingChange={(rating) => setRatings(prev => ({ ...prev, valueForMoney: rating }))}
              label="Value for Money"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Would you recommend this restaurant? *</Text>
            <View style={styles.recommendContainer}>
              <TouchableOpacity
                style={[
                  styles.recommendButton,
                  wouldRecommend === true && styles.recommendButtonActive
                ]}
                onPress={() => setWouldRecommend(true)}
              >
                <Text style={[
                  styles.recommendButtonText,
                  wouldRecommend === true && styles.recommendButtonTextActive
                ]}>
                  Yes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.recommendButton,
                  wouldRecommend === false && styles.recommendButtonActive
                ]}
                onPress={() => setWouldRecommend(false)}
              >
                <Text style={[
                  styles.recommendButtonText,
                  wouldRecommend === false && styles.recommendButtonTextActive
                ]}>
                  No
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Public Comment</Text>
            <TextInput
              style={styles.textInput}
              value={comment}
              onChangeText={setComment}
              placeholder="Share your experience with other diners..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Private Notes (Restaurant Only)</Text>
            <TextInput
              style={styles.textInput}
              value={privateNotes}
              onChangeText={setPrivateNotes}
              placeholder="Private feedback for the restaurant..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.footerNote}>
            * Required fields. You must complete this review to continue using the app.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  starButton: {
    padding: 4,
  },
  star: {
    fontSize: 24,
  },
  recommendContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  recommendButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  recommendButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  recommendButtonText: {
    fontSize: 16,
    color: '#666',
  },
  recommendButtonTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 80,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footerNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
