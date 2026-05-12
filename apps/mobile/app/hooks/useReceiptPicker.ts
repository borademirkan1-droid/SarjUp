import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

type ReceiptPickerResult = {
  imageUri: string | null;
  imageMime: string;
  pickFromCamera: () => Promise<void>;
  pickFromGallery: () => Promise<void>;
  clearImage: () => void;
};

export function useReceiptPicker(): ReceiptPickerResult {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');

  async function pickFromCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Kamera izni verilmedi.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setImageMime(asset.mimeType ?? 'image/jpeg');
    }
  }

  async function pickFromGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Galeri izni verilmedi.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setImageMime(asset.mimeType ?? 'image/jpeg');
    }
  }

  function clearImage() {
    setImageUri(null);
  }

  return { imageUri, imageMime, pickFromCamera, pickFromGallery, clearImage };
}
