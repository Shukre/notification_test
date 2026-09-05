import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function Home() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    register().then(setToken).catch((e) => setError(String(e)));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Push token</Text>
      <Text selectable style={styles.token}>
        {error || token || 'loading…'}
      </Text>
    </View>
  );
}

async function register() {
  if (!Device.isDevice) throw new Error('Needs a physical device');

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('adhan-short', {
      name: 'Adhan',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'adhan_short.wav',
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let final = existing;
  if (existing !== 'granted') {
    final = (await Notifications.requestPermissionsAsync()).status;
  }
  if (final !== 'granted') throw new Error('Permission denied');

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
  if (!projectId) throw new Error('No EAS project ID');

  return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 16 },
  label: { fontSize: 12, opacity: 0.6, marginTop: 12 },
  token: { fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
});