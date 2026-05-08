import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { supabase } from '../lib/supabase';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/home');
      } else {
        router.replace('/login');
      }
    }
    const timer = setTimeout(checkSession, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <MaskedView
        maskElement={<Text style={styles.logo}>Şarjup</Text>}
      >
        <LinearGradient
          colors={['#0066FF', '#10B981']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
        >
          <Text style={[styles.logo, { opacity: 0 }]}>Şarjup</Text>
        </LinearGradient>
      </MaskedView>

      <Text style={styles.tagline}>Akıllı Şarj Çözümü</Text>
      <ActivityIndicator size="small" color="#0066FF" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: '700',
    color: 'black',
  },
  tagline: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  loader: {
    marginTop: 40,
  },
});