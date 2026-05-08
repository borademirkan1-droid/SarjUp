import { useEffect, useState, useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { getCache, setCache } from '../../lib/cache';

type Business = {
  id: string;
  name: string;
  city: string | null;
  district: string | null;
  business_type: string;
  status: string;
  monthly_fee: number | null;
  device_count: number | null;
};

type FilterType = 'all' | 'active' | 'debt' | 'inactive';

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'active', label: 'Aktif' },
  { value: 'debt', label: 'Borçlu' },
  { value: 'inactive', label: 'Pasif' },
];

export default function Businesses() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [fromCache, setFromCache] = useState(false);

  const loadBusinesses = useCallback(async (useCache = true) => {
    // Önce cache'i göster
    if (useCache) {
      const cached = await getCache<Business[]>('businesses');
      if (cached) {
        setBusinesses(cached.data);
        setFromCache(true);
        setLoading(false);
      }
    }

    // Sonra fresh data çek
    const { data, error } = await supabase
      .from('businesses')
      .select('id, name, city, district, business_type, status, monthly_fee, device_count')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBusinesses(data);
      setFromCache(false);
      await setCache('businesses', data);
    }
  }, []);

  useEffect(() => {
    loadBusinesses().finally(() => setLoading(false));
  }, [loadBusinesses]);

  async function onRefresh() {
    setRefreshing(true);
    await loadBusinesses(false);
    setRefreshing(false);
  }

  const filtered = useMemo(() => {
    let list = businesses;
    if (filter !== 'all') {
      list = list.filter((b) => b.status === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          (b.city && b.city.toLowerCase().includes(q)) ||
          (b.district && b.district.toLowerCase().includes(q))
      );
    }
    return list;
  }, [businesses, filter, search]);

  function getCount(f: FilterType) {
    if (f === 'all') return businesses.length;
    return businesses.filter((b) => b.status === f).length;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>İşletmelerim</Text>
        <Text style={styles.count}>{filtered.length} / {businesses.length}</Text>
      </View>

      {fromCache && (
        <View style={styles.cacheBanner}>
          <Ionicons name="cloud-offline-outline" size={14} color="#92400E" />
          <Text style={styles.cacheBannerText}>Önbellekten gösteriliyor</Text>
        </View>
      )}

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="İşletme ara..."
          placeholderTextColor="#9CA3AF"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
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
          <Text style={styles.emptyText}>
            {search ? 'Arama sonucu bulunamadı' : 'Bu filtrede işletme yok'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0066FF" />}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/business/${item.id}`)}>
              <View style={styles.cardIcon}>
                <Ionicons name="business" size={20} color="#0066FF" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardSubtitle}>
                  {item.city || ''} {item.district ? `· ${item.district}` : ''}
                </Text>
                <View style={styles.cardMeta}>
                  <View style={[styles.badge, item.status === 'active' && styles.badgeActive, item.status === 'debt' && styles.badgeDebt]}>
                    <Text style={[styles.badgeText, item.status === 'active' && styles.badgeTextActive, item.status === 'debt' && styles.badgeTextDebt]}>
                      {item.status === 'active' ? 'Aktif' : item.status === 'debt' ? 'Borçlu' : 'Pasif'}
                    </Text>
                  </View>
                  {item.monthly_fee && <Text style={styles.cardFee}>{item.monthly_fee} TL/ay</Text>}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  count: { fontSize: 13, color: '#6B7280' },
  cacheBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingVertical: 6,
  },
  cacheBannerText: { color: '#92400E', fontSize: 12, fontWeight: '500' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
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
    alignItems: 'center',
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
  cardName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  cardSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: '#F3F4F6' },
  badgeActive: { backgroundColor: '#D1FAE5' },
  badgeDebt: { backgroundColor: '#FEE2E2' },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
  badgeTextActive: { color: '#065F46' },
  badgeTextDebt: { color: '#991B1B' },
  cardFee: { fontSize: 12, color: '#6B7280' },
});