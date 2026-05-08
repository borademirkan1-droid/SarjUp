import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, Linking, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

type DebtBusiness = {
  id: string;
  name: string;
  city: string | null;
  monthly_fee: number | null;
  contact_phone: string | null;
  phone: string | null;
  contract_start_date: string | null;
  daysOverdue: number;
};

export default function Debts() {
  const router = useRouter();
  const [items, setItems] = useState<DebtBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id, name, city, monthly_fee, contact_phone, phone, contract_start_date, status')
      .eq('status', 'debt');

    if (!businesses) return;

    const now = new Date();
    const enriched: DebtBusiness[] = businesses.map((b) => {
      let daysOverdue = 0;
      if (b.contract_start_date) {
        const contractDate = new Date(b.contract_start_date);
        const dayOfMonth = contractDate.getDate();
        let lastPayment = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
        if (lastPayment > now) {
          lastPayment = new Date(now.getFullYear(), now.getMonth() - 1, dayOfMonth);
        }
        daysOverdue = Math.floor((now.getTime() - lastPayment.getTime()) / (1000 * 60 * 60 * 24));
      }
      return { ...b, daysOverdue };
    });

    enriched.sort((a, b) => b.daysOverdue - a.daysOverdue);
    setItems(enriched);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function callPhone(phone: string | null | undefined) {
    if (!phone) return;
    Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
  }

  function whatsapp(phone: string | null | undefined) {
    if (!phone) return;
    const cleaned = phone.replace(/\D/g, '');
    Linking.openURL(`https://wa.me/${cleaned.startsWith('90') ? cleaned : '90' + cleaned}`);
  }

  const totalDebt = items.reduce((sum, b) => sum + Number(b.monthly_fee || 0), 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/home')}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Borçlu İşletmeler</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0066FF" />
        </View>
      ) : (
        <>
          <View style={styles.summaryCard}>
            <View>
              <Text style={styles.summaryLabel}>Toplam Borç</Text>
              <Text style={styles.summaryValue}>{totalDebt.toLocaleString('tr-TR')} TL</Text>
            </View>
            <View style={styles.summaryRight}>
              <Text style={styles.summaryCount}>{items.length}</Text>
              <Text style={styles.summarySub}>İşletme</Text>
            </View>
          </View>

          {items.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="checkmark-circle" size={48} color="#10B981" />
              <Text style={styles.emptyText}>Borçlu işletme yok</Text>
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0066FF" />}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <TouchableOpacity onPress={() => router.push(`/business/${item.id}`)}>
                    <View style={styles.cardTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardName}>{item.name}</Text>
                        <Text style={styles.cardCity}>{item.city || '-'}</Text>
                      </View>
                      <Text style={styles.cardAmount}>{item.monthly_fee ?? 0} TL</Text>
                    </View>
                    {item.daysOverdue > 0 && (
                      <View style={styles.overdueBox}>
                        <Ionicons name="time" size={14} color="#991B1B" />
                        <Text style={styles.overdueText}>{item.daysOverdue} gün gecikmiş</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => callPhone(item.contact_phone || item.phone)}
                      disabled={!item.contact_phone && !item.phone}
                    >
                      <Ionicons name="call" size={16} color="#0066FF" />
                      <Text style={styles.actionText}>Ara</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => whatsapp(item.contact_phone || item.phone)}
                      disabled={!item.contact_phone && !item.phone}
                    >
                      <Ionicons name="logo-whatsapp" size={16} color="#10B981" />
                      <Text style={[styles.actionText, { color: '#10B981' }]}>WhatsApp</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionPay]}
                      onPress={() => router.push('/payment')}
                    >
                      <Ionicons name="card" size={16} color="#fff" />
                      <Text style={[styles.actionText, { color: '#fff' }]}>Ödeme</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  summaryCard: {
    backgroundColor: '#FEF2F2',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: { fontSize: 13, color: '#991B1B' },
  summaryValue: { fontSize: 28, fontWeight: '700', color: '#7F1D1D', marginTop: 4 },
  summaryRight: { alignItems: 'center' },
  summaryCount: { fontSize: 32, fontWeight: '700', color: '#7F1D1D' },
  summarySub: { fontSize: 12, color: '#991B1B' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  emptyText: { color: '#6B7280', fontSize: 15 },
  list: { padding: 16, paddingTop: 0 },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  cardName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  cardCity: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  cardAmount: { fontSize: 16, fontWeight: '700', color: '#EF4444' },
  overdueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  overdueText: { color: '#991B1B', fontSize: 12, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionPay: { backgroundColor: '#0066FF' },
  actionText: { fontSize: 12, fontWeight: '600', color: '#0066FF' },
});