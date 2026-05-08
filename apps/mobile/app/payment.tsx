import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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

type Step = 1 | 2 | 3 | 4 | 5;
type PaymentMethod = 'cash' | 'transfer';

type Business = {
  id: string;
  name: string;
  city: string | null;
  monthly_fee: number | null;
};

export default function Payment() {
  const router = useRouter();
  const { businessId } = useLocalSearchParams<{ businessId?: string }>();

  const [step, setStep] = useState<Step>(1);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [nfcUnlocked, setNfcUnlocked] = useState(false);

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);

  useEffect(() => {
    async function loadBusinesses() {
      const { data } = await supabase
        .from('businesses')
        .select('id, name, city, monthly_fee')
        .order('name');
      const list = data || [];
      setBusinesses(list);

      // URL'de businessId varsa otomatik seç ve adım 2'ye geç
      if (businessId) {
        const found = list.find((b) => b.id === businessId);
        if (found) {
          setSelectedBusiness(found);
          setAmount((found.monthly_fee ?? 0).toString());
          setStep(2);
        }
      }
      setLoadingBusinesses(false);
    }
    loadBusinesses();
  }, [businessId]);

  function selectBusiness(b: Business) {
    setSelectedBusiness(b);
    setAmount((b.monthly_fee ?? 0).toString());
    setStep(2);
  }

  async function confirmPayment() {
    if (!selectedBusiness) return;
    setStep(4);

    const amountNum = Number(amount);
    const commissionRate = 15;
    const commissionAmount = (amountNum * commissionRate) / 100;
    const netAmount = amountNum - commissionAmount;

    const { data: businessData } = await supabase
      .from('businesses')
      .select('partner_id')
      .eq('id', selectedBusiness.id)
      .single();

    const transactionNo = 'TRX-' + Date.now();

    const { error } = await supabase.from('payments').insert({
      transaction_no: transactionNo,
      business_id: selectedBusiness.id,
      partner_id: businessData?.partner_id ?? null,
      amount: amountNum,
      commission_rate: commissionRate,
      commission_amount: commissionAmount,
      net_amount: netAmount,
      method: method === 'cash' ? 'cash' : 'bank',
      status: 'completed',
      paid_at: new Date().toISOString(),
    });

    if (error) {
      alert('Ödeme kaydedilemedi: ' + error.message);
      setStep(3);
      return;
    }

    // NFC durum kontrolü
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: partnerData } = await supabase
        .from('partners')
        .select('id')
        .eq('email', user?.email ?? '')
        .maybeSingle();

      const nfcRes = await fetch(
        `https://admin.sarjup.com.tr/api/mobile/nfc-status?partner_id=${partnerData?.id ?? ''}`
      );
      const nfcData: { nfc_unlocked?: boolean } = await nfcRes.json();
      setNfcUnlocked(nfcData.nfc_unlocked === true);
    } catch {
      setNfcUnlocked(false);
    }

    setStep(5);
  }

  function finish() {
    router.replace('/home');
  }

  function handleBack() {
    if (step === 1) {
      router.replace('/home');
    } else if (step === 2 && businessId) {
      // İşletme detaydan gelmişse direkt geri dön
      router.back();
    } else {
      setStep((step - 1) as Step);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ödeme Al</Text>
        <Text style={styles.stepIndicator}>{step}/5</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {step === 1 && (
          <View>
            <Text style={styles.title}>İşletme Seç</Text>
            <Text style={styles.subtitle}>Ödeme alınacak işletmeyi seç</Text>
            {loadingBusinesses ? (
              <ActivityIndicator size="large" color="#0066FF" style={{ marginTop: 40 }} />
            ) : businesses.length === 0 ? (
              <Text style={styles.emptyText}>İşletme bulunamadı</Text>
            ) : (
              businesses.map((b) => (
                <TouchableOpacity key={b.id} style={styles.businessCard} onPress={() => selectBusiness(b)}>
                  <View style={styles.businessIcon}>
                    <Ionicons name="business" size={20} color="#0066FF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.businessName}>{b.name}</Text>
                    <Text style={styles.businessCity}>{b.city || ''}</Text>
                  </View>
                  <Text style={styles.businessAmount}>{b.monthly_fee ?? 0} TL</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {step === 2 && selectedBusiness && (
          <View>
            <Text style={styles.title}>Tutar ve Yöntem</Text>
            <Text style={styles.subtitle}>{selectedBusiness.name}</Text>

            <Text style={styles.label}>Tutar (TL)</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0"
            />

            <Text style={[styles.label, { marginTop: 20 }]}>Ödeme Yöntemi</Text>
            <TouchableOpacity
              style={[styles.methodCard, method === 'cash' && styles.methodCardActive]}
              onPress={() => setMethod('cash')}
            >
              <Ionicons name="cash" size={24} color={method === 'cash' ? '#0066FF' : '#6B7280'} />
              <Text style={[styles.methodText, method === 'cash' && styles.methodTextActive]}>Nakit</Text>
              {method === 'cash' && <Ionicons name="checkmark-circle" size={20} color="#0066FF" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.methodCard, method === 'transfer' && styles.methodCardActive]}
              onPress={() => setMethod('transfer')}
            >
              <Ionicons name="card" size={24} color={method === 'transfer' ? '#0066FF' : '#6B7280'} />
              <Text style={[styles.methodText, method === 'transfer' && styles.methodTextActive]}>Havale</Text>
              {method === 'transfer' && <Ionicons name="checkmark-circle" size={20} color="#0066FF" />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryButton} onPress={() => setStep(3)}>
              <Text style={styles.primaryButtonText}>Devam</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && selectedBusiness && (
          <View>
            <Text style={styles.title}>Onay</Text>
            <Text style={styles.subtitle}>Ödeme bilgilerini kontrol et</Text>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>İşletme</Text>
                <Text style={styles.summaryValue}>{selectedBusiness.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tutar</Text>
                <Text style={styles.summaryValueBig}>{amount} TL</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Yöntem</Text>
                <Text style={styles.summaryValue}>{method === 'cash' ? 'Nakit' : 'Havale'}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={confirmPayment}>
              <Text style={styles.primaryButtonText}>Ödemeyi Aldım</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 4 && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#0066FF" />
            <Text style={styles.loadingText}>Ödeme kaydediliyor...</Text>
          </View>
        )}

        {step === 5 && (
          <View style={styles.centered}>
            <View style={styles.successBadge}>
              <Ionicons name="checkmark" size={32} color="#fff" />
            </View>
            <Text style={styles.successTitle}>Ödeme Kaydedildi</Text>

            {nfcUnlocked ? (
              <>
                <Text style={styles.subtitle}>Şimdi cihazı yaklaştırın</Text>
                <View style={styles.nfcBox}>
                  <Ionicons name="phone-portrait" size={64} color="#0066FF" />
                  <Text style={styles.nfcText}>Cihazı telefona yaklaştırın</Text>
                  <ActivityIndicator size="small" color="#0066FF" style={{ marginTop: 12 }} />
                </View>
                <TouchableOpacity style={styles.primaryButton} onPress={finish}>
                  <Text style={styles.primaryButtonText}>Tamamla (Mock)</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.lockedBox}>
                  <Ionicons name="lock-closed" size={48} color="#F59E0B" />
                  <Text style={styles.lockedTitle}>Abonelik Gerekli</Text>
                  <Text style={styles.lockedSub}>
                    NFC özelliği için Şarjup abonelik ödemesi gerekli.
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: '#F59E0B' }]}
                  onPress={() => router.push('/subscription')}
                >
                  <Text style={styles.primaryButtonText}>Abonelik Ödemesi Yap</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: '#6B7280', marginTop: 10 }]}
                  onPress={finish}
                >
                  <Text style={styles.primaryButtonText}>Tamamla</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </ScrollView>
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
  stepIndicator: { fontSize: 14, color: '#6B7280' },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 20 },
  emptyText: { color: '#9CA3AF', fontSize: 14, textAlign: 'center', marginTop: 40 },
  businessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
    gap: 12,
  },
  businessIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  businessName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  businessCity: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  businessAmount: { fontSize: 15, fontWeight: '700', color: '#0066FF' },
  label: { fontSize: 14, color: '#374151', marginBottom: 6, marginTop: 8 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 14,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 10,
    gap: 12,
  },
  methodCardActive: { borderColor: '#0066FF', backgroundColor: '#EFF6FF' },
  methodText: { flex: 1, fontSize: 15, fontWeight: '500', color: '#6B7280' },
  methodTextActive: { color: '#0066FF', fontWeight: '600' },
  primaryButton: {
    backgroundColor: '#0066FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 16,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 14, color: '#6B7280' },
  summaryValue: { fontSize: 15, fontWeight: '600', color: '#111827' },
  summaryValueBig: { fontSize: 22, fontWeight: '700', color: '#0066FF' },
  centered: { alignItems: 'center', paddingTop: 40 },
  loadingText: { marginTop: 16, fontSize: 14, color: '#6B7280' },
  successBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  successTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 4 },
  nfcBox: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0066FF',
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 16,
  },
  nfcText: { fontSize: 15, color: '#374151', marginTop: 12, textAlign: 'center' },
  lockedBox: {
    width: '100%',
    backgroundColor: '#FFFBEB',
    padding: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FCD34D',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
    gap: 10,
  },
  lockedTitle: { fontSize: 18, fontWeight: '700', color: '#92400E' },
  lockedSub: { fontSize: 14, color: '#78350F', textAlign: 'center', lineHeight: 20 },
});