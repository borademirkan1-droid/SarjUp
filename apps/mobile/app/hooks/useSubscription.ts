import { useCallback, useEffect, useState } from 'react';
import { Alert, BackHandler } from 'react-native';
import { supabase } from '../../lib/supabase';

export type NfcStatus = {
  nfc_unlocked: boolean;
  reason?: string;
  approved_at?: string;
  amount?: number;
  receipt_id?: string;
};

export type ScreenPhase = 'status' | 'form';

type UseSubscriptionResult = {
  phase: ScreenPhase;
  setPhase: (p: ScreenPhase) => void;
  loadingStatus: boolean;
  setLoadingStatus: (v: boolean) => void;
  refreshing: boolean;
  nfcStatus: NfcStatus | null;
  partnerId: string | null;
  deviceId: string | null;
  deviceHwId: string | null;
  deviceName: string | null;
  fetchStatus: () => Promise<void>;
  onRefresh: () => Promise<void>;
  submitReceipt: (params: SubmitReceiptParams) => Promise<void>;
  submitting: boolean;
  formatDate: (iso?: string) => string;
};

type SubmitReceiptParams = {
  imageUri: string | null;
  imageMime: string;
  amount: string;
  onSuccess: () => void;
};

export function useSubscription(): UseSubscriptionResult {
  const [phase, setPhase] = useState<ScreenPhase>('status');
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nfcStatus, setNfcStatus] = useState<NfcStatus | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [deviceHwId, setDeviceHwId] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState<string | null>(null);
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

  async function submitReceipt({ imageUri, imageMime, amount, onSuccess }: SubmitReceiptParams) {
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
        { method: 'POST', body: formData }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Sunucu hatası: ${res.status}`);
      }

      Alert.alert(
        'Dekont Alındı',
        'Dekontunuz alındı. AI analiz ediyor, lütfen bekleyin.',
        [{ text: 'Tamam', onPress: onSuccess }]
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

  return {
    phase,
    setPhase,
    loadingStatus,
    setLoadingStatus,
    refreshing,
    nfcStatus,
    partnerId,
    deviceId,
    deviceHwId,
    deviceName,
    fetchStatus,
    onRefresh,
    submitReceipt,
    submitting,
    formatDate,
  };
}
