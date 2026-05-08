import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

type Device = {
  id: string;
  device_id: string | null;
  serial_number: string | null;
  status: string;
  battery_health: number | null;
  subscription_end_date: string | null;
  business_id: string | null;
  production_batch: string | null;
  production_date: string | null;
  activation_date: string | null;
  last_maintenance: string | null;
  total_uses: number | null;
  total_usage_hours: number | null;
  monthly_avg_usage: number | null;
  stock_location: string | null;
  notes: string | null;
};

type Business = { id: string; name: string };

export default function DeviceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [device, setDevice] = useState<Device | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('devices').select('*').eq('id', id).single();
      setDevice(data);
      if (data?.business_id) {
        const { data: biz } = await supabase
          .from('businesses')
          .select('id, name')
          .eq('id', data.business_id)
          .single();
        setBusiness(biz);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={['top']}>
        <ActivityIndicator size="large" color="#0066FF" />
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.center} edges={['top']}>
        <Text style={styles.errorText}>Cihaz bulunamadı</Text>
      </SafeAreaView>
    );
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

  const statusInfo = getStatusInfo(device.status);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/devices')}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cihaz Detayı</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleBox}>
          <View style={styles.iconCircle}>
            <Ionicons name="hardware-chip" size={28} color="#0066FF" />
          </View>
          <Text style={styles.name}>{device.device_id || device.serial_number || 'Cihaz'}</Text>
          {device.serial_number && device.device_id && (
            <Text style={styles.subtitle}>SN: {device.serial_number}</Text>
          )}
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Durum</Text>
          <Row icon="battery-charging-outline" label="Pil Sağlığı" value={device.battery_health !== null ? `${device.battery_health}%` : '-'} />
          <Row icon="calendar-outline" label="Abonelik Bitiş" value={device.subscription_end_date ?? '-'} />
          <Row icon="business-outline" label="Atanan İşletme" value={business?.name ?? 'Atanmamış'} />
          <Row icon="location-outline" label="Stok Konumu" value={device.stock_location ?? '-'} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Üretim & Aktivasyon</Text>
          <Row icon="cube-outline" label="Üretim Partisi" value={device.production_batch ?? '-'} />
          <Row icon="hammer-outline" label="Üretim Tarihi" value={device.production_date ?? '-'} />
          <Row icon="play-circle-outline" label="Aktivasyon" value={device.activation_date ?? '-'} />
          <Row icon="construct-outline" label="Son Bakım" value={device.last_maintenance ?? '-'} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kullanım</Text>
          <Row icon="repeat-outline" label="Toplam Kullanım" value={String(device.total_uses ?? 0)} />
          <Row icon="time-outline" label="Toplam Saat" value={device.total_usage_hours ? `${device.total_usage_hours} sa` : '-'} />
          <Row icon="stats-chart-outline" label="Aylık Ortalama" value={device.monthly_avg_usage ? String(device.monthly_avg_usage) : '-'} />
        </View>

        {device.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notlar</Text>
            <Text style={styles.notes}>{device.notes}</Text>
          </View>
        )}

        {device.status === 'active' && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              const hwId = encodeURIComponent(device.device_id ?? device.id);
              const name = encodeURIComponent(device.device_id ?? device.serial_number ?? 'Cihaz');
              router.push(`/nfc-activate?device_id=${hwId}&device_name=${name}`);
            }}
          >
            <Ionicons name="wifi" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>NFC ile Aktive Et</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={18} color="#6B7280" />
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' },
  errorText: { color: '#EF4444', fontSize: 14 },
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
  titleBox: { alignItems: 'center', paddingVertical: 20 },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '600' },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 12, textTransform: 'uppercase' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  rowLabel: { fontSize: 14, color: '#6B7280', flex: 1 },
  rowValue: { fontSize: 14, color: '#111827', fontWeight: '500', textAlign: 'right', flexShrink: 1 },
  notes: { fontSize: 14, color: '#374151', lineHeight: 20 },
  primaryButton: {
    backgroundColor: '#0066FF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});