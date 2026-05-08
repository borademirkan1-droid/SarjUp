import { useEffect, useState, useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

type Payment = {
  id: string;
  transaction_no: string | null;
  amount: number;
  method: string;
  status: string;
  paid_at: string | null;
  created_at: string;
  business_id: string | null;
  business_name?: string;
};

type FilterType = 'all' | 'completed' | 'pending' | 'cash' | 'bank';

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'completed', label: 'Tamamlanan' },
  { value: 'pending', label: 'Bekleyen' },
  { value: 'cash', label: 'Nakit' },
  { value: 'bank', label: 'Havale' },
];

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const load = useCallback(async () => {
    const { data: paymentsData } = await supabase
      .from('payments')
      .select('id, transaction_no, amount, method, status, paid_at, created_at, business_id')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!paymentsData) return;

    const businessIds = [...new Set(paymentsData.map((p) => p.business_id).filter(Boolean))];
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id, name')
      .in('id', businessIds as string[]);

    const businessMap = new Map(businesses?.map((b) => [b.id, b.name]) ?? []);

    const enriched = paymentsData.map((p) => ({
      ...p,
      business_name: p.business_id ? businessMap.get(p.business_id) : undefined,
    }));

    setPayments(enriched);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const filtered = useMemo(() => {
    if (filter === 'all') return payments;
    if (filter === 'completed' || filter === 'pending') {
      return payments.filter((p) => p.status === filter);
    }
    return payments.filter((p) => p.method === filter);
  }, [payments, filter]);

  function getCount(f: FilterType) {
    if (f === 'all') return payments.length;
    if (f === 'completed' || f === 'pending') return payments.filter((p) => p.status === f).length;
    return payments.filter((p) => p.method === f).length;
  }

  function getStatusInfo(status: string) {
    switch (status) {
      case 'completed': return { label: 'Tamamlandı', color: '#10B981' };
      case 'pending': return { label: 'Beklemede', color: '#F59E0B' };
      case 'failed': return { label: 'Başarısız', color: '#EF4444' };
      case 'refunded': return { label: 'İade', color: '#6B7280' };
      default: return { label: status, color: '#6B7280' };
    }
  }

  function getMethodLabel(method: string) {
    switch (method) {
      case 'cash': return 'Nakit';
      case 'bank': return 'Havale';
      case 'iyzico': return 'iyzico';
      default: return method;
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR') + ' ' + d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  }

  const totalAmount = filtered
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Ödemeler</Text>
          <Text style={styles.subtitle}>{filtered.length} kayıt · Toplam {totalAmount.toLocaleString('tr-TR')} TL</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, filter === f.value && styles.filterChipActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>
              {f.label} ({getCount(f.value)})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color="#0066FF" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Bu filtrede ödeme yok</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0066FF" />}
          renderItem={({ item }) => {
            const statusInfo = getStatusInfo(item.status);
            return (
              <View style={styles.card}>
                <View style={styles.cardIcon}>
                  <Ionicons
                    name={item.method === 'cash' ? 'cash' : 'card'}
                    size={20}
                    color="#0066FF"
                  />
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.topRow}>
                    <Text style={styles.cardName}>{item.business_name || 'İşletme'}</Text>
                    <Text style={styles.amount}>{Number(item.amount).toLocaleString('tr-TR')} TL</Text>
                  </View>
                  <View style={styles.bottomRow}>
                    <Text style={styles.meta}>{getMethodLabel(item.method)} · {formatDate(item.paid_at || item.created_at)}</Text>
                    <View style={[styles.badge, { backgroundColor: statusInfo.color + '20' }]}>
                      <Text style={[styles.badgeText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
  },
  filterChipActive: { backgroundColor: '#0066FF' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  filterTextActive: { color: '#fff' },
  list: { padding: 16, gap: 10 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { color: '#9CA3AF', fontSize: 14 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
    marginBottom: 10,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  cardName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  amount: { fontSize: 15, fontWeight: '700', color: '#0066FF' },
  meta: { fontSize: 12, color: '#6B7280', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '600' },
});