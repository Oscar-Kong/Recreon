// src/screens/UserProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import EmptyState, { ErrorState } from '../components/common/EmptyState';
import { showToast } from '../components/common/Toast';

/**
 * User Profile Screen
 * 
 * Displays public profile information for other users.
 * Shows sports, stats, and allows sending match requests.
 */

const UserProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Create getUserProfile endpoint in backend
      const response = await api.get(`/api/users/${userId}/profile`);
      setUser(response.data);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMatchRequest = async () => {
    try {
      setSendingRequest(true);
      
      // TODO: Implement match request functionality
      // await matchmakingService.sendMatchRequest({ targetUserId: userId, ... });
      
      showToast({
        type: 'success',
        message: 'Match request sent!',
      });
    } catch (err) {
      showToast({
        type: 'error',
        message: 'Failed to send match request',
      });
    } finally {
      setSendingRequest(false);
    }
  };

  const handleSendMessage = () => {
    // Navigate to chat with this user
    navigation.navigate('Chat', { userId });
  };

  const getSportIcon = (sportName) => {
    const icons = {
      'Tennis': 'tennisball',
      'Basketball': 'basketball',
      'Soccer': 'football',
      'Football': 'football',
      'Badminton': 'tennisball',
      'Volleyball': 'baseball',
      'Pickleball': 'tennisball',
      'Squash': 'tennisball',
    };
    return icons[sportName] || 'football';
  };

  const getSkillLevelColor = (skillLevel) => {
    const colors = {
      'BEGINNER': '#7B9F8C',
      'INTERMEDIATE': '#D97706',
      'ADVANCED': '#DC2626',
      'EXPERT': '#9333EA',
      'PROFESSIONAL': '#DB2777',
    };
    return colors[skillLevel] || '#7B9F8C';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7B9F8C" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState
          errorMessage={error}
          onRetry={fetchUserProfile}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerRight} />
        </View>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={['#7B9F8C20', 'transparent']}
            style={styles.headerGradient}
          >
            <View style={[
              styles.avatar,
              { backgroundColor: user.avatarColor || '#7B9F8C' }
            ]}>
              {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={50} color="#000000" />
              )}
            </View>

            <Text style={styles.name}>{user.fullName || user.username}</Text>
            <Text style={styles.username}>@{user.username}</Text>

            {user.profile?.bio && (
              <Text style={styles.bio}>{user.profile.bio}</Text>
            )}

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {user.sportProfiles?.length || 0}
                </Text>
                <Text style={styles.statLabel}>Sports</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {user.sportProfiles?.reduce((sum, sp) => sum + sp.matchesPlayed, 0) || 0}
                </Text>
                <Text style={styles.statLabel}>Matches</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {user.sportProfiles?.length > 0
                    ? Math.round(
                        user.sportProfiles.reduce((sum, sp) => sum + sp.winRate, 0) /
                        user.sportProfiles.length
                      )
                    : 0}%
                </Text>
                <Text style={styles.statLabel}>Win Rate</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryAction]}
            onPress={handleSendMatchRequest}
            disabled={sendingRequest}
          >
            <LinearGradient
              colors={['#7B9F8C', '#059669']}
              style={styles.actionButtonGradient}
            >
              {sendingRequest ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="game-controller" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Challenge</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryAction]}
            onPress={handleSendMessage}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#7B9F8C" />
            <Text style={styles.secondaryActionText}>Message</Text>
          </TouchableOpacity>
        </View>

        {/* Sports Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sports</Text>

          {user.sportProfiles && user.sportProfiles.length > 0 ? (
            <View style={styles.sportsGrid}>
              {user.sportProfiles.map((sportProfile) => (
                <View key={sportProfile.id} style={styles.sportCard}>
                  <View style={[
                    styles.sportIconContainer,
                    { borderColor: getSkillLevelColor(sportProfile.skillLevel) }
                  ]}>
                    <Ionicons
                      name={getSportIcon(sportProfile.sport.name)}
                      size={32}
                      color={getSkillLevelColor(sportProfile.skillLevel)}
                    />
                  </View>
                  <Text style={styles.sportName}>{sportProfile.sport.displayName}</Text>
                  <Text style={[
                    styles.skillLevel,
                    { color: getSkillLevelColor(sportProfile.skillLevel) }
                  ]}>
                    {sportProfile.skillLevel}
                  </Text>
                  
                  <View style={styles.sportStats}>
                    <Text style={styles.sportStatText}>
                      {sportProfile.matchesPlayed} matches
                    </Text>
                    <Text style={styles.sportStatText}>
                      {Math.round(sportProfile.winRate)}% win rate
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              icon="trophy-outline"
              title="No Sports Yet"
              message="This user hasn't added any sports to their profile"
            />
          )}
        </View>

        {/* Location Section */}
        {(user.city || user.state) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationCard}>
              <Ionicons name="location" size={20} color="#7B9F8C" />
              <Text style={styles.locationText}>
                {[user.city, user.state, user.country].filter(Boolean).join(', ')}
              </Text>
            </View>
          </View>
        )}
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
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
  },
  profileHeader: {
    marginBottom: 24,
  },
  headerGradient: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#999999',
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#333333',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7B9F8C',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999999',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  primaryAction: {
    flex: 1.5,
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#7B9F8C',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryActionText: {
    color: '#7B9F8C',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sportCard: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  sportIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  sportName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  skillLevel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  sportStats: {
    alignItems: 'center',
  },
  sportStatText: {
    fontSize: 11,
    color: '#999999',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
});

export default UserProfileScreen;

