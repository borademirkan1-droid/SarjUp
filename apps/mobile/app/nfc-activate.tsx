import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { HCESession, NFCTagType4 } from 'react-native-hce';
import { supabase } from '../lib/supabase';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
const TIMEOUT_SECONDS = 60;

type Phase =
  | 'loading'    // Edge Function çağrılıyor
  | 'ready'      // HCE hazır, kullanıcı yaklaştırmalı
  | 'reading'    // Cihaz okuma başladı
  | 'success'    // Aktivasyon tamamlandı
  | 'timeout'    // Süre doldu
  | 'error';     // Hata

export default function NfcActivate() {
  const router = useRouter();
  const { device_id, device_name, receipt_id } = useLocalSearchParams<{
    device_id: string;
    device_name: string;
    receipt_id?: string;
  }>();

  const [phase, setPhase] = useState<Phase>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [activatedUntil, setActivatedUntil] = useState('');
  const [countdown, setCountdown] = useState(TIMEOUT_SECONDS);

  const sessionRef = useRef<HCESession | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Nabız animasyonu
  useEffect(() => {
    if (phase !== 'ready') return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    );
    pulse.start();
    glow.start();
    return () => { pulse.stop(); glow.stop(); };
  }, [phase]);

  // Geri sayım
  useEffect(() => {
    if (phase !== 'ready') return;
    setCountdown(TIMEOUT_SECONDS);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current!);
          stopHce();
          setPhase('timeout');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [phase]);

  // Token üret ve HCE başlat
  const startActivation = useCallback(async () => {
    setPhase('loading');
    setErrorMsg('');

    try {
      // JWT token al
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');

      // Edge Function'dan token al
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/generate-nfc-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            device_id,
            receipt_id: receipt_id ?? undefined,
          }),
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Token üretilemedi.');

      const { token, activated_until } = json;
      setActivatedUntil(activated_until ?? '');

      // HCE başlat
      const tag = new NFCTagType4({
        type: NFCTagType4.NDEFType.TEXT,
        content: token,   // Base64 token
        writable: false,
      });

      const hceSession = await HCESession.getInstance();
      await hceSession.setApplication(tag);

      // Cihaz okuduğunda tetiklenir
      hceSession.on(HCESession.Events.HCE_STATE_READ, async () => {
        if (countdownRef.current) clearInterval(countdownRef.current);
        setPhase('reading');
        await stopHce();

        // Kısa bekleme sonrası başarı
        setTimeout(() => setPhase('success'), 800);
      });

      await hceSession.start();
      sessionRef.current = hceSession;
      setPhase('ready');

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      setErrorMsg(msg);
      setPhase('error');
    }
  }, [device_id, receipt_id]);

  async function stopHce() {
    try {
      if (sessionRef.current) {
        await sessionRef.current.terminate();
        sessionRef.current = null;
      }
    } catch { /* sessizce geç */ }
  }

  useEffect(() => {
    startActivation();
    return () => {
      stopHce();
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  function formatDate(dateStr: string) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { stopHce(); router.back(); }}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NFC Aktivasyon</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Cihaz adı */}
        <View style={styles.deviceBadge}>
          <Ionicons name="hardware-chip" size={16} color="#0066FF" />
          <Text style={styles.deviceBadgeText}>
            {device_name ?? device_id ?? 'Cihaz'}
          </Text>
        </View>

        {/* YÜKLEME */}
        {phase === 'loading' && (
          <View style={styles.phaseBox}>
            <Animated.View style={[styles.nfcCircle, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="wifi" size={48} color="#93C5FD" />
            </Animated.View>
            <Text style={styles.phaseTitle}>Hazırlanıyor...</Text>
            <Text style={styles.phaseSub}>Aktivasyon token üretiliyor</Text>
          </View>
        )}

        {/* HAZIR — YAKLAŞTIR */}
        {phase === 'ready' && (
          <View style={styles.phaseBox}>
            <View style={styles.nfcRings}>
              <Animated.View style={[styles.ring, styles.ring3, { opacity: glowAnim }]} />
              <Animated.View style={[styles.ring, styles.ring2, { opacity: glowAnim }]} />
              <Animated.View style={[styles.ring, styles.ring1]} />
              <Animated.View style={[styles.nfcCircle, styles.nfcCircleActive, { transform: [{ scale: pulseAnim }] }]}>
                <Ionicons name="wifi" size={52} color="#fff" />
              </Animated.View>
            </View>

            <Text style={styles.phaseTitle}>Telefonu Cihaza Yaklaştır</Text>
            <Text style={styles.phaseSub}>
              Telefonu Şarjup cihazının NFC okuyucusuna değdirin.{'\n'}
              Aktivasyon otomatik gerçekleşecek.
            </Text>

            <View style={styles.countdownBox}>
              <Text style={styles.countdownText}>{countdown}s</Text>
              <Text style={styles.countdownLabel}>kalan süre</Text>
            </View>
          </View>
        )}

        {/* OKUMA — ANİMASYON */}
        {phase === 'reading' && (
          <View style={styles.phaseBox}>
            <View style={[styles.nfcCircle, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="sync" size={52} color="#F59E0B" />
            </View>
            <Text style={styles.phaseTitle}>Okunuyor...</Text>
            <Text style={styles.phaseSub}>Cihaz token doğruluyor</Text>
          </View>
        )}

        {/* BAŞARI */}
        {phase === 'success' && (
          <View style={styles.phaseBox}>
            <View style={[styles.nfcCircle, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="checkmark-circle" size={56} color="#10B981" />
            </View>
            <Text style={[styles.phaseTitle, { color: '#065F46' }]}>Aktivasyon Tamamlandı!</Text>
            {activatedUntil && (
              <View style={styles.successInfo}>
                <Ionicons name="calendar" size={16} color="#10B981" />
                <Text style={styles.successInfoText}>
                  {formatDate(activatedUntil)} tarihine kadar aktif
                </Text>
              </View>
            )}
            <Text style={styles.phaseSub}>
              Cihaz 1 ay süreyle uzatıldı.{'\n'}
              Cihazın yeşil ışık verdiğini kontrol edin.
            </Text>
            <TouchableOpacity
              style={[styles.btn, styles.btnGreen]}
              onPress={() => router.back()}
            >
              <Text style={styles.btnText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ZAMAN AŞIMI */}
        {phase === 'timeout' && (
          <View style={styles.phaseBox}>
            <View style={[styles.nfcCircle, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="time" size={52} color="#F59E0B" />
            </View>
            <Text style={[styles.phaseTitle, { color: '#92400E' }]}>Süre Doldu</Text>
            <Text style={styles.phaseSub}>
              Cihaz 60 saniye içinde okunamadı.{'\n'}
              Telefonu cihaza daha yakın tutun ve tekrar deneyin.
            </Text>
            <TouchableOpacity style={[styles.btn, styles.btnBlue]} onPress={startActivation}>
              <Ionicons name="refresh" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.btnText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* HATA */}
        {phase === 'error' && (
          <View style={styles.phaseBox}>
            <View style={[styles.nfcCircle, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="close-circle" size={52} color="#EF4444" />
            </View>
            <Text style={[styles.phaseTitle, { color: '#7F1D1D' }]}>Hata Oluştu</Text>
            <Text style={styles.phaseSub}>{errorMsg}</Text>
            <TouchableOpacity style={[styles.btn, styles.btnBlue]} onPress={startActivation}>
              <Ionicons name="refresh" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.btnText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  content: { flex: 1, alignItems: 'center', padding: 24 },
  deviceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 32,
  },
  deviceBadgeText: { color: '#0066FF', fontSize: 13, fontWeight: '600' },
  phaseBox: { alignItems: 'center', gap: 12, width: '100%' },
  nfcRings: { alignItems: 'center', justifyContent: 'center', width: 180, height: 180 },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#0066FF',
  },
  ring1: { width: 110, height: 110, opacity: 0.3 },
  ring2: { width: 145, height: 145, opacity: 0.15 },
  ring3: { width: 180, height: 180, opacity: 0.08 },
  nfcCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nfcCircleActive: { backgroundColor: '#0066FF' },
  phaseTitle: { fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center', marginTop: 8 },
  phaseSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
  countdownBox: { alignItems: 'center', marginTop: 12 },
  countdownText: { fontSize: 36, fontWeight: '700', color: '#0066FF' },
  countdownLabel: { fontSize: 12, color: '#9CA3AF' },
  successInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  successInfoText: { color: '#065F46', fontSize: 14, fontWeight: '600' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
  },
  btnBlue: { backgroundColor: '#0066FF' },
  btnGreen: { backgroundColor: '#10B981' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
