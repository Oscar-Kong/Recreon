import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';

interface VerificationStatusProps {
  userId: string;
  onVerificationComplete?: () => void;
  onRetryVerification?: (type: string) => void;
}

interface VerificationItem {
  id: string;
  type: string;
  name: string;
  status: 'pending' | 'processing' | 'verified' | 'rejected' | 'expired';
  submittedAt: string;
  verifiedAt?: string;
  expiryDate?: string;
  rejectionReason?: string;
  progress?: number;
}

export const VerificationStatus: React.FC<VerificationStatusProps> = ({
  userId,
  onVerificationComplete,
  onRetryVerification,
}) => {
  const [verifications, setVerifications] = useState<VerificationItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'incomplete' | 'pending' | 'verified'>('incomplete');
  const progressAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadVerificationStatus();
    // Simulate real-time updates
    const interval = setInterval(updateVerificationProgress, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadVerificationStatus = async () => {
    // Mock data - replace with actual API call
    const mockData: VerificationItem[] = [
      {
        id: '1',
        type: 'identity',
        name: 'Identity Verification',
        status: 'verified',
        submittedAt: '2024-01-15T10:00:00Z',
        verifiedAt: '2024-01-15T10:30:00Z',
      },
      {
        id: '2',
        type: 'lifeguard',
        name: 'Lifeguard Certification',
        status: 'processing',
        submittedAt: '2024-01-15T11:00:00Z',
        progress: 75,
      },
      {
        id: '3',
        type: 'cpr',
        name: 'CPR/First Aid',
        status: 'verified',
        submittedAt: '2024-01-14T09:00:00Z',
        verifiedAt: '2024-01-14T12:00:00Z',
        expiryDate: '2025-01-14',
      },
      {
        id: '4',
        type: 'fina',
        name: 'FINA Coaching License',
        status: 'rejected',
        submittedAt: '2024-01-13T14:00:00Z',
        rejectionReason: 'Document not clearly visible. Please upload a higher quality image.',
      },
      {
        id: '5',
        type: 'background',
        name: 'Background Check',
        status: 'pending',
        submittedAt: '2024-01-15T12:00:00Z',
      },
    ];

    setVerifications(mockData);
    updateOverallStatus(mockData);
  };

  const updateVerificationProgress = () => {
    setVerifications(prev => 
      prev.map(item => {
        if (item.status === 'processing' && item.progress) {
          const newProgress = Math.min(item.progress + 10, 100);
          if (newProgress === 100) {
            return { ...item, status: 'verified', verifiedAt: new Date().toISOString() };
          }
          return { ...item, progress: newProgress };
        }
        return item;
      })
    );
  };

  const updateOverallStatus = (items: VerificationItem[]) => {
    const allVerified = items.every(item => item.status === 'verified');
    const anyPending = items.some(item => ['pending', 'processing'].includes(item.status));
    
    if (allVerified) {
      setOverallStatus('verified');
      onVerificationComplete?.();
    } else if (anyPending) {
      setOverallStatus('pending');
    } else {
      setOverallStatus('incomplete');
    }

    // Animate progress
    const verifiedCount = items.filter(item => item.status === 'verified').length;
    const progress = (verifiedCount / items.length) * 100;
    
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadVerificationStatus();
    setIsRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return { name: 'check-circle', color: '#4CAF50' };
      case 'processing':
        return { name: 'hourglass-empty', color: '#FF9800' };
      case 'rejected':
        return { name: 'cancel', color: '#F44336' };
      case 'expired':
        return { name: 'error', color: '#FF5722' };
      default:
        return { name: 'radio-button-unchecked', color: '#BDBDBD' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return '#E8F5E9';
      case 'processing': return '#FFF3E0';
      case 'rejected': return '#FFEBEE';
      case 'expired': return '#FBE9E7';
      default: return '#F5F5F5';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const calculateDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      {/* Overall Status Card */}
      <View style={[styles.statusCard, { backgroundColor: getStatusColor(overallStatus) }]}>
        <View style={styles.statusHeader}>
          {overallStatus === 'verified' ? (
            <LottieView
              source={require('../assets/animations/success.json')}
              autoPlay
              loop={false}
              style={styles.lottieIcon}
            />
          ) : (
            <Icon 
              name={overallStatus === 'pending' ? 'hourglass-empty' : 'info'}
              size={48}
              color={overallStatus === 'pending' ? '#FF9800' : '#2196F3'}
            />
          )}
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusTitle}>
              {overallStatus === 'verified' 
                ? 'Verification Complete!' 
                : overallStatus === 'pending'
                ? 'Verification In Progress'
                : 'Verification Required'}
            </Text>
            <Text style={styles.statusSubtitle}>
              {overallStatus === 'verified'
                ? 'You can now start accepting bookings'
                : overallStatus === 'pending'
                ? 'We\'re reviewing your documents'
                : 'Complete all requirements to get verified'}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {verifications.filter(v => v.status === 'verified').length} of {verifications.length} verified
          </Text>
        </View>
      </View>

      {/* Verification Items */}
      <View style={styles.itemsContainer}>
        <Text style={styles.sectionTitle}>Verification Checklist</Text>
        
        {verifications.map((item) => {
          const statusIcon = getStatusIcon(item.status);
          const daysUntilExpiry = item.expiryDate ? calculateDaysUntilExpiry(item.expiryDate) : null;
          
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.verificationItem, { backgroundColor: getStatusColor(item.status) }]}
              onPress={() => item.status === 'rejected' && onRetryVerification?.(item.type)}
              disabled={item.status !== 'rejected'}
            >
              <View style={styles.itemHeader}>
                <Icon name={statusIcon.name} size={24} color={statusIcon.color} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDate}>
                    Submitted: {formatDate(item.submittedAt)}
                  </Text>
                </View>
                {item.status === 'processing' && item.progress && (
                  <View style={styles.progressCircle}>
                    <Text style={styles.progressCircleText}>{item.progress}%</Text>
                  </View>
                )}
              </View>

              {item.status === 'verified' && item.verifiedAt && (
                <View style={styles.itemDetail}>
                  <Icon name="verified" size={16} color="#4CAF50" />
                  <Text style={styles.verifiedText}>
                    Verified on {formatDate(item.verifiedAt)}
                  </Text>
                </View>
              )}

              {item.status === 'rejected' && item.rejectionReason && (
                <View style={styles.rejectionContainer}>
                  <Text style={styles.rejectionText}>{item.rejectionReason}</Text>
                  <TouchableOpacity style={styles.retryButton}>
                    <Icon name="refresh" size={16} color="#FFFFFF" />
                    <Text style={styles.retryButtonText}>Retry Upload</Text>
                  </TouchableOpacity>
                </View>
              )}

              {item.expiryDate && daysUntilExpiry !== null && (
                <View style={styles.expiryContainer}>
                  <Icon 
                    name="event" 
                    size={16} 
                    color={daysUntilExpiry < 30 ? '#FF5722' : '#757575'} 
                  />
                  <Text style={[
                    styles.expiryText,
                    daysUntilExpiry < 30 && styles.expiryTextWarning
                  ]}>
                    {daysUntilExpiry > 0 
                      ? `Expires in ${daysUntilExpiry} days`
                      : 'Expired'}
                  </Text>
                </View>
              )}

              {item.status === 'processing' && (
                <View style={styles.processingInfo}>
                  <Text style={styles.processingText}>
                    Estimated completion: 1-2 business days
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Help Section */}
      <View style={styles.helpSection}>
        <Icon name="help-outline" size={24} color="#2196F3" />
        <View style={styles.helpContent}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            If you're having trouble with verification, our support team is here to help.
          </Text>
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tips */}
      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>Verification Tips</Text>
        <View style={styles.tip}>
          <Icon name="camera-alt" size={20} color="#757575" />
          <Text style={styles.tipText}>Take clear, well-lit photos of documents</Text>
        </View>
        <View style={styles.tip}>
          <Icon name="description" size={20} color="#757575" />
          <Text style={styles.tipText}>Ensure all text is readable and not cut off</Text>
        </View>
        <View style={styles.tip}>
          <Icon name="update" size={20} color="#757575" />
          <Text style={styles.tipText}>Submit current, non-expired certifications</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  statusCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  lottieIcon: {
    width: 48,
    height: 48,
  },
  statusTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#757575',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#757575',
    marginTop: 8,
    textAlign: 'center',
  },
  itemsContainer: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  verificationItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 12,
    color: '#757575',
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF9