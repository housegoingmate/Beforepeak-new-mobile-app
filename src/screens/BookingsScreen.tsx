import React, { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, View, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { myBookings, Booking, cancelBooking } from '../services/BookingService';
import { useNavigation } from '@react-navigation/native';

function statusText(status: string) {
  switch (status) {
    case 'pending': return '待確認';
    case 'confirmed': return '已確認';
    case 'completed': return '已完成';
    case 'cancelled': return '已取消';
    default: return status;
  }
}

function canCancel(booking: any) {
  if (booking.status !== 'confirmed') return false;
  const bookingTime = new Date(`${booking.time_windows?.date}T${booking.time_windows?.start_time}`);
  const now = new Date();
  const hoursUntil = (bookingTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntil > 12; // 12-hour refund policy
}

export default function BookingsScreen() {
  const { userId, loading: authLoading } = useAuth();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);

  const loadBookings = async () => {
    if (!userId) return;
    try {
      const data = await myBookings(userId);
      setBookings(data || []);
    } catch (e) {
      console.warn('load bookings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) loadBookings();
  }, [authLoading, userId, loadBookings]);

  const onCancel = async (booking: any) => {
    Alert.alert('取消預訂', '確定要取消這個預訂嗎？退款將以帳戶積分形式發放。', [
      { text: '取消', style: 'cancel' },
      { text: '確定', onPress: async () => {
        try {
          await cancelBooking(booking.id, userId!);
          loadBookings();
          Alert.alert('已取消', '預訂已取消，退款將以積分形式發放到你的帳戶');
        } catch (e: any) {
          Alert.alert('取消失敗', e?.message || '請稍後再試');
        }
      }}
    ]);
  };

  if (authLoading || loading) return <View style={styles.center}><ActivityIndicator /></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>我的預訂</Text>
      {bookings.map(b => (
        <View key={b.id} style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.restaurant}>{b.restaurants?.name_zh || b.restaurants?.name_en}</Text>
            <Text style={[styles.status, b.status === 'confirmed' && styles.statusConfirmed]}>{statusText(b.status)}</Text>
          </View>
          <Text style={styles.detail}>日期: {b.time_windows?.date}</Text>
          <Text style={styles.detail}>時間: {b.time_windows?.start_time}</Text>
          <Text style={styles.detail}>人數: {b.party_size}</Text>
          {b.booking_fee && <Text style={styles.detail}>費用: HK${b.booking_fee}</Text>}

          <View style={styles.actions}>
            {canCancel(b) && (
              <TouchableOpacity style={styles.cancelBtn} onPress={() => onCancel(b)}>
                <Text style={styles.cancelText}>取消預訂</Text>
              </TouchableOpacity>
            )}
            {b.status === 'confirmed' && (
              <TouchableOpacity style={styles.modifyBtn} onPress={() => navigation.navigate('ModifyBooking', { bookingId: b.id })}>
                <Text style={styles.modifyText}>修改</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
      {!bookings.length && (<Text style={{ color: '#6B7280' }}>暫時沒有訂座</Text>)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  restaurant: { fontSize: 16, fontWeight: '600', flex: 1 },
  status: { fontSize: 12, color: '#6B7280', backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusConfirmed: { backgroundColor: '#D1FAE5', color: '#065F46' },
  detail: { marginBottom: 4, color: '#374151' },
  actions: { flexDirection: 'row', marginTop: 12, gap: 8 },
  cancelBtn: { backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  cancelText: { color: '#DC2626', fontSize: 12, fontWeight: '500' },
  modifyBtn: { backgroundColor: '#EDE9FE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  modifyText: { color: '#7C3AED', fontSize: 12, fontWeight: '500' },
});

