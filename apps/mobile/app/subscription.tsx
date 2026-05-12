import { useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSubscription } from './hooks/useSubscription';
import { useReceiptPicker } from './hooks/useReceiptPicker';
import { SubscriptionStatusCard } from './subscription/components/SubscriptionStatusCard';
import { ReceiptForm } from './subscription/components/ReceiptForm';

export default function Subscription() {
  const router = useRouter();
  const {
    phase, setPhase,
    loadingStatus, setLoadingStatus,
    refreshing,
    nfcStatus,
    deviceHwId, deviceName,
    fetchStatus, onRefresh,
    submitReceipt, submitting,
    formatDate,
  } = useSubscription();

  const { imageUri, imageMime, pickFromCamera, pickFromGallery, clearImage } = useReceiptPicker();
  const [amount, setAmount] = useState('');

  function handleSubmit() {
    submitReceipt({
      imageUri,
      imageMime,
      amount,
      onSuccess: () => {
        setPhase('status');
        setAmount('');
        clearImage();
        setLoadingStatus(true);
        fetchStatus().finally(() => setLoadingStatus(false));
      },
    });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (phase === 'form' ? setPhase('status') : router.back())}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Abonelik Ödemesi</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          phase === 'status' ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0066FF" />
          ) : undefined
        }
      >
        {phase === 'status' ? (
          loadingStatus ? (
            <ActivityIndicator size="large" color="#0066FF" style={{ marginTop: 60 }} />
          ) : nfcStatus ? (
            <SubscriptionStatusCard
              nfcStatus={nfcStatus}
              deviceHwId={deviceHwId}
              deviceName={deviceName}
              formatDate={formatDate}
              onUploadPress={() => setPhase('form')}
            />
          ) : null
        ) : (
          <ReceiptForm
            amount={amount}
            onAmountChange={setAmount}
            imageUri={imageUri}
            onPickCamera={pickFromCamera}
            onPickGallery={pickFromGallery}
            onClearImage={clearImage}
            onSubmit={handleSubmit}
            submitting={submitting}
            onBack={() => setPhase('status')}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  scroll: { padding: 16, paddingBottom: 60 },
});
