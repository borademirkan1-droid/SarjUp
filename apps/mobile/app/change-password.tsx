import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

type Strength = { score: number; label: string; color: string };

function calculateStrength(pwd: string): Strength {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { score: 1, label: 'Çok Zayıf', color: '#EF4444' };
  if (score === 2) return { score: 2, label: 'Zayıf', color: '#F59E0B' };
  if (score === 3) return { score: 3, label: 'Orta', color: '#FBBF24' };
  if (score === 4) return { score: 4, label: 'İyi', color: '#10B981' };
  return { score: 5, label: 'Güçlü', color: '#059669' };
}

export default function ChangePassword() {
  const { forced } = useLocalSearchParams<{ forced?: string }>();
  const isForced = forced === 'true';
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const strength = calculateStrength(newPassword);

  async function handleSave() {
    setError('');

    if (newPassword.length < 8) {
      setError('Şifre en az 8 karakter olmalı');
      return;
    }
    if (strength.score < 3) {
      setError('Daha güçlü bir şifre seçin (büyük harf, rakam, özel karakter)');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    setLoading(true);

    const { error: authError } = await supabase.auth.updateUser({
      password: newPassword,
      data: { must_change_password: false },
    });

    if (authError) {
      setError('Şifre güncellenemedi: ' + authError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.replace('/home');
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          {!isForced && (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
          )}
          {isForced && <View style={{ width: 24 }} />}
          <Text style={styles.headerTitle}>Şifre Değiştir</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {isForced && (
            <View style={styles.warningBox}>
              <Ionicons name="lock-closed" size={20} color="#92400E" />
              <Text style={styles.warningText}>
                İlk girişte şifrenizi değiştirmeniz gerekiyor.
              </Text>
            </View>
          )}

          <Text style={styles.label}>Yeni Şifre</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="En az 8 karakter"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showNew}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowNew(!showNew)}>
              <Ionicons name={showNew ? 'eye-off' : 'eye'} size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {newPassword.length > 0 && (
            <View style={styles.strengthBox}>
              <View style={styles.strengthBars}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.strengthBar,
                      i <= strength.score && { backgroundColor: strength.color },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.strengthLabel, { color: strength.color }]}>
                {strength.label}
              </Text>
            </View>
          )}

          <Text style={styles.hint}>
            En az 8 karakter, büyük harf, rakam ve özel karakter içermeli
          </Text>

          <Text style={[styles.label, { marginTop: 20 }]}>Yeni Şifre (Tekrar)</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Şifreyi tekrar girin"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
              <Ionicons name={showConfirm ? 'eye-off' : 'eye'} size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {confirmPassword.length > 0 && newPassword !== confirmPassword && (
            <Text style={styles.errorInline}>Şifreler eşleşmiyor</Text>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Şifreyi Güncelle</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  content: { padding: 24 },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF3C7',
    padding: 14,
    borderRadius: 8,
    marginBottom: 24,
  },
  warningText: { flex: 1, color: '#78350F', fontSize: 13 },
  label: { fontSize: 14, color: '#374151', marginBottom: 6, fontWeight: '600' },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 14,
    gap: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  strengthBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  strengthBars: { flex: 1, flexDirection: 'row', gap: 4 },
  strengthBar: { flex: 1, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2 },
  strengthLabel: { fontSize: 12, fontWeight: '600' },
  hint: { fontSize: 12, color: '#6B7280', marginTop: 8 },
  errorInline: { color: '#EF4444', fontSize: 13, marginTop: 6 },
  error: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#0066FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});