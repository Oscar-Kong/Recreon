// src/screens/PlayScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const PlayScreen = ({ navigation }) => {
  const [selectedMode, setSelectedMode] = useState('casual'); // 'casual' or 'ranked'
  const [selectedSport, setSelectedSport] = useState('Tennis');
  const [skillLevel, setSkillLevel] = useState('INTERMEDIATE');
  const [distance, setDistance] = useState(5); // km
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [matchSuggestions, setMatchSuggestions] = useState([
    {
      id: 1,
      playerName: 'Alex Chen',
      sport: 'Tennis',
      skillLevel: 'INTERMEDIATE',
      distance: '2.3 km',
      winRate: 68,
      matches: 45,
      avatarColor: '#DC2626',
      availability: 'Available now'
    },
    {
      id: 2,
      playerName: 'Sarah Kim',
      sport: 'Tennis',
      skillLevel: 'ADVANCED',
      distance: '3.8 km',
      winRate: 72,
      matches: 89,
      avatarColor: '#059669',
      availability: 'Available in 1h'
    },
    {
      id: 3,
      playerName: 'Mike Rodriguez',
      sport: 'Tennis',
      skillLevel: 'INTERMEDIATE',
      distance: '4.2 km',
      winRate: 55,
      matches: 23,
      avatarColor: '#D97706',
      availability: 'Available now'
    },
  ]);

  const sports = [
    { name: 'Tennis', icon: 'tennisball', color: '#7B9F8C' },
    { name: 'Basketball', icon: 'basketball', color: '#DC2626' },
    { name: 'Soccer', icon: 'football', color: '#059669' },
    { name: 'Badminton', icon: 'tennisball', color: '#D97706' },
    { name: 'Volleyball', icon: 'baseball', color: '#2563EB' },
  ];

  const skillLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', 'PROFESSIONAL'];
  const distances = [1, 5, 10, 25, 50];

  const handleQuickMatch = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsSearching(true);

    // Simulate matchmaking
    setTimeout(() => {
      setIsSearching(false);
      Alert.alert(
        'Match Found!',
        `Found a ${selectedMode} match nearby`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Accept', onPress: () => console.log('Match accepted') }
        ]
      );
    }, 2000);
  };

  const handleModeSwitch = (mode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMode(mode);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Play</Text>
        </View>

        {/* Mode Selector - Casual vs Ranked */}
        <View style={styles.modeContainer}>
          <TouchableOpacity
            style={[styles.modeButton, selectedMode === 'casual' && styles.modeButtonActive]}
            onPress={() => handleModeSwitch('casual')}
          >
            <Ionicons 
              name="game-controller-outline" 
              size={24} 
              color={selectedMode === 'casual' ? '#FFFFFF' : '#666666'} 
            />
            <Text style={[styles.modeText, selectedMode === 'casual' && styles.modeTextActive]}>
              Casual
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeButton, selectedMode === 'ranked' && styles.modeButtonActive]}
            onPress={() => handleModeSwitch('ranked')}
          >
            <Ionicons 
              name="trophy-outline" 
              size={24} 
              color={selectedMode === 'ranked' ? '#FFFFFF' : '#666666'} 
            />
            <Text style={[styles.modeText, selectedMode === 'ranked' && styles.modeTextActive]}>
              Ranked
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sport Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Sport</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sportsScroll}
          >
            {sports.map((sport) => (
              <TouchableOpacity
                key={sport.name}
                style={[
                  styles.sportCard,
                  selectedSport === sport.name && styles.sportCardActive
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedSport(sport.name);
                }}
              >
                <Ionicons 
                  name={sport.icon} 
                  size={32} 
                  color={selectedSport === sport.name ? sport.color : '#666666'} 
                />
                <Text style={[
                  styles.sportName,
                  selectedSport === sport.name && styles.sportNameActive
                ]}>
                  {sport.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Match Settings */}
        <View style={styles.settingsContainer}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="bar-chart-outline" size={20} color="#7B9F8C" />
              <Text style={styles.settingLabel}>Skill Level</Text>
            </View>
            <TouchableOpacity 
              style={styles.settingValue}
              onPress={() => setShowFilters(true)}
            >
              <Text style={styles.settingValueText}>{skillLevel}</Text>
              <Ionicons name="chevron-forward" size={20} color="#666666" />
            </TouchableOpacity>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="location-outline" size={20} color="#7B9F8C" />
              <Text style={styles.settingLabel}>Max Distance</Text>
            </View>
            <TouchableOpacity 
              style={styles.settingValue}
              onPress={() => setShowFilters(true)}
            >
              <Text style={styles.settingValueText}>{distance} km</Text>
              <Ionicons name="chevron-forward" size={20} color="#666666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Big Quick Match Button - Clash Royale Style */}
        <TouchableOpacity 
          style={styles.quickMatchButton}
          onPress={handleQuickMatch}
          disabled={isSearching}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={selectedMode === 'ranked' ? ['#D97706', '#DC2626'] : ['#059669', '#7B9F8C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.quickMatchGradient}
          >
            {isSearching ? (
              <>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.quickMatchText}>Searching...</Text>
              </>
            ) : (
              <>
                <Ionicons name="flash" size={40} color="#FFFFFF" />
                <Text style={styles.quickMatchText}>QUICK MATCH</Text>
                <Text style={styles.quickMatchSubtext}>
                  {selectedMode === 'ranked' ? 'Competitive Match' : 'Casual Play'}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Best Match Suggestions */}
        <View style={styles.section}>
          <View style={styles.suggestionHeader}>
            <Text style={styles.sectionTitle}>Best Matches</Text>
            <Text style={styles.suggestionSubtext}>Based on your preferences</Text>
          </View>

          {matchSuggestions.map((match) => (
            <TouchableOpacity
              key={match.id}
              style={styles.matchCard}
              onPress={() => {
                Alert.alert(
                  'Challenge Player',
                  `Send match request to ${match.playerName}?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Send Request', onPress: () => console.log('Request sent') }
                  ]
                );
              }}
            >
              {/* Player Avatar */}
              <View style={[styles.matchAvatar, { backgroundColor: match.avatarColor }]}>
                <Ionicons name="person" size={24} color="#000000" />
              </View>

              {/* Player Info */}
              <View style={styles.matchInfo}>
                <Text style={styles.matchName}>{match.playerName}</Text>
                <View style={styles.matchMeta}>
                  <View style={styles.matchMetaItem}>
                    <Ionicons name="bar-chart" size={14} color="#7B9F8C" />
                    <Text style={styles.matchMetaText}>{match.skillLevel}</Text>
                  </View>
                  <View style={styles.matchMetaItem}>
                    <Ionicons name="location" size={14} color="#666666" />
                    <Text style={styles.matchMetaText}>{match.distance}</Text>
                  </View>
                </View>
                <View style={styles.matchStats}>
                  <Text style={styles.matchStatsText}>
                    {match.winRate}% Win Rate • {match.matches} Matches
                  </Text>
                </View>
              </View>

              {/* Availability Badge */}
              <View style={styles.matchBadge}>
                <View style={[
                  styles.availabilityDot,
                  match.availability.includes('now') && styles.availableDot
                ]} />
                <Text style={styles.matchAvailability}>{match.availability}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilters(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Match Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Text style={styles.modalDone}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Skill Level Selector */}
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Skill Level</Text>
              <View style={styles.filterOptions}>
                {skillLevels.map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.filterOption,
                      skillLevel === level && styles.filterOptionActive
                    ]}
                    onPress={() => setSkillLevel(level)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      skillLevel === level && styles.filterOptionTextActive
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Distance Selector */}
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Maximum Distance</Text>
              <View style={styles.filterOptions}>
                {distances.map((dist) => (
                  <TouchableOpacity
                    key={dist}
                    style={[
                      styles.filterOption,
                      distance === dist && styles.filterOptionActive
                    ]}
                    onPress={() => setDistance(dist)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      distance === dist && styles.filterOptionTextActive
                    ]}>
                      {dist} km
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: '#1A1A1A',
  },
  modeButtonActive: {
    backgroundColor: '#7B9F8C',
    borderColor: '#7B9F8C',
  },
  modeText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
  modeTextActive: {
    color: '#FFFFFF',
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
  sportsScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  sportCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#1A1A1A',
    minWidth: 100,
  },
  sportCardActive: {
    borderColor: '#7B9F8C',
  },
  sportName: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  sportNameActive: {
    color: '#FFFFFF',
  },
  settingsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValueText: {
    color: '#7B9F8C',
    fontSize: 16,
    fontWeight: '600',
  },
  quickMatchButton: {
    marginHorizontal: 20,
    marginBottom: 32,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#7B9F8C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  quickMatchGradient: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  quickMatchText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  quickMatchSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  suggestionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  suggestionSubtext: {
    color: '#666666',
    fontSize: 14,
    marginTop: 4,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
  },
  matchAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  matchMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  matchMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  matchMetaText: {
    color: '#666666',
    fontSize: 12,
  },
  matchStats: {
    marginTop: 2,
  },
  matchStatsText: {
    color: '#999999',
    fontSize: 12,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666666',
  },
  availableDot: {
    backgroundColor: '#059669',
  },
  matchAvailability: {
    color: '#666666',
    fontSize: 11,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  modalCancel: {
    color: '#666666',
    fontSize: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  modalDone: {
    color: '#7B9F8C',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 32,
  },
  filterTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#1A1A1A',
  },
  filterOptionActive: {
    backgroundColor: '#7B9F8C',
    borderColor: '#7B9F8C',
  },
  filterOptionText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: '#FFFFFF',
  },
});

export default PlayScreen;