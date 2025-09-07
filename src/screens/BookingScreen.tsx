import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { colors, typography, spacing, borderRadius, commonStyles } from '../theme';
import { UIRestaurant, DayAvailability, BookingRequest } from '../types/database';
import { fetchRestaurantAvailability } from '../services/restaurants';
import { createBooking, processPayment } from '../services/bookings';
import { hapticFeedback } from '../utils/haptics';
import { formatTime, formatDate, formatCurrency } from '../utils/formatting';

const PARTY_SIZES = [2, 3, 4, 5, 6];
const BOOKING_FEES = { 2: 50, 3: 70, 4: 80, 5: 100, 6: 120 };

export const BookingScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();

  const [restaurant, setRestaurant] = useState<UIRestaurant | null>(null);
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [partySize, setPartySize] = useState<number>(2);
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'payment' | 'confirmation'>('details');

  useEffect(() => {
    const params = route.params as any;
    if (params?.restaurant) {
      setRestaurant(params.restaurant);
      loadAvailability(params.restaurant.id);

      if (params.selectedDate) {
        setSelectedDate(params.selectedDate);
      }
      if (params.selectedTimeSlot) {
        setSelectedTimeSlot(params.selectedTimeSlot);
      }
    }
  }, [route.params]);

  const loadAvailability = async (restaurantId: string) => {
    try {
      const data = await fetchRestaurantAvailability(restaurantId, 14);
      setAvailability(data);

      // Auto-select today if no date selected
      if (!selectedDate && data.length > 0) {
        const today = data.find(d => d.is_today);
        if (today && !today.closed) {
          setSelectedDate(today.date);
        }
      }
    } catch (error) {
      console.error('Error loading availability:', error);
    }
  };

  const handleBack = () => {
    hapticFeedback.light();
    if (step === 'details') {
      navigation.goBack();
    } else {
      setStep('details');
    }
  };

  const handleDateSelect = (date: string) => {
    hapticFeedback.selection();
    setSelectedDate(date);
    setSelectedTimeSlot(''); // Reset time slot when date changes
  };

  const handleTimeSlotSelect = (slotId: string) => {
    hapticFeedback.selection();
    setSelectedTimeSlot(slotId);
  };

  const handlePartySizeSelect = (size: number) => {
    hapticFeedback.selection();
    setPartySize(size);
  };

  const handleContinueToPayment = () => {
    if (!selectedDate || !selectedTimeSlot) {
      Alert.alert('Error', 'Please select a date and time slot');
      return;
    }

    hapticFeedback.medium();
    setStep('payment');
  };

  const handleConfirmBooking = async () => {
    if (!restaurant) return;

    try {
      setLoading(true);
      hapticFeedback.medium();

      const bookingRequest: BookingRequest = {
        restaurant_id: restaurant.id,
        time_window_id: selectedTimeSlot,
        party_size: partySize,
        special_requests: specialRequests || undefined,
      };

      const booking = await createBooking(bookingRequest);

      if (booking) {
        // Process payment (simulated)
        const paymentSuccess = await processPayment({
          booking_id: booking.id,
          amount: BOOKING_FEES[partySize as keyof typeof BOOKING_FEES],
          currency: 'HKD',
          payment_method: 'payme',
        });

        if (paymentSuccess) {
          setStep('confirmation');
          hapticFeedback.success();
        } else {
          Alert.alert('Payment Failed', 'Please try again');
        }
      } else {
        Alert.alert('Booking Failed', 'Please try again');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert('Error', 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    hapticFeedback.light();
    navigation.navigate('Bookings');
  };

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedDay = availability.find(d => d.date === selectedDate);
  const selectedSlot = selectedDay?.slots.find(s => s.id === selectedTimeSlot);
  const bookingFee = BOOKING_FEES[partySize as keyof typeof BOOKING_FEES];

  const renderDetailsStep = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Restaurant Info */}
      <Card style={styles.restaurantCard}>
        <Text style={styles.restaurantName}>{restaurant.name}</Text>
        <Text style={styles.restaurantCuisine}>{restaurant.cuisine_type}</Text>
      </Card>

      {/* Date Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('booking.selectDate')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.dateContainer}>
            {availability.slice(0, 7).map((day) => (
              <TouchableOpacity
                key={day.date}
                style={[
                  styles.dateCard,
                  selectedDate === day.date && styles.dateCardSelected,
                  day.closed && styles.dateCardDisabled,
                ]}
                onPress={() => !day.closed && handleDateSelect(day.date)}
                disabled={day.closed}
              >
                <Text style={[
                  styles.dayName,
                  selectedDate === day.date && styles.dayNameSelected,
                  day.closed && styles.dayNameDisabled,
                ]}>
                  {day.is_today ? 'Today' : day.is_tomorrow ? 'Tomorrow' : formatDate(day.date)}
                </Text>
                <Text style={[
                  styles.dayDate,
                  selectedDate === day.date && styles.dayDateSelected,
                  day.closed && styles.dayDateDisabled,
                ]}>
                  {day.date.split('-')[2]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Time Selection */}
      {selectedDay && !selectedDay.closed && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('booking.selectTime')}</Text>
          <View style={styles.timeContainer}>
            {selectedDay.slots.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.timeSlot,
                  selectedTimeSlot === slot.id && styles.timeSlotSelected,
                  !slot.is_available && styles.timeSlotDisabled,
                ]}
                onPress={() => slot.is_available && handleTimeSlotSelect(slot.id)}
                disabled={!slot.is_available}
              >
                <Text style={[
                  styles.timeSlotText,
                  selectedTimeSlot === slot.id && styles.timeSlotTextSelected,
                  !slot.is_available && styles.timeSlotTextDisabled,
                ]}>
                  {formatTime(slot.time)}
                </Text>
                <Text style={styles.discountText}>
                  -{slot.discount_percentage}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Party Size */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('booking.selectPartySize')}</Text>
        <View style={styles.partySizeContainer}>
          {PARTY_SIZES.map((size) => (
            <TouchableOpacity
              key={size}
              style={[
                styles.partySizeButton,
                partySize === size && styles.partySizeButtonSelected,
              ]}
              onPress={() => handlePartySizeSelect(size)}
            >
              <Ionicons
                name="people"
                size={20}
                color={partySize === size ? colors.text.inverse : colors.text.primary}
              />
              <Text style={[
                styles.partySizeText,
                partySize === size && styles.partySizeTextSelected,
              ]}>
                {size}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Special Requests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('booking.specialRequests')}</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Any special requests or dietary requirements..."
          value={specialRequests}
          onChangeText={setSpecialRequests}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Booking Summary */}
      {selectedSlot && (
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date:</Text>
            <Text style={styles.summaryValue}>{formatDate(selectedDate)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Time:</Text>
            <Text style={styles.summaryValue}>{formatTime(selectedSlot.time)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Party Size:</Text>
            <Text style={styles.summaryValue}>{partySize} people</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount:</Text>
            <Text style={styles.summaryValue}>-{selectedSlot.discount_percentage}%</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.summaryTotalLabel}>Booking Fee:</Text>
            <Text style={styles.summaryTotalValue}>{formatCurrency(bookingFee)}</Text>
          </View>
        </Card>
      )}
    </ScrollView>
  );

  const renderPaymentStep = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <Card style={styles.paymentCard}>
        <Text style={styles.paymentTitle}>Payment Details</Text>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Booking Fee:</Text>
          <Text style={styles.paymentValue}>{formatCurrency(bookingFee)}</Text>
        </View>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Payment Method:</Text>
          <Text style={styles.paymentValue}>PayMe (Hong Kong)</Text>
        </View>
      </Card>

      <Card style={styles.termsCard}>
        <Text style={styles.termsTitle}>Terms & Conditions</Text>
        <Text style={styles.termsText}>
          • Booking fee is non-refundable within 12 hours of reservation time{'\n'}
          • Please arrive on time for your reservation{'\n'}
          • Restaurant policies apply for minimum spend and set menus
        </Text>
      </Card>
    </ScrollView>
  );

  const renderConfirmationStep = () => (
    <View style={styles.confirmationContainer}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark-circle" size={48} color={colors.success['500']} />
      </View>
      <Text style={styles.confirmationTitle}>Booking Confirmed!</Text>
      <Text style={styles.confirmationText}>
        Your reservation has been confirmed. You'll receive a confirmation email shortly.
      </Text>

      <Card style={styles.confirmationCard}>
        <Text style={styles.confirmationCardTitle}>Booking Details</Text>
        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>Restaurant:</Text>
          <Text style={styles.confirmationValue}>{restaurant.name}</Text>
        </View>
        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>Date:</Text>
          <Text style={styles.confirmationValue}>{formatDate(selectedDate)}</Text>
        </View>
        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>Time:</Text>
          <Text style={styles.confirmationValue}>{selectedSlot && formatTime(selectedSlot.time)}</Text>
        </View>
        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>Party Size:</Text>
          <Text style={styles.confirmationValue}>{partySize} people</Text>
        </View>
      </Card>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {step === 'details' ? 'Book Table' : step === 'payment' ? 'Payment' : 'Confirmed'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      {step === 'details' && renderDetailsStep()}
      {step === 'payment' && renderPaymentStep()}
      {step === 'confirmation' && renderConfirmationStep()}

      {/* Bottom Action */}
      {step !== 'confirmation' && (
        <View style={styles.bottomAction}>
          <Button
            title={step === 'details' ? 'Continue to Payment' : 'Confirm Booking'}
            onPress={step === 'details' ? handleContinueToPayment : handleConfirmBooking}
            loading={loading}
            disabled={step === 'details' && (!selectedDate || !selectedTimeSlot)}
            style={styles.actionButton}
            icon={step === 'details' ? <Ionicons name="card" size={20} color={colors.text.inverse} /> : undefined}
          />
        </View>
      )}

      {step === 'confirmation' && (
        <View style={styles.bottomAction}>
          <Button
            title="View My Bookings"
            onPress={handleDone}
            style={styles.actionButton}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  loadingContainer: {
    ...commonStyles.centerContent,
  },
  loadingText: {
    ...typography.body1,
    color: colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h4,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  restaurantCard: {
    margin: spacing.lg,
    marginBottom: spacing.md,
  },
  restaurantName: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  restaurantCuisine: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h6,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  dateContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
  },
  dateCard: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginRight: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    minWidth: 80,
  },
  dateCardSelected: {
    backgroundColor: colors.primary.purple,
    borderColor: colors.primary.purple,
  },
  dateCardDisabled: {
    backgroundColor: colors.background.tertiary,
    borderColor: colors.border.medium,
  },
  dayName: {
    ...typography.caption,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  dayNameSelected: {
    color: colors.text.inverse,
  },
  dayNameDisabled: {
    color: colors.text.tertiary,
  },
  dayDate: {
    ...typography.h6,
    color: colors.text.primary,
  },
  dayDateSelected: {
    color: colors.text.inverse,
  },
  dayDateDisabled: {
    color: colors.text.tertiary,
  },
  timeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeSlot: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: colors.primary.purple,
    borderColor: colors.primary.purple,
  },
  timeSlotDisabled: {
    backgroundColor: colors.background.tertiary,
    borderColor: colors.border.medium,
  },
  timeSlotText: {
    ...typography.body2,
    color: colors.text.primary,
    fontWeight: '600',
  },
  timeSlotTextSelected: {
    color: colors.text.inverse,
  },
  timeSlotTextDisabled: {
    color: colors.text.tertiary,
  },
  discountText: {
    ...typography.overline,
    color: colors.warning['600'],
    fontSize: 10,
  },
  partySizeContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  partySizeButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    minWidth: 60,
  },
  partySizeButtonSelected: {
    backgroundColor: colors.primary.purple,
    borderColor: colors.primary.purple,
  },
  partySizeText: {
    ...typography.body2,
    color: colors.text.primary,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  partySizeTextSelected: {
    color: colors.text.inverse,
  },
  textInput: {
    ...typography.body1,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    minHeight: 80,
  },
  summaryCard: {
    margin: spacing.lg,
    marginTop: 0,
  },
  summaryTitle: {
    ...typography.h6,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  summaryValue: {
    ...typography.body2,
    color: colors.text.primary,
    fontWeight: '600',
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  summaryTotalLabel: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '600',
  },
  summaryTotalValue: {
    ...typography.body1,
    color: colors.primary.purple,
    fontWeight: '700',
  },
  paymentCard: {
    margin: spacing.lg,
  },
  paymentTitle: {
    ...typography.h6,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  paymentLabel: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  paymentValue: {
    ...typography.body2,
    color: colors.text.primary,
    fontWeight: '600',
  },
  termsCard: {
    margin: spacing.lg,
    marginTop: 0,
  },
  termsTitle: {
    ...typography.h6,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  termsText: {
    ...typography.body2,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  confirmationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success['50'],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  confirmationTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  confirmationText: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  confirmationCard: {
    width: '100%',
  },
  confirmationCardTitle: {
    ...typography.h6,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  confirmationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  confirmationLabel: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  confirmationValue: {
    ...typography.body2,
    color: colors.text.primary,
    fontWeight: '600',
  },
  bottomAction: {
    padding: spacing.lg,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  actionButton: {
    width: '100%',
  },
});

