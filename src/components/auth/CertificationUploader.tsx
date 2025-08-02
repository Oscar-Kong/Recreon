import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface CertificationUploaderProps {
  sportType: string;
  onUpload: (certificationData: CertificationData) => void;
  existingCertifications?: Certification[];
}

interface CertificationData {
  type: string;
  documentUri: string;
  issuingBody: string;
  expiryDate?: string;
}

interface Certification {
  id: string;
  type: string;
  status: 'pending' | 'verified' | 'rejected';
  documentUrl: string;
  verifiedAt?: string;
}

const CERTIFICATION_TYPES = {
  swimming: [
    { id: 'lifeguard', name: 'Lifeguard Certification', issuer: 'Red Cross' },
    { id: 'cpr', name: 'CPR/First Aid', issuer: 'Red Cross' },
    { id: 'fina', name: 'FINA Coaching License', issuer: 'FINA' },
    { id: 'swim_instructor', name: 'Swim Instructor', issuer: 'National Body' },
  ],
  shooting: [
    { id: 'firearm_license', name: 'Firearm Handling License', issuer: 'Police Department' },
    { id: 'range_safety', name: 'Range Safety Officer', issuer: 'NSA' },
    { id: 'nsa_coach', name: 'NSA Coaching Certificate', issuer: 'National Shooting Association' },
    { id: 'first_aid', name: 'First Aid Certificate', issuer: 'Red Cross' },
  ],
  basketball: [
    { id: 'fiba_license', name: 'FIBA Coaching License', issuer: 'FIBA' },
    { id: 'youth_coach', name: 'Youth Basketball Coach', issuer: 'National Federation' },
    { id: 'first_aid', name: 'First Aid Certificate', issuer: 'Red Cross' },
  ],
};

export const CertificationUploader: React.FC<CertificationUploaderProps> = ({
  sportType,
  onUpload,
  existingCertifications = [],
}) => {
  const [selectedCertType, setSelectedCertType] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<Map<string, string>>(new Map());
  const [isUploading, setIsUploading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<Map<string, string>>(new Map());

  const certTypes = CERTIFICATION_TYPES[sportType as keyof typeof CERTIFICATION_TYPES] || [];

  const handleImagePicker = (certId: string) => {
    Alert.alert(
      'Select Document Source',
      'Choose how you want to upload your certification',
      [
        { text: 'Camera', onPress: () => openCamera(certId) },
        { text: 'Gallery', onPress: () => openGallery(certId) },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const openCamera = (certId: string) => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      (response) => {
        if (response.assets && response.assets[0]) {
          processImage(certId, response.assets[0].uri!);
        }
      },
    );
  };

  const openGallery = (certId: string) => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      (response) => {
        if (response.assets && response.assets[0]) {
          processImage(certId, response.assets[0].uri!);
        }
      },
    );
  };

  const processImage = async (certId: string, uri: string) => {
    setIsUploading(true);
    const newUploaded = new Map(uploadedImages);
    newUploaded.set(certId, uri);
    setUploadedImages(newUploaded);

    // Simulate OCR processing
    setTimeout(() => {
      setIsUploading(false);
      const newStatus = new Map(verificationStatus);
      newStatus.set(certId, 'processing');
      setVerificationStatus(newStatus);

      // Simulate verification completion
      setTimeout(() => {
        newStatus.set(certId, 'verified');
        setVerificationStatus(newStatus);
      }, 3000);
    }, 1500);

    const certType = certTypes.find(cert => cert.id === certId);
    if (certType) {
      onUpload({
        type: certId,
        documentUri: uri,
        issuingBody: certType.issuer,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return '#4CAF50';
      case 'processing': return '#FF9800';
      case 'rejected': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return 'check-circle';
      case 'processing': return 'access-time';
      case 'rejected': return 'cancel';
      default: return 'add-circle';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="verified-user" size={24} color="#2196F3" />
        <Text style={styles.headerText}>Required Certifications for {sportType}</Text>
      </View>

      <Text style={styles.subText}>
        Upload clear photos of your certifications. We'll verify them within 24 hours.
      </Text>

      {certTypes.map((cert) => {
        const isUploaded = uploadedImages.has(cert.id);
        const status = verificationStatus.get(cert.id) || 'pending';
        const existingCert = existingCertifications.find(c => c.type === cert.id);

        return (
          <View key={cert.id} style={styles.certCard}>
            <View style={styles.certHeader}>
              <View style={styles.certInfo}>
                <Text style={styles.certName}>{cert.name}</Text>
                <Text style={styles.certIssuer}>Issued by: {cert.issuer}</Text>
              </View>
              <Icon
                name={getStatusIcon(existingCert?.status || status)}
                size={28}
                color={getStatusColor(existingCert?.status || status)}
              />
            </View>

            {isUploaded || existingCert ? (
              <View style={styles.uploadedContainer}>
                <Image
                  source={{ uri: uploadedImages.get(cert.id) || existingCert?.documentUrl }}
                  style={styles.uploadedImage}
                />
                <View style={styles.statusContainer}>
                  <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                    {status === 'processing' ? 'Verifying...' : status.toUpperCase()}
                  </Text>
                  {status === 'processing' && <ActivityIndicator size="small" color="#FF9800" />}
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => handleImagePicker(cert.id)}
                disabled={isUploading}
              >
                <Icon name="cloud-upload" size={24} color="#FFFFFF" />
                <Text style={styles.uploadButtonText}>Upload Document</Text>
              </TouchableOpacity>
            )}

            {cert.id === 'firearm_license' && sportType === 'shooting' && (
              <View style={styles.warningBox}>
                <Icon name="warning" size={20} color="#FF6B6B" />
                <Text style={styles.warningText}>
                  Police verification required. Processing may take 3-5 business days.
                </Text>
              </View>
            )}
          </View>
        );
      })}

      <View style={styles.infoBox}>
        <Icon name="info" size={20} color="#2196F3" />
        <Text style={styles.infoText}>
          All certifications must be valid and clearly visible. Expired documents will be rejected.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#212121',
  },
  subText: {
    padding: 20,
    fontSize: 14,
    color: '#757575',
  },
  certCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  certHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  certInfo: {
    flex: 1,
  },
  certName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  certIssuer: {
    fontSize: 14,
    color: '#757575',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  uploadedContainer: {
    marginTop: 12,
  },
  uploadedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#E65100',
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 16,
    margin: 20,
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1565C0',
    marginLeft: 8,
  },
});