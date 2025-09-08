import React from 'react';
import { SafeAreaView, View, Text, Button, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import './i18n';
import { useTranslation } from 'react-i18next';

const Stack = createNativeStackNavigator();

function HomeScreen() {
  const { t, i18n } = useTranslation();
  const toggle = () => i18n.changeLanguage(i18n.language === 'en' ? 'zh-HK' : 'en');
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{t('welcome')}</Text>
        <View style={styles.spacer} />
        <Button title={t('toggle')} onPress={toggle} />
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'BeforePeak' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0b0b' },
  card: { backgroundColor: '#141414', padding: 24, borderRadius: 12, width: '86%' },
  title: { color: 'white', fontSize: 20, fontWeight: '600', textAlign: 'center' },
  spacer: { height: 16 },
});

