import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { colors, typography, spacing, borderRadius, commonStyles } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { hapticFeedback } from '../utils/haptics';

export const ProfileScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const { user, signOut } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLanguageToggle = () => {
    hapticFeedback.selection();
    const newLanguage = language === 'en' ? 'zh-HK' : 'en';
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  const handleSignOut = () => {
    hapticFeedback.light();
    Alert.alert(
      t('profile.signOut'),
      t('profile.signOutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.signOut'),
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            await signOut();
            setLoading(false);
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    hapticFeedback.light();
    // TODO: Navigate to edit profile screen
    Alert.alert('Coming Soon', 'Profile editing will be available soon');
  };

  const handleMyBookings = () => {
    hapticFeedback.light();
    navigation.navigate('Bookings');
  };

  const handleFavorites = () => {
    hapticFeedback.light();
    // @ts-ignore
    navigation.navigate('Favorites');
  };

  const handlePaymentMethods = () => {
    hapticFeedback.light();
    // TODO: Navigate to payment methods screen
    Alert.alert('Coming Soon', 'Payment methods management will be available soon');
  };

  const handleHelp = () => {
    hapticFeedback.light();
    // TODO: Navigate to help screen
    Alert.alert('Coming Soon', 'Help & Support will be available soon');
  };

  const renderProfileHeader = () => (
    <Card style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={32} color={colors.text.inverse} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {user?.user_metadata?.full_name || user?.email || 'Guest User'}
          </Text>
          <Text style={styles.profileEmail}>
            {user?.email || 'guest@beforepeak.com'}
          </Text>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Ionicons name="create-outline" size={20} color={colors.primary.purple} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderMenuItem = (
    icon: React.ReactNode,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightElement?: React.ReactNode
  ) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIcon}>{icon}</View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.menuItemRight}>
        {rightElement || <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        {renderProfileHeader()}

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.account')}</Text>
          <Card style={styles.menuCard}>
            {renderMenuItem(
              <Ionicons name="notifications" size={20} color={colors.primary.purple} />,
              t('profile.myBookings'),
              t('profile.myBookingsSubtitle'),
              handleMyBookings
            )}
            {renderMenuItem(
              <Ionicons name="heart" size={20} color={colors.primary.purple} />,
              t('profile.favorites'),
              t('profile.favoritesSubtitle'),
              handleFavorites
            )}
            {renderMenuItem(
              <Ionicons name="card" size={20} color={colors.primary.purple} />,
              t('profile.paymentMethods'),
              t('profile.paymentMethodsSubtitle'),
              handlePaymentMethods
            )}
          </Card>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
          <Card style={styles.menuCard}>
            {renderMenuItem(
              <Ionicons name="notifications" size={20} color={colors.primary.purple} />,
              t('profile.notifications'),
              t('profile.notificationsSubtitle'),
              undefined,
              <Switch
                value={notificationsEnabled}
                onValueChange={(value) => {
                  hapticFeedback.selection();
                  setNotificationsEnabled(value);
                }}
                trackColor={{ false: colors.border.medium, true: colors.primary.purple50 }}
                thumbColor={notificationsEnabled ? colors.primary.purple : colors.background.primary}
              />
            )}
            {renderMenuItem(
              <Ionicons name="globe" size={20} color={colors.primary.purple} />,
              t('profile.language'),
              language === 'en' ? 'English' : '繁體中文',
              handleLanguageToggle
            )}
          </Card>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.support')}</Text>
          <Card style={styles.menuCard}>
            {renderMenuItem(
              <Ionicons name="help-circle" size={20} color={colors.primary.purple} />,
              t('profile.help'),
              t('profile.helpSubtitle'),
              handleHelp
            )}
          </Card>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <Button
            title={t('profile.signOut')}
            onPress={handleSignOut}
            variant="secondary"
            loading={loading}
            style={styles.signOutButton}
            icon={<Ionicons name="log-out-outline" size={20} color={colors.error['500']} />}
            textStyle={styles.signOutText}
          />
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>BeforePeak v1.0.0</Text>
          <Text style={styles.appInfoText}>© 2024 BeforePeak. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    margin: spacing.lg,
    marginBottom: spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.h5,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  profileEmail: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.purple50,
    alignItems: 'center',
    justifyContent: 'center',
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
  menuCard: {
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.purple50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '600',
  },
  menuSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  menuItemRight: {
    marginLeft: spacing.sm,
  },
  signOutButton: {
    borderColor: colors.error['500'],
  },
  signOutText: {
    color: colors.error['500'],
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  appInfoText: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
});

