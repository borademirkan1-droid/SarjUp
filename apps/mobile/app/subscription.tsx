import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';

type NfcStatus = {
  nfc_unlocked: boolean;
  reason?: string;
  approved_at?: string;
  amount?: number;
  receipt_id?: string;
};

type ScreenPhase = 'status' | 'form';

export default function Subscription() {
  const router = useRouter();

  const [phase, setPhase] = useState<ScreenPhase>('status');
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nfcStatus, setNfcStatus] = useState<NfcStatus | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [deviceHwId, setDeviceHwId] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState<string | null>(null);

  // Form state
  const [amount, setAmount] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (phase === 'form') {
        setPhase('status');
        return true;
      }
      return false;
    });
    return () => handler.remove();
  }, [phase]);

  const fetchStatus = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: partnerData } = await supabase
        .from('partners')
        .select('id')
        .eq('email', user?.email ?? '')
        .maybeSingle();

      const pid = partnerData?.id ?? null;
      setPartnerId(pid);

      if (pid) {
        const { data: deviceData } = await supabase
          .from('devices')
          .select('id, device_id, serial_number')
          .eq('partner_id', pid)
          .maybeSingle();
        setDeviceId(deviceData?.id ?? null);
        setDeviceHwId(deviceData?.device_id ?? null);
        setDeviceName(deviceData?.device_id ?? deviceData?.serial_number ?? null);
      }

      if (!pid) {
        setNfcStatus({ nfc_unlocked: false, reason: 'no_payment' });
        return;
      }

      const res = await fetch(
        `https://admin.sarjup.com.tr/api/mobile/nfc-status?partner_id=${pid}`
      );
      const data: NfcStatus = await res.json();
      setNfcStatus(data);
    } catch {
      setNfcStatus({ nfc_unlocked: false, reason: 'no_payment' });
    }
  }, []);

  useEffect(() => {
    fetchStatus().finally(() => setLoadingStatus(false));
  }, [fetchStatus]);

  async function onRefresh() {
    setRefreshing(true);
    await fetchStatus();
    setRefreshing(false);
  }

  async function pickFromCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Kamera izni verilmedi.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setImageMime(asset.mimeType ?? 'image/jpeg');
    }
  }

  async function pickFromGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Galeri izni verilmedi.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setImageMime(asset.mimeType ?? 'image/jpeg');
    }
  }

  async function submitReceipt() {
    if (!imageUri) {
      Alert.alert('Hata', 'Lütfen bir dekont fotoğrafı seçin.');
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir tutar girin.');
      return;
    }
    if (!partnerId) {
      Alert.alert('Hata', 'Partner bilgisi bulunamadı.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      const filename = imageUri.split('/').pop() ?? 'dekont.jpg';
      formData.append('file', {
        uri: imageUri,
        name: filename,
        type: imageMime,
      } as unknown as Blob);
      formData.append('partner_id', partnerId);
      formData.append('amount', amount);
      if (deviceId) formData.append('device_id', deviceId);

      const res = await fetch(
        'https://admin.sarjup.com.tr/api/mobile/receipts/upload',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Sunucu hatası: ${res.status}`);
      }

      Alert.alert(
        'Dekont Alındı',
        'Dekontunuz alındı. AI analiz ediyor, lütfen bekleyin.',
        [
          {
            text: 'Tamam',
            onPress: () => {
              setPhase('status');
              setAmount('');
              setImageUri(null);
              setLoadingStatus(true);
              fetchStatus().finally(() => setLoadingStatus(false));
            },
          },
        ]
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
      Alert.alert('Hata', 'Dekont yüklenemedi: ' + message);
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(iso?: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (phase === 'form') {
              setPhase('status');
            } else {
              router.back();
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Abonelik Ödemesi</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          phase === 'status' ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#0066FF"
            />
          ) : undefined
        }
      >
        {phase === 'status' ? (
          loadingStatus ? (
            <ActivityIndicator
              size="large"
              color="#0066FF"
              style={{ marginTop: 60 }}
            />
          ) : (
            renderStatusCard()
          )
        ) : (
          renderForm()
        )}
      </ScrollView>
    </SafeAreaView>
  );

  function renderStatusCard() {
    if (!nfcStatus) return null;

    if (nfcStatus.nfc_unlocked) {
      return (
        <View style={[styles.statusCard, styles.statusCardGreen]}>
          <View style={styles.statusIconRow}>
            <View style={[styles.statusIconBg, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="checkmark-circle" size={32} color="#10B981" />
            </View>
          </View>
          <Text style={[styles.statusTitle, { color: '#065F46' }]}>
            Aboneliginiz Aktif
          </Text>
          {nfcStatus.approved_at && (
            <Text style={styles.statusMeta}>
              Onay tarihi: {formatDate(nfcStatus.approved_at)}
            </Text>
          )}
          {nfcStatus.amount != null && (
            <Text style={styles.statusMeta}>
              Tutar: {nfcStatus.amount.toLocaleString('tr-TR')} TL
            </Text>
          )}

          {/* NFC Aktivasyon butonu — cihaz kayıtlıysa göster */}
          {deviceHwId && (
            <TouchableOpacity
              style={[styles.actionButton, styles.nfcButton]}
              onPress={() => {
                const hwId = encodeURIComponent(deviceHwId);
                const name = encodeURIComponent(deviceName ?? deviceHwId);
                const receiptParam = nfcStatus.receipt_id
                  ? `&receipt_id=${encodeURIComponent(nfcStatus.receipt_id)}`
                  : '';
                router.push(`/nfc-activate?device_id=${hwId}&device_name=${name}${receiptParam}`);
              }}
            >
              <Ionicons name="wifi" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.actionButtonText}>NFC ile Aktive Et</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#6B7280', marginTop: 10 }]}
            onPress={() => setPhase('form')}
          >
            <Text style={styles.actionButtonText}>Yeni Odeme Yukle</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (nfcStatus.reason === 'pending_review') {
      return (
        <View style={[styles.statusCard, styles.statusCardYellow]}>
          <View style={styles.statusIconRow}>
            <View style={[styles.statusIconBg, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="time" size={32} color="#D97706" />
            </View>
          </View>
          <Text style={[styles.statusTitle, { color: '#92400E' }]}>
            Dekontunuz Inceleniyor
          </Text>
          <Text style={styles.statusSub}>
            AI analiz ediliyor, lutfen bekleyin.
          </Text>
          <Text style={[styles.statusMeta, { marginTop: 12 }]}>
            Sayfayi asagi cekerek durumu yenileyebilirsiniz.
          </Text>
        </View>
      );
    }

    // no_payment veya rejected
    const isRejected = nfcStatus.reason === 'rejected';
    return (
      <View style={[styles.statusCard, styles.statusCardRed]}>
        <View style={styles.statusIconRow}>
          <View style={[styles.statusIconBg, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="close-circle" size={32} color="#EF4444" />
          </View>
        </View>
        <Text style={[styles.statusTitle, { color: '#7F1D1D' }]}>
          {isRejected ? 'Dekont Reddedildi' : 'Abonelik Odemesi Gerekli'}
        </Text>
        <Text style={styles.statusSub}>
          {isRejected
            ? 'Dekontunuz onaylanmadi. Lutfen tekrar yukleyin.'
            : 'NFC ozelligini kullanmak icin abonelik odemesi yapmaniz gerekiyor.'}
        </Text>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#EF4444', marginTop: 20 }]}
          onPress={() => setPhase('form')}
        >
          <Text style={styles.actionButtonText}>Dekont Yukle</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function renderForm() {
    return (
      <View>
        <TouchableOpacity style={styles.backLink} onPress={() => setPhase('status')}>
          <Ionicons name="arrow-back" size={18} color="#0066FF" />
          <Text style={styles.backLinkText}>Duruma Geri Don</Text>
        </TouchableOpacity>
        <Text style={styles.formTitle}>Odeme Dekontu Yukle</Text>
        <Text style={styles.formSub}>
          Banka havalesi dekontunu yukleyin, AI otomatik analiz edecek.
        </Text>

        <Text style={styles.label}>Odeme Tutari (TL)</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="Ornek: 500"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={[styles.label, { marginTop: 20 }]}>Dekont Fotografi</Text>

        <View style={styles.pickerRow}>
          <TouchableOpacity style={styles.pickerButton} onPress={pickFromCamera}>
            <Ionicons name="camera" size={22} color="#0066FF" />
            <Text style={styles.pickerButtonText}>Fotograf Cek</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pickerButton} onPress={pickFromGallery}>
            <Ionicons name="images" size={22} color="#0066FF" />
            <Text style={styles.pickerButtonText}>Galeriden Sec</Text>
          </TouchableOpacity>
        </View>

        {imageUri && (
          <View style={styles.previewBox}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.removeImage}
              onPress={() => setImageUri(null)}
            >
              <Ionicons name="close-circle" size={22} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.submitButton,
            (submitting || !imageUri) && styles.submitButtonDisabled,
          ]}
          onPress={submitReceipt}
          disabled={submitting || !imageUri}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Gonder</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }
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
  scroll: { padding: 16, paddingBottom: 60 },

  // Status cards
  statusCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
  },
  statusCardGreen: {
    backgroundColor: '#F0FDF4',
    borderColor: '#6EE7B7',
  },
  statusCardYellow: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
  },
  statusCardRed: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FCA5A5',
  },
  statusIconRow: { alignItems: 'center', marginBottom: 16 },
  statusIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  statusSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  statusMeta: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 4 },
  actionButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  nfcButton: {
    backgroundColor: '#0066FF',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  // Form
  formTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 4 },
  formSub: { fontSize: 14, color: '#6B7280', marginBottom: 24, lineHeight: 20 },
  label: { fontSize: 14, color: '#374151', fontWeight: '500', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  pickerRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  pickerButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  pickerButtonText: { color: '#0066FF', fontSize: 13, fontWeight: '600' },
  previewBox: {
    position: 'relative',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  removeImage: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 11,
  },
  submitButton: {
    backgroundColor: '#0066FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: { backgroundColor: '#93C5FD' },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  backLinkText: { color: '#0066FF', fontSize: 14, fontWeight: '500' },
});
