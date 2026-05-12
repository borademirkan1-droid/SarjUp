import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { NfcStatus } from '../../hooks/useSubscription';

type Props = {
  nfcStatus: NfcStatus;
  deviceHwId: string | null;
  deviceName: string | null;
  formatDate: (iso?: string) => string;
  onUploadPress: () => void;
};

export function SubscriptionStatusCard({
  nfcStatus,
  deviceHwId,
  deviceName,
  formatDate,
  onUploadPress,
}: Props) {
  const router = useRouter();

  if (nfcStatus.nfc_unlocked) {
    return (
      <View style={[styles.statusCard, styles.statusCardGreen]}>
        <View style={styles.statusIconRow}>
          <View style={[styles.statusIconBg, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="checkmark-circle" size={32} color="#10B981" />
          </View>
        </View>
        <Text style={[styles.statusTitle, { color: '#065F46' }]}>
          Aboneliginiz Aktif
        </Text>
        {nfcStatus.approved_at && (
          <Text style={styles.statusMeta}>
            Onay tarihi: {formatDate(nfcStatus.approved_at)}
          </Text>
        )}
        {nfcStatus.amount != null && (
          <Text style={styles.statusMeta}>
            Tutar: {nfcStatus.amount.toLocaleString('tr-TR')} TL
          </Text>
        )}

        {deviceHwId && (
          <TouchableOpacity
            style={[styles.actionButton, styles.nfcButton]}
            onPress={() => {
              const hwId = encodeURIComponent(deviceHwId);
              const name = encodeURIComponent(deviceName ?? deviceHwId);
              const receiptParam = nfcStatus.receipt_id
                ? `&receipt_id=${encodeURIComponent(nfcStatus.receipt_id)}`
                : '';
              router.push(`/nfc-activate?device_id=${hwId}&device_name=${name}${receiptParam}`);
            }}
          >
            <Ionicons name="wifi" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.actionButtonText}>NFC ile Aktive Et</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#6B7280', marginTop: 10 }]}
          onPress={onUploadPress}
        >
          <Text style={styles.actionButtonText}>Yeni Odeme Yukle</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (nfcStatus.reason === 'pending_review') {
    return (
      <View style={[styles.statusCard, styles.statusCardYellow]}>
        <View style={styles.statusIconRow}>
          <View style={[styles.statusIconBg, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="time" size={32} color="#D97706" />
          </View>
        </View>
        <Text style={[styles.statusTitle, { color: '#92400E' }]}>
          Dekontunuz Inceleniyor
        </Text>
        <Text style={styles.statusSub}>
          AI analiz ediliyor, lutfen bekleyin.
        </Text>
        <Text style={[styles.statusMeta, { marginTop: 12 }]}>
          Sayfayi asagi cekerek durumu yenileyebilirsiniz.
        </Text>
      </View>
    );
  }

  const isRejected = nfcStatus.reason === 'rejected';
  return (
    <View style={[styles.statusCard, styles.statusCardRed]}>
      <View style={styles.statusIconRow}>
        <View style={[styles.statusIconBg, { backgroundColor: '#FEE2E2' }]}>
          <Ionicons name="close-circle" size={32} color="#EF4444" />
        </View>
      </View>
      <Text style={[styles.statusTitle, { color: '#7F1D1D' }]}>
        {isRejected ? 'Dekont Reddedildi' : 'Abonelik Odemesi Gerekli'}
      </Text>
      <Text style={styles.statusSub}>
        {isRejected
          ? 'Dekontunuz onaylanmadi. Lutfen tekrar yukleyin.'
          : 'NFC ozelligini kullanmak icin abonelik odemesi yapmaniz gerekiyor.'}
      </Text>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: '#EF4444', marginTop: 20 }]}
        onPress={onUploadPress}
      >
        <Text style={styles.actionButtonText}>Dekont Yukle</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  statusCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
  },
  statusCardGreen: { backgroundColor: '#F0FDF4', borderColor: '#6EE7B7' },
  statusCardYellow: { backgroundColor: '#FFFBEB', borderColor: '#FCD34D' },
  statusCardRed: { backgroundColor: '#FFF5F5', borderColor: '#FCA5A5' },
  statusIconRow: { alignItems: 'center', marginBottom: 16 },
  statusIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  statusSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  statusMeta: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 4 },
  actionButton: { padding: 14, borderRadius: 12, alignItems: 'center' },
  nfcButton: {
    backgroundColor: '#0066FF',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
