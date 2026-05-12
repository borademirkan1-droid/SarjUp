import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  amount: string;
  onAmountChange: (v: string) => void;
  imageUri: string | null;
  onPickCamera: () => void;
  onPickGallery: () => void;
  onClearImage: () => void;
  onSubmit: () => void;
  submitting: boolean;
  onBack: () => void;
};

export function ReceiptForm({
  amount,
  onAmountChange,
  imageUri,
  onPickCamera,
  onPickGallery,
  onClearImage,
  onSubmit,
  submitting,
  onBack,
}: Props) {
  return (
    <View>
      <TouchableOpacity style={styles.backLink} onPress={onBack}>
        <Ionicons name="arrow-back" size={18} color="#0066FF" />
        <Text style={styles.backLinkText}>Duruma Geri Don</Text>
      </TouchableOpacity>

      <Text style={styles.formTitle}>Odeme Dekontu Yukle</Text>
      <Text style={styles.formSub}>
        Banka havalesi dekontunu yukleyin, AI otomatik analiz edecek.
      </Text>

      <Text style={styles.label}>Odeme Tutari (TL)</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={onAmountChange}
        keyboardType="numeric"
        placeholder="Ornek: 500"
        placeholderTextColor="#9CA3AF"
      />

      <Text style={[styles.label, { marginTop: 20 }]}>Dekont Fotografi</Text>

      <View style={styles.pickerRow}>
        <TouchableOpacity style={styles.pickerButton} onPress={onPickCamera}>
          <Ionicons name="camera" size={22} color="#0066FF" />
          <Text style={styles.pickerButtonText}>Fotograf Cek</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pickerButton} onPress={onPickGallery}>
          <Ionicons name="images" size={22} color="#0066FF" />
          <Text style={styles.pickerButtonText}>Galeriden Sec</Text>
        </TouchableOpacity>
      </View>

      {imageUri && (
        <View style={styles.previewBox}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <TouchableOpacity style={styles.removeImage} onPress={onClearImage}>
            <Ionicons name="close-circle" size={22} color="#EF4444" />
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.submitButton,
          (submitting || !imageUri) && styles.submitButtonDisabled,
        ]}
        onPress={onSubmit}
        disabled={submitting || !imageUri}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Gonder</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  backLinkText: { color: '#0066FF', fontSize: 14, fontWeight: '500' },
  formTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 4 },
  formSub: { fontSize: 14, color: '#6B7280', marginBottom: 24, lineHeight: 20 },
  label: { fontSize: 14, color: '#374151', fontWeight: '500', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  pickerRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  pickerButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  pickerButtonText: { color: '#0066FF', fontSize: 13, fontWeight: '600' },
  previewBox: { position: 'relative', marginBottom: 16, alignSelf: 'flex-start' },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  removeImage: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 11,
  },
  submitButton: {
    backgroundColor: '#0066FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: { backgroundColor: '#93C5FD' },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
