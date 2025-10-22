// src/screens/ProfileScreen.js - UPDATED WITH DATABASE INTEGRATION
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../hooks/useAuth';

const ProfileScreen = ({ navigation }) => {
  const { user: authUser, updateProfile } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [authUser])
  );

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Use the authenticated user data
      if (authUser) {
        setUser(authUser);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  const handleEditProfile = () => {
    Alert.alert('Coming Soon', 'Edit profile functionality will be available soon.');
  };

  const handleChangeAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera roll permissions to change your avatar');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      try {
        // TODO: Implement avatar upload to backend
        Alert.alert('Coming Soon', 'Avatar upload will be available soon.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        Alert.alert('Error', 'Failed to upload avatar');
      }
    }
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const getSkillLevelColor = (level) => {
    const colors = {
      BEGINNER: '#666666',
      INTERMEDIATE: '#7B9F8C',
      ADVANCED: '#D97706',
      EXPERT: '#DC2626',
      PROFESSIONAL: '#9333EA',
    };
    return colors[level] || '#666666';
  };

  if (loading && !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7B9F8C" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#666666" />
          <Text style={styles.errorText}>Failed to load profile</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUserData}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate stats from user data (if available from backend)
  const stats = user.stats || {
    totalMatches: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7B9F8C"
          />
        }
      >
        {/* Header with Settings */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={handleSettings} style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Profile Info Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={handleChangeAvatar} style={styles.avatarContainer}>
            {user.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: user.avatarColor || '#7B9F8C' }]}>
                <Ionicons name="person-outline" size={50} color="#000000" />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <Text style={styles.fullName}>{user.fullName || 'User'}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          
          {user.profile?.bio && (
            <Text style={styles.bio}>{user.profile.bio}</Text>
          )}

          {(user.city || user.state) && (
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={16} color="#666666" />
              <Text style={styles.location}>
                {[user.city, user.state].filter(Boolean).join(', ')}
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={['#7B9F8C', '#5A7A6A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statsGradient}
          >
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalMatches}</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.wins}</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.winRate}%</Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Rankings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rankings</Text>
          <View style={styles.rankingsRow}>
            <View style={styles.rankCard}>
              <Ionicons name="globe-outline" size={32} color="#7B9F8C" />
              <Text style={styles.rankValue}>
                #{user.profile?.globalRank || 'N/A'}
              </Text>
              <Text style={styles.rankLabel}>Global</Text>
            </View>
            <View style={styles.rankCard}>
              <Ionicons name="location-outline" size={32} color="#7B9F8C" />
              <Text style={styles.rankValue}>
                #{user.profile?.cityRank || 'N/A'}
              </Text>
              <Text style={styles.rankLabel}>City</Text>
            </View>
          </View>
        </View>

        {/* Sports Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sports</Text>
          {user.sportProfiles && user.sportProfiles.length > 0 ? (
            user.sportProfiles.map((sportProfile) => (
              <View key={sportProfile.id} style={styles.sportCard}>
                <View style={styles.sportInfo}>
                  <Ionicons name="tennisball-outline" size={24} color="#7B9F8C" />
                  <View style={styles.sportDetails}>
                    <Text style={styles.sportName}>{sportProfile.sport.name}</Text>
                    <Text style={styles.sportStats}>
                      {sportProfile.matchesPlayed || 0} matches • {sportProfile.winRate || 0}% win rate
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.skillBadge,
                    { backgroundColor: getSkillLevelColor(sportProfile.skillLevel) },
                  ]}
                >
                  <Text style={styles.skillText}>{sportProfile.skillLevel}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No sports added yet</Text>
              <TouchableOpacity style={styles.addSportButton}>
                <Ionicons name="add-circle-outline" size={24} color="#7B9F8C" />
                <Text style={styles.addSportText}>Add Sport</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all ›</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.achievementsGrid}>
            {/* Placeholder achievements - will be replaced with real data */}
            <View style={styles.achievementCard}>
              <View style={[styles.achievementIcon, { backgroundColor: '#D97706' }]}>
                <Ionicons name="trophy" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.achievementName}>First Win</Text>
            </View>
            
            <View style={styles.achievementCard}>
              <View style={[styles.achievementIcon, { backgroundColor: '#DC2626' }]}>
                <Ionicons name="flame" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.achievementName}>Hot Streak</Text>
            </View>
            
            <View style={styles.achievementCard}>
              <View style={[styles.achievementIcon, { backgroundColor: '#666666' }]}>
                <Ionicons name="star" size={24} color="#333333" />
              </View>
              <Text style={styles.achievementName}>Locked</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#7B9F8C',
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingsButton: {
    padding: 8,
  },
  profileCard: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1A1A1A',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#1A1A1A',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#7B9F8C',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
  },
  fullName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  location: {
    fontSize: 14,
    color: '#666666',
  },
  editButton: {
    paddingHorizontal: 32,
    paddingVertical: 10,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsGradient: {
    flexDirection: 'row',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#E8F5F0',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#FFFFFF33',
    marginHorizontal: 12,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    color: '#7B9F8C',
    fontWeight: '500',
  },
  rankingsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rankCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  rankValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 4,
  },
  rankLabel: {
    fontSize: 12,
    color: '#666666',
  },
  sportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  sportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sportDetails: {
    marginLeft: 12,
    flex: 1,
  },
  sportName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sportStats: {
    fontSize: 13,
    color: '#666666',
  },
  skillBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  skillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    color: '#666666',
    fontSize: 16,
    marginBottom: 16,
  },
  addSportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addSportText: {
    color: '#7B9F8C',
    fontSize: 16,
    fontWeight: '600',
  },
  achievementsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  achievementCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default ProfileScreen;