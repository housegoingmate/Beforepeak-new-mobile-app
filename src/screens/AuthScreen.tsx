import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { colors, typography, commonStyles, spacing, borderRadius } from '../theme';

export const AuthScreen: React.FC = () => {
  const { t } = useTranslation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  const handleAuth = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert(t('common.error'), 'Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
              phone: formData.phone,
            },
          },
        });

        if (error) {
          Alert.alert(t('common.error'), error.message);
        } else {
          Alert.alert('Success', 'Please check your email to verify your account');
        }
      } else {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          Alert.alert(t('common.error'), error.message);
        }
      }
    } catch (error) {
      Alert.alert(t('common.error'), 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'demo@beforepeak.com',
        password: 'demo123456',
      });

      if (error) {
        Alert.alert(t('common.error'), error.message);
      }
    } catch (error) {
      Alert.alert(t('common.error'), 'Demo sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>BeforePeak</Text>
            <Text style={styles.subtitle}>{t('auth.welcome')}</Text>
            <Text style={styles.description}>{t('auth.subtitle')}</Text>
          </View>

          <View style={styles.form}>
            {isSignUp && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.firstName')}
                  value={formData.firstName}
                  onChangeText={(value) => updateFormData('firstName', value)}
                  autoCapitalize="words"
                />
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.lastName')}
                  value={formData.lastName}
                  onChangeText={(value) => updateFormData('lastName', value)}
                  autoCapitalize="words"
                />
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.phone')}
                  value={formData.phone}
                  onChangeText={(value) => updateFormData('phone', value)}
                  keyboardType="phone-pad"
                />
              </>
            )}

            <TextInput
              style={styles.input}
              placeholder={t('auth.email')}
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder={t('auth.password')}
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              secureTextEntry
              autoCapitalize="none"
            />

            <Button
              title={isSignUp ? t('auth.signUp') : t('auth.signIn')}
              onPress={handleAuth}
              loading={loading}
              style={styles.authButton}
            />

            <Button
              title={t('auth.signInWithDemo')}
              onPress={handleDemoSignIn}
              variant="secondary"
              loading={loading}
              style={styles.demoButton}
            />

            <Button
              title={isSignUp ? t('auth.alreadyHaveAccount') : t('auth.dontHaveAccount')}
              onPress={() => setIsSignUp(!isSignUp)}
              variant="ghost"
              style={styles.switchButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.h1,
    color: colors.primary.purple,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  input: {
    ...commonStyles.input,
    marginBottom: spacing.md,
  },
  authButton: {
    marginBottom: spacing.md,
  },
  demoButton: {
    marginBottom: spacing.lg,
  },
  switchButton: {
    marginTop: spacing.sm,
  },
});
