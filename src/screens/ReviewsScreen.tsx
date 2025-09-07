import React, { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, View, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { listReviews, createReview } from '../services/ReviewsService';
import { MaterialIcons as Icon } from '@expo/vector-icons';

function StarRating({ rating, onRate, size = 20 }: { rating: number; onRate?: (r: number) => void; size?: number }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {[1,2,3,4,5].map(n => (
        <TouchableOpacity key={n} onPress={() => onRate?.(n)} disabled={!onRate}>
          <Icon name="star" size={size} color={n <= rating ? '#F59E0B' : '#E5E7EB'} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function ReviewsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { userId } = useAuth();
  const restaurant_id = route.params?.restaurant_id as string;
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Review form state
  const [rating, setRating] = useState(5);
  const [foodRating, setFoodRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [ambianceRating, setAmbianceRating] = useState(5);
  const [valueRating, setValueRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const data = await listReviews({ restaurant_id });
        setReviews(data || []);
      } catch (e) {
        console.warn('reviews error', e);
      } finally {
        setLoading(false);
      }
    };
    if (restaurant_id) run();
  }, [restaurant_id]);

  const onSubmit = async () => {
    if (!userId) return Alert.alert('請先登入');
    if (rating < 1 || rating > 5) return Alert.alert('請選擇評分');
    
    setSubmitting(true);
    try {
      await createReview({
        restaurant_id,
        user_id: userId,
        rating,
        food_rating: foodRating,
        service_rating: serviceRating,
        ambiance_rating: ambianceRating,
        value_rating: valueRating,
        comment_zh: comment || null,
      });
      
      // Special handling for 1-2 star reviews (private investigation)
      if (rating <= 2) {
        Alert.alert('感謝你的反饋', '我們已收到你的評價。對於評分較低的體驗，我們會私下跟進調查，確保服務質素。');
      } else {
        Alert.alert('評價已提交', '感謝你的評價！');
      }
      
      setShowForm(false);
      // Reload reviews
      const data = await listReviews({ restaurant_id });
      setReviews(data || []);
    } catch (e: any) {
      Alert.alert('提交失敗', e?.message || '請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>評價</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
          <Text style={styles.addBtnText}>{showForm ? '取消' : '寫評價'}</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>寫評價</Text>
          
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>整體評分</Text>
            <StarRating rating={rating} onRate={setRating} />
          </View>
          
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>食物質素</Text>
            <StarRating rating={foodRating} onRate={setFoodRating} size={16} />
          </View>
          
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>服務態度</Text>
            <StarRating rating={serviceRating} onRate={setServiceRating} size={16} />
          </View>
          
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>用餐環境</Text>
            <StarRating rating={ambianceRating} onRate={setAmbianceRating} size={16} />
          </View>
          
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>性價比</Text>
            <StarRating rating={valueRating} onRate={setValueRating} size={16} />
          </View>

          <TextInput
            style={styles.textInput}
            placeholder="分享你的用餐體驗（可選）"
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
          />
          
          <TouchableOpacity style={styles.submitBtn} onPress={onSubmit} disabled={submitting}>
            <Text style={styles.submitBtnText}>{submitting ? '提交中...' : '提交評價'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {reviews.map(r => (
        <View key={r.id} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewerName}>{r.users?.first_name} {r.users?.last_name}</Text>
            <StarRating rating={r.rating} size={14} />
          </View>
          {r.comment_zh && <Text style={styles.reviewComment}>{r.comment_zh}</Text>}
          <Text style={styles.reviewDate}>{new Date(r.created_at).toLocaleDateString('zh-HK')}</Text>
        </View>
      ))}
      
      {!reviews.length && <Text style={{ color: '#6B7280' }}>暫時沒有評價</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700' },
  addBtn: { backgroundColor: '#7C3AED', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addBtnText: { color: '#fff', fontWeight: '500' },
  form: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  formTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  ratingLabel: { fontSize: 14, color: '#374151' },
  textInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, marginBottom: 16, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#7C3AED', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '600' },
  reviewCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 1 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  reviewerName: { fontWeight: '600' },
  reviewComment: { color: '#374151', marginBottom: 8 },
  reviewDate: { fontSize: 12, color: '#6B7280' },
});
