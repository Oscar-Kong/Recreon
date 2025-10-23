// src/screens/SettingsScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';

const SettingsScreen = ({ navigation }) => {
  const { logout } = useAuth();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Coming Soon', 'Account deletion will be available soon.');
          },
        },
      ]
    );
  };

  const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingRow = ({ icon, title, value, onPress, showArrow = true }) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={22} color="#7B9F8C" />
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {showArrow && <Ionicons name="chevron-forward" size={20} color="#666" />}
      </View>
    </TouchableOpacity>
  );

  const SettingToggle = ({ icon, title, value, onValueChange }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={22} color="#7B9F8C" />
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#333', true: '#7B9F8C' }}
        thumbColor={value ? '#FFFFFF' : '#666'}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <SettingSection title="ACCOUNT">
          <SettingRow
            icon="person-outline"
            title="Edit Profile"
            onPress={() => Alert.alert('Coming Soon', 'Edit profile coming soon')}
          />
          <SettingRow
            icon="lock-closed-outline"
            title="Change Password"
            onPress={() => Alert.alert('Coming Soon', 'Change password coming soon')}
          />
          <SettingRow
            icon="shield-outline"
            title="Privacy"
            onPress={() => Alert.alert('Coming Soon', 'Privacy settings coming soon')}
          />
        </SettingSection>

        <SettingSection title="NOTIFICATIONS">
          <SettingToggle
            icon="notifications-outline"
            title="Push Notifications"
            value={pushEnabled}
            onValueChange={setPushEnabled}
          />
          <SettingToggle
            icon="mail-outline"
            title="Email Notifications"
            value={emailEnabled}
            onValueChange={setEmailEnabled}
          />
        </SettingSection>

        <SettingSection title="PRIVACY">
          <SettingToggle
            icon="location-outline"
            title="Location Services"
            value={locationEnabled}
            onValueChange={setLocationEnabled}
          />
          <SettingRow
            icon="eye-outline"
            title="Who can see my profile"
            value="Everyone"
            onPress={() => Alert.alert('Coming Soon', 'Privacy controls coming soon')}
          />
        </SettingSection>

        <SettingSection title="ABOUT">
          <SettingRow
            icon="information-circle-outline"
            title="About"
            value="v1.0.0"
            showArrow={false}
          />
          <SettingRow
            icon="document-text-outline"
            title="Terms of Service"
            onPress={() => Alert.alert('Coming Soon', 'Terms of service coming soon')}
          />
          <SettingRow
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            onPress={() => Alert.alert('Coming Soon', 'Privacy policy coming soon')}
          />
        </SettingSection>

        <SettingSection title="DANGER ZONE">
          <TouchableOpacity style={styles.dangerButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#DC2626" />
            <Text style={styles.dangerText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={22} color="#DC2626" />
            <Text style={styles.dangerText}>Delete Account</Text>
          </TouchableOpacity>
        </SettingSection>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  dangerText: {
    fontSize: 16,
    color: '#DC2626',
    marginLeft: 12,
    fontWeight: '500',
  },
});

export default SettingsScreen;