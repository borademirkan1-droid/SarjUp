import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

type Partner = {
  full_name: string;
  phone: string | null;
  email: string | null;
  city: string | null;
  district: string | null;
  address: string | null;
  company_name: string | null;
  tax_number: string | null;
  commission_rate: number | null;
  status: string;
};

export default function Profile() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const userEmail = user.email || '';
      setEmail(userEmail);

      if (userEmail) {
        const { data } = await supabase
          .from('partners')
          .select('full_name, phone, email, city, district, address, company_name, tax_number, commission_rate, status')
          .eq('email', userEmail)
          .maybeSingle();
        setPartner(data);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  const displayName = partner?.full_name || email.split('@')[0] || 'Kullanıcı';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0066FF" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#0066FF" />
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.emailLine}>{email}</Text>

          <TouchableOpacity style={styles.menuButton} onPress={() => router.push('/earnings')}>
            <View style={[styles.menuIcon, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="trending-up" size={18} color="#10B981" />
            </View>
            <Text style={styles.menuText}>Kazançlarım</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuButton} onPress={() => router.push('/change-password')}>
            <View style={[styles.menuIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="lock-closed" size={18} color="#F59E0B" />
            </View>
            <Text style={styles.menuText}>Şifre Değiştir</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          {partner ? (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
                <Row icon="person-outline" label="Ad Soyad" value={partner.full_name} />
                <Row icon="call-outline" label="Telefon" value={partner.phone ?? '-'} />
                <Row icon="mail-outline" label="E-posta" value={partner.email ?? '-'} />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Adres</Text>
                <Row icon="location-outline" label="Şehir" value={partner.city ?? '-'} />
                <Row icon="map-outline" label="İlçe" value={partner.district ?? '-'} />
                <Row icon="home-outline" label="Adres" value={partner.address ?? '-'} />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Şirket Bilgileri</Text>
                <Row icon="business-outline" label="Firma" value={partner.company_name ?? '-'} />
                <Row icon="document-text-outline" label="Vergi No" value={partner.tax_number ?? '-'} />
                <Row icon="trending-up-outline" label="Komisyon" value={partner.commission_rate ? `%${partner.commission_rate}` : '-'} />
              </View>
            </>
          ) : (
            <View style={styles.warningBox}>
              <Ionicons name="information-circle-outline" size={20} color="#F59E0B" />
              <Text style={styles.warningText}>
                Partner kaydı bulunamadı. Yöneticinize başvurun.
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
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
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  content: { padding: 16, paddingBottom: 40, alignItems: 'center' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  name: { fontSize: 18, fontWeight: '600', color: '#111827', marginTop: 12 },
  emailLine: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 12,
    width: '100%',
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#111827' },
  section: {
    width: '100%',
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
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF3C7',
    padding: 14,
    borderRadius: 8,
    marginTop: 24,
  },
  warningText: { flex: 1, color: '#78350F', fontSize: 13 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 32,
  },
  logoutText: { color: '#EF4444', fontSize: 14, fontWeight: '600' },
});