// ============================================================================
// UploadSheetModal.tsx
//
// Integrated document upload modal:
// - Camera capture using expo-image-picker
// - Photo gallery selection using expo-image-picker
// - PDF document selection using expo-document-picker
// - Handles camera/library permission denial with friendly alerts
// - Dispatches document to extractReport service
// - Handles blurry images, empty results, and network failures gracefully
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  BackHandler,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Camera, Image as ImageIcon, FileText, X, Sparkles, Loader2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import { Colors, Radii, Shadows, Spacing, Typography } from '@/theme';
import { CircleArrowButton } from './CircleArrowButton';
import {
  extractReport,
  BlurryImageError,
  EmptyResultError,
  NetworkError,
  ExtractedReportResult,
} from '@/services/api';

export interface UploadSheetModalProps {
  visible: boolean;
  onClose: () => void;
  onExtractedSuccess: (result: ExtractedReportResult) => void;
}

export function UploadSheetModal({
  visible,
  onClose,
  onExtractedSuccess,
}: UploadSheetModalProps) {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    if (!visible) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isProcessing) return true; // prevent closing while uploading
      onClose();
      return true;
    });

    return () => backHandler.remove();
  }, [visible, isProcessing, onClose]);

  const processFile = async (file: { uri: string; name: string; type?: string; size?: number }) => {
    setIsProcessing(true);
    setStatusMessage('Analyzing document with OCR...');

    try {
      const extracted = await extractReport(file);
      setIsProcessing(false);
      setStatusMessage('');
      onClose();
      onExtractedSuccess(extracted);
    } catch (err: any) {
      setIsProcessing(false);
      setStatusMessage('');

      if (err instanceof BlurryImageError) {
        Alert.alert(
          'Image Blurry or Low Contrast',
          'The captured document image appears too blurry or lacks sufficient contrast to read lab values reliably.\n\nPlease hold the camera steady in bright, even lighting, or upload an official PDF report.',
          [{ text: 'Try Again', style: 'default' }]
        );
      } else if (err instanceof EmptyResultError) {
        Alert.alert(
          'No Biomarkers Detected',
          'We were unable to recognize blood test biomarkers in this document.\n\nPlease verify that the image clearly shows biomarker names, numeric results, and units.',
          [{ text: 'OK', style: 'default' }]
        );
      } else if (err instanceof NetworkError) {
        Alert.alert(
          'Network Connection Error',
          'Could not reach the clinical extraction server. Please verify your connection or try again shortly.',
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Extraction Error',
          `An unexpected issue occurred: ${err?.message || 'Please try again.'}`,
          [{ text: 'OK', style: 'default' }]
        );
      }
    }
  };

  const handleLaunchCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Camera Permission Denied',
          'ClinixBridge requires camera access to scan physical blood test reports. Please enable Camera permissions in your device Settings.',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        await processFile({
          uri: asset.uri,
          name: asset.fileName || `camera_scan_${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
          size: asset.fileSize,
        });
      }
    } catch (err: any) {
      Alert.alert('Camera Error', `Unable to open camera: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleLaunchGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Photos Permission Denied',
          'ClinixBridge needs photo library access to upload lab screenshots and saved reports. Please enable Photos access in Settings.',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        await processFile({
          uri: asset.uri,
          name: asset.fileName || `gallery_image_${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
          size: asset.fileSize,
        });
      }
    } catch (err: any) {
      Alert.alert('Gallery Error', `Unable to access photo library: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleSelectPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        await processFile({
          uri: asset.uri,
          name: asset.name || `lab_report_${Date.now()}.pdf`,
          type: asset.mimeType || 'application/pdf',
          size: asset.size,
        });
      }
    } catch (err: any) {
      Alert.alert('Document Picker Error', `Failed to select document: ${err?.message || 'Unknown error'}`);
    }
  };

  const uploadOptions = [
    {
      id: 'camera' as const,
      title: 'Scan with Camera',
      subtitle: 'Capture clear photo of physical paper lab printout',
      icon: Camera,
      action: handleLaunchCamera,
    },
    {
      id: 'gallery' as const,
      title: 'Choose from Gallery',
      subtitle: 'Select saved screenshot or lab photo from photos',
      icon: ImageIcon,
      action: handleLaunchGallery,
    },
    {
      id: 'pdf' as const,
      title: 'Select PDF Document',
      subtitle: 'Upload official digital lab report from Quest, Labcorp, etc.',
      icon: FileText,
      action: handleSelectPDF,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdropPressable}
          onPress={isProcessing ? undefined : onClose}
        />

        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetSubtitle}>UPLOAD BLOOD REPORT</Text>
              <Text style={styles.sheetTitle}>Select Document Source</Text>
            </View>

            {!isProcessing && (
              <Pressable
                onPress={onClose}
                android_ripple={{ color: Colors.ripple, borderless: true }}
                style={styles.closeButton}
              >
                <X size={20} color={Colors.text} strokeWidth={2.4} />
              </Pressable>
            )}
          </View>

          {/* Guidance Callout */}
          <View style={styles.guidanceBox}>
            <Sparkles size={16} color={Colors.primary} />
            <Text style={styles.guidanceText}>
              Deterministic OCR extracts biomarker units and compares against standard adult reference ranges.
            </Text>
          </View>

          {/* If Processing: Sleek Loading Card */}
          {isProcessing ? (
            <View style={styles.processingCard}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.processingTitle}>Extracting Lab Data</Text>
              <Text style={styles.processingSubtitle}>{statusMessage}</Text>
            </View>
          ) : (
            /* Options List */
            <View style={styles.optionsList}>
              {uploadOptions.map((opt) => {
                const Icon = opt.icon;

                return (
                  <Pressable
                    key={opt.id}
                    onPress={opt.action}
                    android_ripple={{ color: Colors.ripple, borderless: false }}
                    style={styles.optionCard}
                  >
                    <View style={styles.optionIconBox}>
                      <Icon size={22} color={Colors.deepMaroon} strokeWidth={2.2} />
                    </View>

                    <View style={styles.optionContent}>
                      <Text style={styles.optionTitle}>{opt.title}</Text>
                      <Text style={styles.optionSubtitle}>{opt.subtitle}</Text>
                    </View>

                    <CircleArrowButton
                      direction="right"
                      onPress={opt.action}
                      size={36}
                    />
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Cancel button */}
          {!isProcessing && (
            <Pressable
              onPress={onClose}
              android_ripple={{ color: Colors.ripple, borderless: false }}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  backdropPressable: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radii.cards,
    borderTopRightRadius: Radii.cards,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    ...Shadows.floating,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sheetSubtitle: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    lineHeight: Typography.caption.lineHeight,
    letterSpacing: 1,
    fontWeight: '700',
  },
  sheetTitle: {
    color: Colors.text,
    fontFamily: Typography.title.fontFamily,
    fontSize: Typography.title.fontSize,
    lineHeight: Typography.title.lineHeight,
    fontWeight: '700',
  },
  closeButton: {
    padding: Spacing.xs,
    borderRadius: Radii.pills,
    backgroundColor: Colors.borderLight,
  },
  guidanceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.redTint,
    borderRadius: Radii.md,
    padding: Spacing.sm + 2,
    marginBottom: Spacing.lg,
  },
  guidanceText: {
    flex: 1,
    color: Colors.deepMaroon,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    lineHeight: Typography.caption.lineHeight,
    marginLeft: Spacing.xs,
  },
  optionsList: {
    gap: Spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
    padding: Spacing.md,
  },
  optionIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.soft,
  },
  optionContent: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  optionTitle: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.bodyBold.fontSize,
    lineHeight: Typography.bodyBold.lineHeight,
    fontWeight: '700',
  },
  optionSubtitle: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    lineHeight: Typography.caption.lineHeight,
    marginTop: 2,
  },
  processingCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    backgroundColor: Colors.background,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  processingTitle: {
    fontFamily: Typography.title.fontFamily,
    fontSize: Typography.title.fontSize,
    color: Colors.text,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  processingSubtitle: {
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    color: Colors.secondaryText,
    marginTop: Spacing.xs,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radii.pills,
    backgroundColor: Colors.borderLight,
  },
  cancelText: {
    color: Colors.secondaryText,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
  },
});
