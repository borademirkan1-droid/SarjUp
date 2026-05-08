import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { generateAndSharePDF } from '../lib/pdf';

type MonthlyData = {
  monthKey: string;
  monthLabel: string;
  total: number;
  commission: number;
  count: number;
  payments: any[];
};

export default function Earnings() {
  const router = useRouter();
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState('Partner');

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      const { data: partner } = await supabase
        .from('partners')
        .select('full_name')
        .eq('email', user.email)
        .maybeSingle();
      if (partner?.full_name) setPartnerName(partner.full_name);
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const { data: payments } = await supabase
      .from('payments')
      .select('amount, status, paid_at, created_at, commission_amount, method, business_id')
      .gte('created_at', sixMonthsAgo.toISOString())
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (!payments) return;

    const businessIds = [...new Set(payments.map((p) => p.business_id).filter(Boolean))];
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id, name')
      .in('id', businessIds as string[]);
    const businessMap = new Map(businesses?.map((b) => [b.id, b.name]) ?? []);

    const months: Record<string, MonthlyData> = {};
    payments.forEach((p) => {
      const date = new Date(p.paid_at || p.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

      if (!months[key]) {
        months[key] = { monthKey: key, monthLabel, total: 0, commission: 0, count: 0, payments: [] };
      }
      months[key].total += Number(p.amount || 0);
      months[key].commission += Number(p.commission_amount || 0);
      months[key].count += 1;
      months[key].payments.push({
        ...p,
        business_name: p.business_id ? businessMap.get(p.business_id) : undefined,
      });
    });

    const sorted = Object.values(months).sort((a, b) => b.monthKey.localeCompare(a.monthKey));
    setData(sorted);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function downloadPDF(month: MonthlyData) {
    setGenerating(month.monthKey);
    try {
      await generateAndSharePDF({
        partnerName,
        monthLabel: month.monthLabel,
        totalCollection: month.total,
        totalCommission: month.commission,
        paymentCount: month.count,
        payments: month.payments,
      });
    } catch (e: any) {
      alert('PDF oluşturulamadı: ' + e.message);
    } finally {
      setGenerating(null);
    }
  }

  const totalCommission = data.reduce((sum, m) => sum + m.commission, 0);
  const totalCollection = data.reduce((sum, m) => sum + m.total, 0);

  let trend = 0;
  if (data.length >= 2) {
    const current = data[0].commission;
    const previous = data[1].commission;
    if (previous > 0) {
      trend = Math.round(((current - previous) / previous) * 100);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/profile')}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kazançlarım</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0066FF" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0066FF" />}
        >
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Son 6 Ay Toplam Komisyon</Text>
            <Text style={styles.summaryValue}>{Math.round(totalCommission).toLocaleString('tr-TR')} TL</Text>
            <Text style={styles.summarySub}>Toplam tahsilat: {totalCollection.toLocaleString('tr-TR')} TL</Text>

            {trend !== 0 && (
              <View style={[styles.trendBadge, trend > 0 ? styles.trendUp : styles.trendDown]}>
                <Ionicons
                  name={trend > 0 ? 'trending-up' : 'trending-down'}
                  size={14}
                  color={trend > 0 ? '#065F46' : '#991B1B'}
                />
                <Text style={[styles.trendText, trend > 0 ? styles.trendTextUp : styles.trendTextDown]}>
                  {trend > 0 ? '+' : ''}{trend}% (bu ay)
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.sectionTitle}>Aylara Göre</Text>

          {data.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Henüz kazanç kaydı yok</Text>
            </View>
          ) : (
            data.map((m) => (
              <View key={m.monthKey} style={styles.monthCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.monthLabel}>{m.monthLabel}</Text>
                  <Text style={styles.monthMeta}>{m.count} ödeme · Toplam {m.total.toLocaleString('tr-TR')} TL</Text>
                </View>
                <Text style={styles.monthCommission}>+{Math.round(m.commission).toLocaleString('tr-TR')} TL</Text>
                <TouchableOpacity
                  style={styles.pdfButton}
                  onPress={() => downloadPDF(m)}
                  disabled={generating === m.monthKey}
                >
                  {generating === m.monthKey ? (
                    <ActivityIndicator size="small" color="#0066FF" />
                  ) : (
                    <Ionicons name="document-outline" size={18} color="#0066FF" />
                  )}
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
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
  content: { padding: 16, paddingBottom: 40 },
  summaryCard: {
    backgroundColor: '#0066FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  summaryLabel: { color: '#DBEAFE', fontSize: 13 },
  summaryValue: { color: '#fff', fontSize: 32, fontWeight: '700', marginTop: 6 },
  summarySub: { color: '#DBEAFE', fontSize: 13, marginTop: 4 },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  trendUp: { backgroundColor: '#D1FAE5' },
  trendDown: { backgroundColor: '#FEE2E2' },
  trendText: { fontSize: 12, fontWeight: '600' },
  trendTextUp: { color: '#065F46' },
  trendTextDown: { color: '#991B1B' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
  emptyBox: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  emptyText: { color: '#9CA3AF', fontSize: 14 },
  monthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
    gap: 12,
  },
  monthLabel: { fontSize: 15, fontWeight: '600', color: '#111827', textTransform: 'capitalize' },
  monthMeta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  monthCommission: { fontSize: 15, fontWeight: '700', color: '#10B981' },
  pdfButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});