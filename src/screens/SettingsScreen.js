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
import * as Haptics from 'expo-haptics';

const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  
  // Settings state
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [matchNotifications, setMatchNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [locationServices, setLocationServices] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              await logout();
              // Navigation will be handled by AuthProvider
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion API call
            Alert.alert('Coming Soon', 'Account deletion will be available soon.');
          },
        },
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, onPress, showArrow = true }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={20} color="#7B9F8C" />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#666666" />
      )}
    </TouchableOpacity>
  );

  const ToggleItem = ({ icon, title, subtitle, value, onValueChange }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={20} color="#7B9F8C" />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={(newValue) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onValueChange(newValue);
        }}
        trackColor={{ false: '#333333', true: '#7B9F8C' }}
        thumbColor={value ? '#FFFFFF' : '#999999'}
      />
    </View>
  );

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Account Section */}
        <SectionHeader title="ACCOUNT" />
        <View style={styles.section}>
          <SettingItem
            icon="person-outline"
            title="Edit Profile"
            subtitle="Update your profile information"
            onPress={() => Alert.alert('Coming Soon', 'Edit profile will be available soon.')}
          />
          <SettingItem
            icon="lock-closed-outline"
            title="Change Password"
            subtitle="Update your password"
            onPress={() => Alert.alert('Coming Soon', 'Change password will be available soon.')}
          />
          <SettingItem
            icon="shield-checkmark-outline"
            title="Privacy"
            subtitle="Manage your privacy settings"
            onPress={() => Alert.alert('Coming Soon', 'Privacy settings will be available soon.')}
          />
        </View>

        {/* Notifications Section */}
        <SectionHeader title="NOTIFICATIONS" />
        <View style={styles.section}>
          <ToggleItem
            icon="notifications-outline"
            title="Push Notifications"
            subtitle="Receive push notifications"
            value={pushNotifications}
            onValueChange={setPushNotifications}
          />
          <ToggleItem
            icon="mail-outline"
            title="Email Notifications"
            subtitle="Receive email updates"
            value={emailNotifications}
            onValueChange={setEmailNotifications}
          />
          <ToggleItem
            icon="trophy-outline"
            title="Match Updates"
            subtitle="Get notified about matches"
            value={matchNotifications}
            onValueChange={setMatchNotifications}
          />
          <ToggleItem
            icon="chatbubble-outline"
            title="Messages"
            subtitle="Get notified about new messages"
            value={messageNotifications}
            onValueChange={setMessageNotifications}
          />
        </View>

        {/* Preferences Section */}
        <SectionHeader title="PREFERENCES" />
        <View style={styles.section}>
          <ToggleItem
            icon="moon-outline"
            title="Dark Mode"
            subtitle="Use dark theme"
            value={darkMode}
            onValueChange={setDarkMode}
          />
          <ToggleItem
            icon="location-outline"
            title="Location Services"
            subtitle="Allow location access for nearby matches"
            value={locationServices}
            onValueChange={setLocationServices}
          />
          <SettingItem
            icon="language-outline"
            title="Language"
            subtitle="English"
            onPress={() => Alert.alert('Coming Soon', 'Language selection will be available soon.')}
          />
        </View>

        {/* Support Section */}
        <SectionHeader title="SUPPORT" />
        <View style={styles.section}>
          <SettingItem
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="Get help with the app"
            onPress={() => Alert.alert('Coming Soon', 'Help center will be available soon.')}
          />
          <SettingItem
            icon="document-text-outline"
            title="Terms of Service"
            onPress={() => Alert.alert('Coming Soon', 'Terms of service will be available soon.')}
          />
          <SettingItem
            icon="shield-outline"
            title="Privacy Policy"
            onPress={() => Alert.alert('Coming Soon', 'Privacy policy will be available soon.')}
          />
          <SettingItem
            icon="information-circle-outline"
            title="About"
            subtitle="Version 1.0.0"
            onPress={() => Alert.alert('About', 'Recreon v1.0.0\n\nA platform for sports enthusiasts to connect and play together.')}
          />
        </View>

        {/* Danger Zone */}
        <SectionHeader title="ACCOUNT ACTIONS" />
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={20} color="#DC2626" />
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <Text style={styles.versionText}>Recreon v1.0.0</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#0A0A0A',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#666666',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#0A0A0A',
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  versionText: {
    textAlign: 'center',
    color: '#333333',
    fontSize: 12,
    marginTop: 32,
    marginBottom: 8,
  },
});

export default SettingsScreen;