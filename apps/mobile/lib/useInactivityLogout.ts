import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from './supabase';

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 dakika

export function useInactivityLogout() {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActiveRef = useRef<number>(Date.now());

  function resetTimer() {
    lastActiveRef.current = Date.now();
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.auth.signOut();
        router.replace('/login');
      }
    }, INACTIVITY_TIMEOUT_MS);
  }

  useEffect(() => {
    resetTimer();

    const subscription = AppState.addEventListener('change', async (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        const elapsed = Date.now() - lastActiveRef.current;
        if (elapsed >= INACTIVITY_TIMEOUT_MS) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await supabase.auth.signOut();
            router.replace('/login');
            return;
          }
        }
        resetTimer();
      } else if (nextState === 'background' || nextState === 'inactive') {
        lastActiveRef.current = Date.now();
      }
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      subscription.remove();
    };
  }, []);

  return { resetTimer };
}