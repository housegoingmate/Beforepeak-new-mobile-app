/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { RestaurantsScreen } from './src/screens/RestaurantsScreen';
import { RestaurantDetailScreen } from './src/screens/RestaurantDetailScreen';
import { BookingScreen } from './src/screens/BookingScreen';
import { BookingsScreen } from './src/screens/BookingsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { MapScreen } from './src/screens/MapScreen';
import { LoadingScreen } from './src/screens/LoadingScreen';
import ReviewsScreen from './src/screens/ReviewsScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';

// Import services
import { supabase } from './src/lib/supabase';
import { Session } from '@supabase/supabase-js';
import NotificationService from './src/services/NotificationService';
import ReviewService from './src/services/ReviewService';

// Import components
import { MandatoryReviewModal } from './src/components/MandatoryReviewModal';

// Import theme
import { colors, componentSpacing } from './src/theme';

// Import i18n
import './src/i18n/config';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator
function MainTabs({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background.primary,
          borderTopWidth: 1,
          borderTopColor: colors.border.light,
          height: (componentSpacing.tabBarHeight || 60) + 10,
          paddingBottom: Platform.OS === 'ios' ? 24 : 14,
          paddingTop: 12,
        },
        tabBarActiveTintColor: colors.primary.purple,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const name = (() => {
            switch (route.name) {
              case 'Home':
                return focused ? 'home' : 'home-outline';
              case 'Restaurants':
                return focused ? 'search' : 'search-outline';
              case 'Map':
                return focused ? 'map' : 'map-outline';
              case 'Bookings':
                return focused ? 'calendar' : 'calendar-outline';
              case 'Profile':
                return focused ? 'person' : 'person-outline';
              default:
                return 'home-outline';
            }
          })();
          return <Ionicons name={name as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Restaurants"
        component={RestaurantsScreen}
        options={{ tabBarLabel: 'Restaurants' }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{ tabBarLabel: 'Map' }}
      />
      {isAuthenticated && (
        <Tab.Screen
          name="Bookings"
          component={BookingsScreen}
          options={{ tabBarLabel: 'Bookings' }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingReview, setPendingReview] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    // Initialize services
    const initializeServices = async () => {
      await NotificationService.getInstance().initialize();
    };
    initializeServices();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);

      // Check for pending reviews when user logs in
      if (session) {
        checkPendingReviews();
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

      // Check for pending reviews when user logs in
      if (session) {
        checkPendingReviews();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkPendingReviews = async () => {
    try {
      const reviewService = ReviewService.getInstance();
      const pendingReview = await reviewService.checkMandatoryReview();

      if (pendingReview) {
        setPendingReview(pendingReview);
        setShowReviewModal(true);
      }
    } catch (error) {
      console.error('Failed to check pending reviews:', error);
    }
  };

  const handleReviewComplete = () => {
    setShowReviewModal(false);
    setPendingReview(null);
    // Check if there are more pending reviews
    setTimeout(checkPendingReviews, 1000);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background.primary}
        translucent={false}
      />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="MainTabs">
            {() => <MainTabs isAuthenticated={!!session} />}
          </Stack.Screen>
          <Stack.Screen
            name="RestaurantDetail"
            component={RestaurantDetailScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="Booking"
            component={BookingScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="Reviews" component={ReviewsScreen} />
          <Stack.Screen name="Favorites" component={FavoritesScreen} />
          <Stack.Screen name="Auth" component={AuthScreen} />
        </Stack.Navigator>
      </NavigationContainer>

      {/* Mandatory Review Modal */}
      <MandatoryReviewModal
        visible={showReviewModal}
        pendingReview={pendingReview}
        onComplete={handleReviewComplete}
      />
    </>
  );
}
