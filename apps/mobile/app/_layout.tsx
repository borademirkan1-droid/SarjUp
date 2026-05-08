import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useInactivityLogout } from '../lib/useInactivityLogout';
import { supabase } from '../lib/supabase';

function InactivityWrapper() {
  useInactivityLogout();
  return null;
}

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/login');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const inAuthArea = segments[0] !== 'login' && segments[0] !== 'index';

  return (
    <>
      {inAuthArea && <InactivityWrapper />}
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="payment" options={{ headerShown: false }} />
        <Stack.Screen name="business/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="device/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="earnings" options={{ headerShown: false }} />
        <Stack.Screen name="debts" options={{ headerShown: false }} />
        <Stack.Screen name="change-password" options={{ headerShown: false }} />
        <Stack.Screen name="subscription" options={{ headerShown: false }} />
        <Stack.Screen name="nfc-activate" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}