import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { supabase } from '../lib/supabase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    setError('');
    if (!email || !password) {
      setError('E-posta ve şifre gerekli');
      return;
    }
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError('E-posta veya şifre hatalı');
      setLoading(false);
      return;
    }

    // İlk girişte zorla şifre değiştirme kontrolü
    const mustChange = data.user?.user_metadata?.must_change_password === true;
    setLoading(false);

    if (mustChange) {
      router.replace('/change-password?forced=true');
    } else {
      router.replace('/home');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <MaskedView maskElement={<Text style={styles.logo}>Şarjup</Text>}>
          <LinearGradient
            colors={['#0066FF', '#10B981']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          >
            <Text style={[styles.logo, { opacity: 0 }]}>Şarjup</Text>
          </LinearGradient>
        </MaskedView>
        <Text style={styles.subtitle}>Partner Girişi</Text>

        <View style={styles.form}>
          <Text style={styles.label}>E-posta</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="ornek@sarjup.com.tr"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Text style={styles.label}>Şifre</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="********"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.footer}>
          Sorun yaşıyorsanız: 0540 366 41 41
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  logo: { fontSize: 40, fontWeight: '700', color: '#0066FF', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 40 },
  form: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  logo2: { fontSize: 40, fontWeight: '700', color: '#0066FF', textAlign: 'center', marginBottom: 8 },
  label: { fontSize: 14, color: '#374151', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 14, fontSize: 16, color: '#111827' },
  error: { color: '#EF4444', fontSize: 14, marginTop: 12, textAlign: 'center' },
  button: { backgroundColor: '#0066FF', padding: 16, borderRadius: 8, marginTop: 24, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: { textAlign: 'center', color: '#9CA3AF', fontSize: 13, marginTop: 40 },
});