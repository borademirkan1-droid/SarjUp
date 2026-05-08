import { useEffect, useState, useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { getCache, setCache } from '../../lib/cache';

type Device = {
  id: string;
  device_id: string | null;
  serial_number: string | null;
  status: string;
  battery_health: number | null;
  subscription_end_date: string | null;
  business_id: string | null;
  business_name?: string;
};

type FilterType = 'all' | 'active' | 'stock' | 'maintenance' | 'broken';

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'active', label: 'Aktif' },
  { value: 'stock', label: 'Stokta' },
  { value: 'maintenance', label: 'Bakım' },
  { value: 'broken', label: 'Arızalı' },
];

export default function Devices() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [fromCache, setFromCache] = useState(false);

  const load = useCallback(async (useCache = true) => {
    if (useCache) {
      const cached = await getCache<Device[]>('devices');
      if (cached) {
        setDevices(cached.data);
        setFromCache(true);
        setLoading(false);
      }
    }

    const { data: devicesData } = await supabase
      .from('devices')
      .select('id, device_id, serial_number, status, battery_health, subscription_end_date, business_id')
      .order('created_at', { ascending: false });

    if (!devicesData) return;

    const businessIds = [...new Set(devicesData.map((d) => d.business_id).filter(Boolean))];
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id, name')
      .in('id', businessIds as string[]);

    const businessMap = new Map(businesses?.map((b) => [b.id, b.name]) ?? []);

    const enriched = devicesData.map((d) => ({
      ...d,
      business_name: d.business_id ? businessMap.get(d.business_id) : undefined,
    }));

    setDevices(enriched);
    setFromCache(false);
    await setCache('devices', enriched);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load(false);
    setRefreshing(false);
  }

  const filtered = useMemo(() => {
    let list = devices;
    if (filter !== 'all') {
      list = list.filter((d) => d.status === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (d) =>
          (d.device_id && d.device_id.toLowerCase().includes(q)) ||
          (d.serial_number && d.serial_number.toLowerCase().includes(q)) ||
          (d.business_name && d.business_name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [devices, filter, search]);

  function getCount(f: FilterType) {
    if (f === 'all') return devices.length;
    return devices.filter((d) => d.status === f).length;
  }

  function getStatusInfo(status: string) {
    switch (status) {
      case 'active': return { label: 'Aktif', color: '#10B981' };
      case 'stock': return { label: 'Stokta', color: '#6B7280' };
      case 'maintenance': return { label: 'Bakımda', color: '#F59E0B' };
      case 'broken': return { label: 'Arızalı', color: '#EF4444' };
      case 'retired': return { label: 'Emekli', color: '#9CA3AF' };
      default: return { label: status, color: '#6B7280' };
    }
  }

  function getBatteryIcon(health: number | null) {
    if (!health) return { icon: 'battery-dead-outline' as const, color: '#9CA3AF' };
    if (health > 70) return { icon: 'battery-full' as const, color: '#10B981' };
    if (health > 30) return { icon: 'battery-half' as const, color: '#F59E0B' };
    return { icon: 'battery-dead' as const, color: '#EF4444' };
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Cihazlarım</Text>
        <Text style={styles.count}>{filtered.length} / {devices.length}</Text>
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
          placeholder="Cihaz ara..."
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
            {search ? 'Arama sonucu bulunamadı' : 'Bu filtrede cihaz yok'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0066FF" />}
          renderItem={({ item }) => {
            const statusInfo = getStatusInfo(item.status);
            const batteryInfo = getBatteryIcon(item.battery_health);
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/device/${item.id}`)}
              >
                <View style={styles.cardIcon}>
                  <Ionicons name="hardware-chip" size={20} color="#0066FF" />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardName}>{item.device_id || item.serial_number || 'Cihaz'}</Text>
                  <Text style={styles.cardSubtitle}>
                    {item.business_name ? (
                      <>
                        <Ionicons name="business" size={11} color="#6B7280" /> {item.business_name}
                      </>
                    ) : (
                      'Atanmamış'
                    )}
                  </Text>
                  <View style={styles.cardMeta}>
                    <View style={[styles.badge, { backgroundColor: statusInfo.color + '20' }]}>
                      <View style={[styles.dot, { backgroundColor: statusInfo.color }]} />
                      <Text style={[styles.badgeText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                    </View>
                    {item.battery_health !== null && (
                      <View style={styles.batteryBox}>
                        <Ionicons name={batteryInfo.icon} size={14} color={batteryInfo.color} />
                        <Text style={styles.batteryText}>{item.battery_health}%</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
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
  cardSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  batteryBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  batteryText: { fontSize: 12, color: '#374151', fontWeight: '500' },
});