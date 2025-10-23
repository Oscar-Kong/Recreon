// src/screens/auth/RegisterScreen.js - COMPLETE FIXED VERSION
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    city: '',
    state: '',
    country: ''
  });

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const validateStep1 = () => {
    if (!formData.username.trim()) {
      Alert.alert('Error', 'Username is required');
      return false;
    }
    if (formData.username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email');
      return false;
    }
    if (!formData.password) {
      Alert.alert('Error', 'Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.fullName.trim()) {
      Alert.alert('Error', 'Full name is required');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      await register(formData);
    } catch (error) {
      Alert.alert('Registration Failed', error.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#666"
          value={formData.username}
          onChangeText={(text) => updateFormData('username', text)}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={formData.email}
          onChangeText={(text) => updateFormData('email', text)}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
      </View>

      {/* ✅ FIXED PASSWORD FIELD - Prevents iOS autocomplete overlay */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          value={formData.password}
          onChangeText={(text) => updateFormData('password', text)}
          secureTextEntry={!showPassword}
          autoComplete="password-new"  // ✅ CRITICAL: Tells system this is NEW password
          textContentType="newPassword"  // ✅ iOS-specific: Prevents autofill
          autoCorrect={false}
          autoCapitalize="none"
          passwordRules="minlength: 6;"  // ✅ iOS password rules
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      </View>
    </>
  );

  const renderStep2 = () => (
    <>
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#666"
          value={formData.fullName}
          onChangeText={(text) => updateFormData('fullName', text)}
          autoComplete="name"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="City (optional)"
          placeholderTextColor="#666"
          value={formData.city}
          onChangeText={(text) => updateFormData('city', text)}
          autoComplete="off"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="map-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="State/Province (optional)"
          placeholderTextColor="#666"
          value={formData.state}
          onChangeText={(text) => updateFormData('state', text)}
          autoComplete="off"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="globe-outline" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Country (optional)"
          placeholderTextColor="#666"
          value={formData.country}
          onChangeText={(text) => updateFormData('country', text)}
          autoComplete="country"
        />
      </View>
    </>
  );

  const renderStep3 = () => (
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryTitle}>Review Your Information</Text>
      
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Username</Text>
        <Text style={styles.summaryValue}>{formData.username}</Text>
      </View>

      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Email</Text>
        <Text style={styles.summaryValue}>{formData.email}</Text>
      </View>

      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Full Name</Text>
        <Text style={styles.summaryValue}>{formData.fullName}</Text>
      </View>

      {formData.city && (
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Location</Text>
          <Text style={styles.summaryValue}>
            {[formData.city, formData.state, formData.country].filter(Boolean).join(', ')}
          </Text>
        </View>
      )}

      <Text style={styles.summaryNote}>
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#000000', '#1A1A1A']} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              {currentStep > 1 ? (
                <TouchableOpacity onPress={handleBack}>
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              <View style={styles.stepIndicator}>
                <View style={[styles.stepDot, currentStep >= 1 && styles.stepDotActive]} />
                <View style={[styles.stepDot, currentStep >= 2 && styles.stepDotActive]} />
                <View style={[styles.stepDot, currentStep >= 3 && styles.stepDotActive]} />
              </View>
              <View style={{ width: 24 }} />
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.title}>
                {currentStep === 1 && 'Create Account'}
                {currentStep === 2 && 'Tell us about yourself'}
                {currentStep === 3 && 'Almost done!'}
              </Text>
              <Text style={styles.subtitle}>
                {currentStep === 1 && 'Choose your credentials'}
                {currentStep === 2 && 'Help us personalize your experience'}
                {currentStep === 3 && 'Review and confirm'}
              </Text>

              <View style={styles.form}>
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={styles.button}
                onPress={currentStep === 3 ? handleRegister : handleNext}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <Text style={styles.buttonText}>
                    {currentStep === 3 ? 'Create Account' : 'Continue'}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              {currentStep === 1 && (
                <View style={styles.footer}>
                  <Text style={styles.footerText}>Already have an account? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.footerLink}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
  },
  stepDotActive: {
    backgroundColor: '#7B9F8C',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 40,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  button: {
    backgroundColor: '#7B9F8C',
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#999',
    fontSize: 14,
  },
  footerLink: {
    color: '#7B9F8C',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryContainer: {
    gap: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  summaryItem: {
    gap: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  summaryNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 16,
    lineHeight: 18,
  },
});

export default RegisterScreen;