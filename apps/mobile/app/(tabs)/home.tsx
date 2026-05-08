import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

type UpcomingPayment = {
  id: string;
  name: string;
  monthly_fee: number | null;
  daysUntil: number;
  dateLabel: string;
};

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [upcoming, setUpcoming] = useState<UpcomingPayment[]>([]);
  const [debtTotal, setDebtTotal] = useState(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'unlocked' | 'pending' | 'locked' | null>(null);
  const [stats, setStats] = useState({
    activeBusinesses: 0,
    monthlyCollection: 0,
    pendingCount: 0,
    commission: 0,
  });

  const loadAll = useCallback(async () => {
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id, name, status, monthly_fee, contract_start_date');

    const activeBusinesses = businesses?.filter((b) => b.status === 'active').length ?? 0;
    const debtBusinesses = businesses?.filter((b) => b.status === 'debt') ?? [];
    const pendingCount = debtBusinesses.length;
    const debtSum = debtBusinesses.reduce((sum, b) => sum + Number(b.monthly_fee || 0), 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: payments } = await supabase
      .from('payments')
      .select('amount, status, created_at')
      .gte('created_at', startOfMonth.toISOString())
      .eq('status', 'completed');

    const monthlyCollection = payments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) ?? 0;
    const commission = monthlyCollection * 0.15;

    const now = new Date();
    const upcomingList: UpcomingPayment[] = [];

    businesses?.forEach((b) => {
      if (b.status !== 'active' || !b.contract_start_date) return;

      const contractDate = new Date(b.contract_start_date);
      const dayOfMonth = contractDate.getDate();

      let nextPayment = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
      if (nextPayment < now) {
        nextPayment = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth);
      }

      const daysUntil = Math.ceil((nextPayment.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntil <= 7) {
        upcomingList.push({
          id: b.id,
          name: b.name,
          monthly_fee: b.monthly_fee,
          daysUntil,
          dateLabel: nextPayment.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long' }),
        });
      }
    });

    upcomingList.sort((a, b) => a.daysUntil - b.daysUntil);

    const last24h = new Date();
    last24h.setHours(last24h.getHours() - 24);
    const { count } = await supabase
      .from('activity_logs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', last24h.toISOString());

    setStats({ activeBusinesses, monthlyCollection, pendingCount, commission });
    setUpcoming(upcomingList);
    setDebtTotal(debtSum);
    setUnreadCount(count ?? 0);

    // Abonelik / NFC durumu
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: partner } = await supabase
        .from('partners')
        .select('id')
        .eq('email', user?.email ?? '')
        .maybeSingle();

      if (partner?.id) {
        const r = await fetch(
          `https://admin.sarjup.com.tr/api/mobile/nfc-status?partner_id=${partner.id}`
        );
        const d: { nfc_unlocked?: boolean; reason?: string } = await r.json();
        if (d.nfc_unlocked) {
          setSubscriptionStatus('unlocked');
        } else if (d.reason === 'pending_review') {
          setSubscriptionStatus('pending');
        } else {
          setSubscriptionStatus('locked');
        }
      }
    } catch {
      // Banner göstermek zorunda değiliz — null kalır
    }
  }, []);

  useEffect(() => {
    loadAll().finally(() => setLoading(false));
  }, [loadAll]);

  async function onRefresh() {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>Şarjup</Text>
        <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.bellButton}>
          <Ionicons name="notifications-outline" size={24} color="#111827" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0066FF" />}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Hoş geldiniz</Text>
          <Text style={styles.name}>Bora Demirkan</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0066FF" style={{ marginVertical: 40 }} />
        ) : (
          <>
            {stats.pendingCount > 0 && (
              <TouchableOpacity style={styles.debtAlert} onPress={() => router.push('/debts')}>
                <View style={styles.debtIconBox}>
                  <Ionicons name="alert-circle" size={24} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.debtTitle}>{stats.pendingCount} işletme borçlu</Text>
                  <Text style={styles.debtSub}>Toplam {debtTotal.toLocaleString('tr-TR')} TL · Detayları gör</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>
            )}

            {subscriptionStatus === 'unlocked' && (
              <View style={[styles.subBanner, styles.subBannerGreen]}>
                <View style={styles.subBannerDot} />
                <Text style={styles.subBannerText}>Abonelik Aktif</Text>
              </View>
            )}
            {subscriptionStatus === 'pending' && (
              <TouchableOpacity
                style={[styles.subBanner, styles.subBannerYellow]}
                onPress={() => router.push('/subscription')}
              >
                <Ionicons name="time-outline" size={16} color="#92400E" />
                <Text style={[styles.subBannerText, { color: '#92400E', flex: 1 }]}>
                  Dekont Inceleniyor
                </Text>
                <Text style={styles.subBannerLink}>Detay</Text>
                <Ionicons name="chevron-forward" size={14} color="#92400E" />
              </TouchableOpacity>
            )}
            {subscriptionStatus === 'locked' && (
              <TouchableOpacity
                style={[styles.subBanner, styles.subBannerOrange]}
                onPress={() => router.push('/subscription')}
              >
                <Ionicons name="warning-outline" size={16} color="#7C2D12" />
                <Text style={[styles.subBannerText, { color: '#7C2D12', flex: 1 }]}>
                  Abonelik Odemesi Gerekli
                </Text>
                <Text style={styles.subBannerLink}>Odeme Yap</Text>
                <Ionicons name="chevron-forward" size={14} color="#7C2D12" />
              </TouchableOpacity>
            )}

            <View style={styles.cards}>
              <View style={styles.card}>
                <Ionicons name="business" size={20} color="#0066FF" />
                <Text style={styles.cardLabel}>Aktif İşletme</Text>
                <Text style={styles.cardValue}>{stats.activeBusinesses}</Text>
              </View>
              <View style={styles.card}>
                <Ionicons name="cash" size={20} color="#10B981" />
                <Text style={styles.cardLabel}>Bu Ay Tahsilat</Text>
                <Text style={styles.cardValue}>{stats.monthlyCollection.toLocaleString('tr-TR')} TL</Text>
              </View>
              <View style={styles.card}>
                <Ionicons name="time" size={20} color="#F59E0B" />
                <Text style={styles.cardLabel}>Bekleyen</Text>
                <Text style={styles.cardValue}>{stats.pendingCount}</Text>
              </View>
              <View style={styles.card}>
                <Ionicons name="trending-up" size={20} color="#8B5CF6" />
                <Text style={styles.cardLabel}>Komisyon</Text>
                <Text style={styles.cardValue}>{Math.round(stats.commission).toLocaleString('tr-TR')} TL</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Hızlı Eylemler</Text>

            <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/payment')}>
              <Ionicons name="card" size={22} color="#fff" />
              <Text style={styles.primaryButtonText}>Ödeme Al</Text>
            </TouchableOpacity>

            <View style={styles.row}>
              <TouchableOpacity style={styles.secondaryButton}>
                <Ionicons name="refresh" size={20} color="#0066FF" />
                <Text style={styles.secondaryButtonText}>Cihaz Yenile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton}>
                <Ionicons name="add" size={20} color="#0066FF" />
                <Text style={styles.secondaryButtonText}>Yeni İşletme</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Yaklaşan Ödemeler</Text>
            {upcoming.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>7 gün içinde ödeme yok</Text>
              </View>
            ) : (
              upcoming.map((u) => (
                <TouchableOpacity
                  key={u.id}
                  style={styles.upcomingCard}
                  onPress={() => router.push(`/business/${u.id}`)}
                >
                  <View style={[styles.dayBadge, u.daysUntil <= 2 && styles.dayBadgeUrgent]}>
                    <Text style={[styles.dayNum, u.daysUntil <= 2 && styles.dayNumUrgent]}>
                      {u.daysUntil === 0 ? 'Bugün' : `${u.daysUntil}g`}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.upcomingName}>{u.name}</Text>
                    <Text style={styles.upcomingDate}>{u.dateLabel}</Text>
                  </View>
                  <Text style={styles.upcomingAmount}>{u.monthly_fee ?? 0} TL</Text>
                </TouchableOpacity>
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  brand: { fontSize: 22, fontWeight: '700', color: '#0066FF' },
  bellButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 20 },
  greeting: { fontSize: 14, color: '#6B7280' },
  name: { fontSize: 24, fontWeight: '700', color: '#111827', marginTop: 2 },
  debtAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    padding: 14,
    borderRadius: 12,
    gap: 12,
    marginBottom: 16,
  },
  debtIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  debtTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  debtSub: { color: '#FECACA', fontSize: 12, marginTop: 2 },
  cards: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  card: {
    flexBasis: '47%',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardLabel: { fontSize: 12, color: '#6B7280', marginTop: 8 },
  cardValue: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginTop: 8, marginBottom: 12 },
  primaryButton: {
    backgroundColor: '#0066FF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryButtonText: { color: '#0066FF', fontSize: 13, fontWeight: '600' },
  emptyBox: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  emptyText: { color: '#9CA3AF', fontSize: 14 },
  upcomingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
    marginBottom: 8,
  },
  dayBadge: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBadgeUrgent: { backgroundColor: '#FEE2E2' },
  dayNum: { fontSize: 14, fontWeight: '700', color: '#0066FF' },
  dayNumUrgent: { color: '#EF4444' },
  upcomingName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  upcomingDate: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  upcomingAmount: { fontSize: 15, fontWeight: '700', color: '#0066FF' },
  subBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
    borderWidth: 1,
  },
  subBannerGreen: { backgroundColor: '#F0FDF4', borderColor: '#6EE7B7' },
  subBannerYellow: { backgroundColor: '#FFFBEB', borderColor: '#FCD34D' },
  subBannerOrange: { backgroundColor: '#FFF7ED', borderColor: '#FDBA74' },
  subBannerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  subBannerText: { fontSize: 13, fontWeight: '600', color: '#065F46' },
  subBannerLink: { fontSize: 12, fontWeight: '700', color: '#0066FF' },
});