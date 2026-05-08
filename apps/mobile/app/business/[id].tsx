import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

type Business = {
  id: string;
  name: string;
  business_type: string;
  status: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  district: string | null;
  contact_person: string | null;
  contact_phone: string | null;
  device_count: number | null;
  monthly_fee: number | null;
  contract_start_date: string | null;
  notes: string | null;
};

export default function BusinessDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('businesses').select('*').eq('id', id).single();
      setBusiness(data);
      setNotesText(data?.notes || '');
      setLoading(false);
    }
    load();
  }, [id]);

  async function saveNotes() {
    if (!business) return;
    setSavingNotes(true);
    const { error } = await supabase
      .from('businesses')
      .update({ notes: notesText })
      .eq('id', business.id);
    if (!error) {
      setBusiness({ ...business, notes: notesText });
      setEditingNotes(false);
    } else {
      alert('Not kaydedilemedi: ' + error.message);
    }
    setSavingNotes(false);
  }

  function callPhone(phone: string | null) {
    if (!phone) return;
    Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
  }

  function whatsapp(phone: string | null) {
    if (!phone) return;
    const cleaned = phone.replace(/\D/g, '');
    Linking.openURL(`https://wa.me/${cleaned.startsWith('90') ? cleaned : '90' + cleaned}`);
  }

  function maps(address: string | null, city: string | null, district: string | null) {
    const query = [address, district, city].filter(Boolean).join(', ');
    if (!query) return;
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={['top']}>
        <ActivityIndicator size="large" color="#0066FF" />
      </SafeAreaView>
    );
  }

  if (!business) {
    return (
      <SafeAreaView style={styles.center} edges={['top']}>
        <Text style={styles.errorText}>İşletme bulunamadı</Text>
      </SafeAreaView>
    );
  }

  const statusLabel = business.status === 'active' ? 'Aktif' : business.status === 'debt' ? 'Borçlu' : 'Pasif';
  const statusColor = business.status === 'active' ? '#10B981' : business.status === 'debt' ? '#EF4444' : '#9CA3AF';
  const phoneToCall = business.contact_phone || business.phone;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/businesses')}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İşletme Detayı</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleBox}>
          <View style={styles.iconCircle}>
            <Ionicons name="business" size={28} color="#0066FF" />
          </View>
          <Text style={styles.name}>{business.name}</Text>
          <Text style={styles.subtitle}>
            {business.city || ''} {business.district ? `· ${business.district}` : ''}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => callPhone(phoneToCall)}
            disabled={!phoneToCall}
          >
            <Ionicons name="call" size={20} color={phoneToCall ? '#0066FF' : '#9CA3AF'} />
            <Text style={[styles.quickText, !phoneToCall && { color: '#9CA3AF' }]}>Ara</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => whatsapp(phoneToCall)}
            disabled={!phoneToCall}
          >
            <Ionicons name="logo-whatsapp" size={20} color={phoneToCall ? '#10B981' : '#9CA3AF'} />
            <Text style={[styles.quickText, { color: phoneToCall ? '#10B981' : '#9CA3AF' }]}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => maps(business.address, business.city, business.district)}
            disabled={!business.address && !business.city}
          >
            <Ionicons name="navigate" size={20} color={business.address || business.city ? '#8B5CF6' : '#9CA3AF'} />
            <Text style={[styles.quickText, { color: business.address || business.city ? '#8B5CF6' : '#9CA3AF' }]}>Yol</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Genel Bilgiler</Text>
          <Row icon="pricetag-outline" label="İşletme Türü" value={business.business_type} />
          <Row icon="hardware-chip-outline" label="Cihaz Sayısı" value={String(business.device_count ?? 0)} />
          <Row icon="cash-outline" label="Aylık Ücret" value={business.monthly_fee ? `${business.monthly_fee} TL` : '-'} />
          <Row icon="calendar-outline" label="Sözleşme Başlangıç" value={business.contract_start_date ?? '-'} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İletişim</Text>
          <Row icon="person-outline" label="Yetkili" value={business.contact_person ?? '-'} />
          <Row icon="call-outline" label="Telefon" value={business.contact_phone ?? business.phone ?? '-'} />
          <Row icon="mail-outline" label="E-posta" value={business.email ?? '-'} />
          <Row icon="location-outline" label="Adres" value={business.address ?? '-'} />
        </View>

        <View style={styles.section}>
          <View style={styles.notesHeader}>
            <Text style={styles.sectionTitle}>Notlar</Text>
            {!editingNotes && (
              <TouchableOpacity onPress={() => setEditingNotes(true)}>
                <Ionicons name="create-outline" size={18} color="#0066FF" />
              </TouchableOpacity>
            )}
          </View>
          {editingNotes ? (
            <>
              <TextInput
                style={styles.notesInput}
                value={notesText}
                onChangeText={setNotesText}
                placeholder="Bu işletme hakkında not yaz..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
              />
              <View style={styles.notesActions}>
                <TouchableOpacity
                  style={[styles.notesBtn, styles.notesBtnCancel]}
                  onPress={() => {
                    setNotesText(business.notes || '');
                    setEditingNotes(false);
                  }}
                  disabled={savingNotes}
                >
                  <Text style={styles.notesBtnCancelText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.notesBtn, styles.notesBtnSave]}
                  onPress={saveNotes}
                  disabled={savingNotes}
                >
                  {savingNotes ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.notesBtnSaveText}>Kaydet</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={styles.notes}>
              {business.notes || 'Henüz not yok. Düzenlemek için kaleme dokun.'}
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push(`/payment?businessId=${business.id}`)}>
          <Ionicons name="card" size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>Bu İşletmeden Ödeme Al</Text>
        </TouchableOpacity>
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
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
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
  quickActions: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 8,
    gap: 8,
    marginTop: 8,
  },
  quickBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 4,
    borderRadius: 8,
  },
  quickText: { fontSize: 12, fontWeight: '600', color: '#0066FF' },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 12, textTransform: 'uppercase' },
  notesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  rowLabel: { fontSize: 14, color: '#6B7280', flex: 1 },
  rowValue: { fontSize: 14, color: '#111827', fontWeight: '500', textAlign: 'right', flexShrink: 1 },
  notes: { fontSize: 14, color: '#374151', lineHeight: 20 },
  notesInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  notesActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  notesBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  notesBtnCancel: { backgroundColor: '#F3F4F6' },
  notesBtnSave: { backgroundColor: '#0066FF' },
  notesBtnCancelText: { color: '#374151', fontWeight: '600', fontSize: 14 },
  notesBtnSaveText: { color: '#fff', fontWeight: '600', fontSize: 14 },
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