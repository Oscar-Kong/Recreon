import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { Camera, useCameraDevices, useFrameProcessor } from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Svg, { Circle, Path } from 'react-native-svg';

interface FacialVerificationProps {
  onVerificationComplete: (verificationData: VerificationResult) => void;
  certificatePhoto?: string;
}

interface VerificationResult {
  verified: boolean;
  confidence: number;
  faceData: string;
  timestamp: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const FacialVerification: React.FC<FacialVerificationProps> = ({
  onVerificationComplete,
  certificatePhoto,
}) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'position' | 'scan' | 'complete'>('position');
  const [faceDetected, setFaceDetected] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  
  const devices = useCameraDevices();
  const device = devices.front;
  const camera = useRef<Camera>(null);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    requestCameraPermission();
    startPulseAnimation();
    startScanLineAnimation();
  }, []);

  const requestCameraPermission = async () => {
    const status = await Camera.requestCameraPermission();
    setHasPermission(status === 'authorized');
    if (status !== 'authorized') {
      Alert.alert(
        'Camera Permission Required',
        'Please enable camera access to verify your identity.',
        [{ text: 'OK' }]
      );
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startScanLineAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startVerification = async () => {
    if (!camera.current) return;

    setVerificationStep('scan');
    setIsProcessing(true);

    // Simulate face scanning progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      setVerificationProgress(progress);
      
      Animated.timing(progressAnim, {
        toValue: progress / 100,
        duration: 200,
        useNativeDriver: false,
      }).start();

      if (progress >= 100) {
        clearInterval(progressInterval);
        completeVerification();
      }
    }, 300);
  };

  const completeVerification = async () => {
    try {
      const photo = await camera.current?.takePhoto({
        flash: 'off',
        qualityPrioritization: 'quality',
      });

      if (photo) {
        // Simulate verification process
        setTimeout(() => {
          setVerificationStep('complete');
          setIsProcessing(false);
          
          const result: VerificationResult = {
            verified: true,
            confidence: 98.5,
            faceData: photo.path,
            timestamp: new Date().toISOString(),
          };
          
          onVerificationComplete(result);
        }, 1500);
      }
    } catch (error) {
      Alert.alert('Verification Failed', 'Please try again');
      setIsProcessing(false);
      setVerificationStep('position');
    }
  };

  // Face detection frame processor
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    // In production, use ML Kit or similar for actual face detection
    // This is a placeholder for the face detection logic
  }, []);

  if (!hasPermission || !device) {
    return (
      <View style={styles.container}>
        <View style={styles.noPermissionContainer}>
          <Icon name="photo-camera" size={64} color="#BDBDBD" />
          <Text style={styles.noPermissionText}>Camera access required</Text>
          <TouchableOpacity style={styles.retryButton} onPress={requestCameraPermission}>
            <Text style={styles.retryButtonText}>Enable Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        frameProcessor={frameProcessor}
        onInitialized={() => setIsCameraReady(true)}
      />

      {/* Dark overlay with face cutout */}
      <View style={styles.overlay}>
        <Svg height={screenHeight} width={screenWidth} style={StyleSheet.absoluteFill}>
          <Path
            d={`M0,0 L${screenWidth},0 L${screenWidth},${screenHeight} L0,${screenHeight} Z
                M${screenWidth / 2},${screenHeight * 0.3} 
                m-120,0 
                a120,150 0 1,0 240,0 
                a120,150 0 1,0 -240,0`}
            fill="rgba(0,0,0,0.7)"
            fillRule="evenodd"
          />
        </Svg>
      </View>

      {/* Face guide overlay */}
      <View style={styles.faceGuideContainer}>
        <Animated.View
          style={[
            styles.faceGuide,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Svg height={300} width={240}>
            <Circle
              cx="120"
              cy="150"
              r="115"
              stroke={faceDetected ? '#4CAF50' : '#FFFFFF'}
              strokeWidth="3"
              fill="transparent"
              strokeDasharray="10 5"
            />
          </Svg>
        </Animated.View>

        {verificationStep === 'scan' && (
          <Animated.View
            style={[
              styles.scanLine,
              {
                transform: [
                  {
                    translateY: scanLineAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-150, 150],
                    }),
                  },
                ],
              },
            ]}
          />
        )}
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        {verificationStep === 'position' && (
          <>
            <Text style={styles.instructionTitle}>Position Your Face</Text>
            <Text style={styles.instructionText}>
              Align your face within the circle and ensure good lighting
            </Text>
          </>
        )}
        
        {verificationStep === 'scan' && (
          <>
            <Text style={styles.instructionTitle}>Scanning Face...</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{verificationProgress}%</Text>
            </View>
          </>
        )}

        {verificationStep === 'complete' && (
          <View style={styles.successContainer}>
            <Icon name="check-circle" size={64} color="#4CAF50" />
            <Text style={styles.successTitle}>Verification Complete!</Text>
            <Text style={styles.successText}>Your identity has been verified</Text>
          </View>
        )}
      </View>

      {/* Action button */}
      {verificationStep === 'position' && isCameraReady && (
        <TouchableOpacity
          style={[styles.verifyButton, !faceDetected && styles.verifyButtonDisabled]}
          onPress={startVerification}
          disabled={!faceDetected || isProcessing}
        >
          <Icon name="verified-user" size={24} color="#FFFFFF" />
          <Text style={styles.verifyButtonText}>Start Verification</Text>
        </TouchableOpacity>
      )}

      {/* Tips */}
      <View style={styles.tipsContainer}>
        <View style={styles.tip}>
          <Icon name="light-mode" size={20} color="#FFC107" />
          <Text style={styles.tipText}>Good lighting</Text>
        </View>
        <View style={styles.tip}>
          <Icon name="remove-red-eye" size={20} color="#2196F3" />
          <Text style={styles.tipText}>Look at camera</Text>
        </View>
        <View style={styles.tip}>
          <Icon name="face" size={20} color="#4CAF50" />
          <Text style={styles.tipText}>Remove glasses</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  noPermissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  noPermissionText: {
    fontSize: 18,
    color: '#757575',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  faceGuideContainer: {
    position: 'absolute',
    top: screenHeight * 0.3 - 150,
    left: screenWidth / 2 - 120,
    width: 240,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceGuide: {
    position: 'absolute',
  },
  scanLine: {
    position: 'absolute',
    width: 200,
    height: 2,
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  instructionsContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  progressBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  successContainer: {
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  successText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 8,
  },
  verifyButton: {
    position: 'absolute',
    bottom: 100,
    left: 40,
    right: 40,
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  verifyButtonDisabled: {
    backgroundColor: '#757575',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  tipsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
  tip: {
    alignItems: 'center',
  },
  tipText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
  },
});