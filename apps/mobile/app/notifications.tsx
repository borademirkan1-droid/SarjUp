import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

type Activity = {
  id: string;
  actor_type: string;
  action: string;
  resource_type: string;
  details: any;
  created_at: string;
};

export default function Notifications() {
  const router = useRouter();
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('activity_logs')
      .select('id, actor_type, action, resource_type, details, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    setItems(data || []);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function getIcon(action: string, resourceType: string) {
    if (action.includes('payment') || resourceType === 'payment') return { icon: 'cash' as const, color: '#10B981' };
    if (action.includes('device') || resourceType === 'device') return { icon: 'hardware-chip' as const, color: '#0066FF' };
    if (action.includes('business') || resourceType === 'business') return { icon: 'business' as const, color: '#8B5CF6' };
    if (action.includes('partner') || resourceType === 'partner') return { icon: 'people' as const, color: '#F59E0B' };
    if (action.includes('login') || action.includes('logout')) return { icon: 'log-in' as const, color: '#6B7280' };
    return { icon: 'notifications' as const, color: '#6B7280' };
  }

  function getActionLabel(action: string) {
    const labels: Record<string, string> = {
      payment_received: 'Ödeme alındı',
      payment_created: 'Ödeme oluşturuldu',
      device_added: 'Cihaz eklendi',
      device_assigned: 'Cihaz atandı',
      business_created: 'İşletme eklendi',
      business_updated: 'İşletme güncellendi',
      partner_created: 'Partner eklendi',
      login: 'Giriş yapıldı',
      logout: 'Çıkış yapıldı',
    };
    return labels[action] || action;
  }

  function timeAgo(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;
    if (diff < 60) return 'Az önce';
    if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} gün önce`;
    return date.toLocaleDateString('tr-TR');
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/home')}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bildirimler</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color="#0066FF" />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="notifications-off-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyText}>Henüz bildirim yok</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0066FF" />}
          renderItem={({ item }) => {
            const iconInfo = getIcon(item.action, item.resource_type);
            return (
              <View style={styles.card}>
                <View style={[styles.cardIcon, { backgroundColor: iconInfo.color + '20' }]}>
                  <Ionicons name={iconInfo.icon} size={18} color={iconInfo.color} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{getActionLabel(item.action)}</Text>
                  {item.details && typeof item.details === 'object' && item.details.message && (
                    <Text style={styles.cardDesc}>{item.details.message}</Text>
                  )}
                  <Text style={styles.cardTime}>{timeAgo(item.created_at)}</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  list: { padding: 16, gap: 10 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  cardDesc: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  cardTime: { fontSize: 11, color: '#9CA3AF', marginTop: 6 },
});