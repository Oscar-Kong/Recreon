// src/screens/ProfileScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  Alert,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    id: 1,
    username: 'oscarkong',
    fullName: 'Oscar Kong',
    bio: 'Tennis enthusiast | Always up for a game 🎾',
    location: 'New York, NY',
    avatarColor: '#7B9F8C',
    avatarUrl: null,
    stats: {
      totalMatches: 127,
      wins: 85,
      losses: 42,
      winRate: 67,
      globalRank: 1247,
      cityRank: 23,
    },
    sports: [
      { name: 'Tennis', skillLevel: 'ADVANCED', matches: 89, winRate: 72 },
      { name: 'Basketball', skillLevel: 'INTERMEDIATE', matches: 34, winRate: 56 },
      { name: 'Badminton', skillLevel: 'EXPERT', matches: 4, winRate: 75 },
    ],
    achievements: [
      { id: 1, name: 'First Win', icon: 'trophy', color: '#D97706', unlocked: true },
      { id: 2, name: '10 Win Streak', icon: 'flame', color: '#DC2626', unlocked: true },
      { id: 3, name: '50 Matches', icon: 'star', color: '#7B9F8C', unlocked: true },
      { id: 4, name: 'Top 100', icon: 'medal', color: '#666666', unlocked: false },
    ],
    recentMatches: [
      { id: 1, opponent: 'Alex Chen', result: 'W', score: '6-4, 6-3', date: '2 days ago', sport: 'Tennis' },
      { id: 2, opponent: 'Sarah Kim', result: 'L', score: '3-6, 6-7', date: '3 days ago', sport: 'Tennis' },
      { id: 3, opponent: 'Mike Rodriguez', result: 'W', score: '6-2, 6-1', date: '5 days ago', sport: 'Tennis' },
    ]
  });

  const [showShareModal, setShowShareModal] = useState(false);

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    Alert.alert('Edit Profile', 'This will open edit profile screen');
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
      // Upload to Cloudinary and update user
      setUser(prev => ({ ...prev, avatarUrl: result.assets[0].uri }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handleShareAchievement = () => {
    setShowShareModal(true);
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: user.avatarColor }]}>
                <Ionicons name="person" size={40} color="#000000" />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <Text style={styles.fullName}>{user.fullName}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          
          {user.bio && (
            <Text style={styles.bio}>{user.bio}</Text>
          )}

          <View style={styles.locationContainer}>
            <Ionicons name="location" size={14} color="#666666" />
            <Text style={styles.location}>{user.location}</Text>
          </View>

          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Overall Stats */}
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={['#7B9F8C', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statsGradient}
          >
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.stats.totalMatches}</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.stats.wins}</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.stats.winRate}%</Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Rankings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rankings</Text>
          <View style={styles.rankingsContainer}>
            <View style={styles.rankCard}>
              <Ionicons name="globe-outline" size={24} color="#7B9F8C" />
              <Text style={styles.rankValue}>#{user.stats.globalRank}</Text>
              <Text style={styles.rankLabel}>Global</Text>
            </View>
            <View style={styles.rankCard}>
              <Ionicons name="location-outline" size={24} color="#7B9F8C" />
              <Text style={styles.rankValue}>#{user.stats.cityRank}</Text>
              <Text style={styles.rankLabel}>City</Text>
            </View>
          </View>
        </View>

        {/* Sports & Skill Levels */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sports</Text>
          {user.sports.map((sport, index) => (
            <View key={index} style={styles.sportCard}>
              <View style={styles.sportHeader}>
                <Text style={styles.sportName}>{sport.name}</Text>
                <View style={[
                  styles.skillBadge,
                  { backgroundColor: getSkillLevelColor(sport.skillLevel) }
                ]}>
                  <Text style={styles.skillBadgeText}>{sport.skillLevel}</Text>
                </View>
              </View>
              <View style={styles.sportStats}>
                <View style={styles.sportStatItem}>
                  <Text style={styles.sportStatValue}>{sport.matches}</Text>
                  <Text style={styles.sportStatLabel}>Matches</Text>
                </View>
                <View style={styles.sportStatItem}>
                  <Text style={styles.sportStatValue}>{sport.winRate}%</Text>
                  <Text style={styles.sportStatLabel}>Win Rate</Text>
                </View>
                <View style={styles.sportStatItem}>
                  <View style={styles.progressBarContainer}>
                    <View 
                      style={[
                        styles.progressBar,
                        { 
                          width: `${sport.winRate}%`,
                          backgroundColor: getSkillLevelColor(sport.skillLevel)
                        }
                      ]} 
                    />
                    </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <View style={styles.achievementHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <TouchableOpacity onPress={handleShareAchievement}>
              <Ionicons name="share-social-outline" size={20} color="#7B9F8C" />
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsScroll}
          >
            {user.achievements.map((achievement) => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  !achievement.unlocked && styles.achievementLocked
                ]}
              >
                <View style={[
                  styles.achievementIcon,
                  { backgroundColor: achievement.unlocked ? achievement.color : '#333333' }
                ]}>
                  <Ionicons 
                    name={achievement.icon} 
                    size={28} 
                    color={achievement.unlocked ? '#FFFFFF' : '#666666'} 
                  />
                </View>
                <Text style={[
                  styles.achievementName,
                  !achievement.unlocked && styles.achievementNameLocked
                ]}>
                  {achievement.name}
                </Text>
                {!achievement.unlocked && (
                  <Ionicons name="lock-closed" size={16} color="#666666" />
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Match History - Compact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Matches</Text>
          {user.recentMatches.map((match) => (
            <View key={match.id} style={styles.matchHistoryItem}>
              <View style={[
                styles.resultBadge,
                match.result === 'W' ? styles.winBadge : styles.lossBadge
              ]}>
                <Text style={styles.resultText}>{match.result}</Text>
              </View>
              <View style={styles.matchDetails}>
                <Text style={styles.matchOpponent}>vs {match.opponent}</Text>
                <Text style={styles.matchScore}>{match.score}</Text>
              </View>
              <Text style={styles.matchDate}>{match.date}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All Matches</Text>
            <Ionicons name="chevron-forward" size={16} color="#7B9F8C" />
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Share Achievement Modal */}
      <Modal
        visible={showShareModal}
        animationType="slide"
        presentationStyle="pageSheet"
        transparent={true}
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.shareModalOverlay}>
          <View style={styles.shareModalContent}>
            <Text style={styles.shareModalTitle}>Share Achievement</Text>
            <View style={styles.shareOptions}>
              <TouchableOpacity style={styles.shareOption}>
                <Ionicons name="logo-instagram" size={32} color="#E4405F" />
                <Text style={styles.shareOptionText}>Instagram</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareOption}>
                <Ionicons name="logo-twitter" size={32} color="#1DA1F2" />
                <Text style={styles.shareOptionText}>Twitter</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareOption}>
                <Ionicons name="copy-outline" size={32} color="#7B9F8C" />
                <Text style={styles.shareOptionText}>Copy Link</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={styles.shareModalCancel}
              onPress={() => setShowShareModal(false)}
            >
              <Text style={styles.shareModalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  rankingsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
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
    marginTop: 8,
    marginBottom: 4,
  },
  rankLabel: {
    fontSize: 12,
    color: '#666666',
  },
  sportCard: {
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
  },
  sportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sportName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  skillBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  sportStats: {
    flexDirection: 'row',
    gap: 20,
  },
  sportStatItem: {
    flex: 1,
  },
  sportStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  sportStatLabel: {
    fontSize: 11,
    color: '#666666',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#333333',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  achievementsScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  achievementCard: {
    alignItems: 'center',
    width: 100,
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementNameLocked: {
    color: '#666666',
  },
  matchHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
  },
  resultBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  winBadge: {
    backgroundColor: '#059669',
  },
  lossBadge: {
    backgroundColor: '#DC2626',
  },
  resultText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  matchDetails: {
    flex: 1,
  },
  matchOpponent: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 2,
  },
  matchScore: {
    fontSize: 12,
    color: '#666666',
  },
  matchDate: {
    fontSize: 11,
    color: '#666666',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 12,
    gap: 4,
  },
  viewAllText: {
    color: '#7B9F8C',
    fontSize: 14,
    fontWeight: '600',
  },
  // Share Modal Styles
  shareModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  shareModalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  shareModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  shareOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  shareOption: {
    alignItems: 'center',
    gap: 8,
  },
  shareOptionText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  shareModalCancel: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareModalCancelText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;