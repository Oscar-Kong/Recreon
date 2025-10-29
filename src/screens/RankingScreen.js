// src/screens/RankingScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { sportsService } from '../services/sportsService';
import EmptyState, { ErrorState } from '../components/common/EmptyState';
import { ListSkeleton } from '../components/common/LoadingSkeleton';

/**
 * Ranking/Leaderboard Screen
 * 
 * Displays rankings for different sports and scopes (city, state, country, global).
 * Shows user's ranking and allows viewing top players.
 */

const RankingScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [sports, setSports] = useState([]);
  const [selectedSport, setSelectedSport] = useState(null);
  const [selectedScope, setSelectedScope] = useState('global');
  const [rankings, setRankings] = useState([]);
  const [myRanking, setMyRanking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const scopes = [
    { key: 'city', label: 'City', icon: 'business' },
    { key: 'state', label: 'State', icon: 'map' },
    { key: 'country', label: 'Country', icon: 'flag' },
    { key: 'global', label: 'Global', icon: 'globe' },
  ];

  useEffect(() => {
    fetchSports();
  }, []);

  useEffect(() => {
    if (selectedSport) {
      fetchRankings();
    }
  }, [selectedSport, selectedScope]);

  const fetchSports = async () => {
    try {
      const response = await sportsService.getAllSports();
      const sportsData = response.sports || [];
      setSports(sportsData);
      
      if (sportsData.length > 0) {
        // Select user's first sport or default to first sport
        const userSport = user?.sportProfiles?.[0]?.sport;
        setSelectedSport(userSport || sportsData[0]);
      }
    } catch (err) {
      console.error('Error fetching sports:', err);
      setError('Failed to load sports');
    } finally {
      setLoading(false);
    }
  };

  const fetchRankings = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Create getRankings endpoint in backend
      const response = await api.get('/api/rankings/leaderboard', {
        params: {
          sportId: selectedSport.id,
          scope: selectedScope,
          limit: 50,
        },
      });

      setRankings(response.data.rankings || []);
      setMyRanking(response.data.myRanking || null);
    } catch (err) {
      console.error('Error fetching rankings:', err);
      // For now, show mock data
      setRankings([]);
      setError(null); // Don't show error, just empty state
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return '#7B9F8C';
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return 'trophy';
    if (rank === 2) return 'medal';
    if (rank === 3) return 'ribbon';
    return 'stats-chart';
  };

  const renderRankingItem = ({ item, index }) => {
    const isCurrentUser = item.user?.id === user?.id;
    const rank = item.rank || index + 1;

    return (
      <TouchableOpacity
        style={[styles.rankingCard, isCurrentUser && styles.rankingCardHighlight]}
        onPress={() => {
          if (!isCurrentUser) {
            navigation.navigate('UserProfile', { userId: item.user.id });
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.rankingLeft}>
          <View style={[styles.rankBadge, { backgroundColor: getRankColor(rank) + '20' }]}>
            {rank <= 3 ? (
              <Ionicons name={getRankIcon(rank)} size={20} color={getRankColor(rank)} />
            ) : (
              <Text style={[styles.rankText, { color: getRankColor(rank) }]}>
                #{rank}
              </Text>
            )}
          </View>

          <View style={[
            styles.avatar,
            { backgroundColor: item.user?.avatarColor || '#7B9F8C' }
          ]}>
            <Ionicons name="person" size={20} color="#000000" />
          </View>

          <View style={styles.playerInfo}>
            <View style={styles.playerHeader}>
              <Text style={styles.playerName}>
                {item.user?.fullName || item.user?.username}
                {isCurrentUser && ' (You)'}
              </Text>
            </View>
            <Text style={styles.playerStats}>
              {item.rankedMatchesPlayed} matches • {Math.round(item.rankedMatchesWon / item.rankedMatchesPlayed * 100)}% WR
            </Text>
          </View>
        </View>

        <View style={styles.rankingRight}>
          <Text style={styles.eloRating}>{item.eloRating}</Text>
          <Text style={styles.eloLabel}>ELO</Text>
          {item.streak > 0 && (
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={12} color="#DC2626" />
              <Text style={styles.streakText}>{item.streak}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !selectedSport) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7B9F8C" />
          <Text style={styles.loadingText}>Loading rankings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rankings</Text>
      </View>

      {/* Sport Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sportSelector}
        contentContainerStyle={styles.sportSelectorContent}
      >
        {sports.map((sport) => (
          <TouchableOpacity
            key={sport.id}
            style={[
              styles.sportChip,
              selectedSport?.id === sport.id && styles.sportChipActive,
            ]}
            onPress={() => setSelectedSport(sport)}
          >
            <Text style={[
              styles.sportChipText,
              selectedSport?.id === sport.id && styles.sportChipTextActive,
            ]}>
              {sport.displayName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Scope Selector */}
      <View style={styles.scopeSelector}>
        {scopes.map((scope) => (
          <TouchableOpacity
            key={scope.key}
            style={[
              styles.scopeButton,
              selectedScope === scope.key && styles.scopeButtonActive,
            ]}
            onPress={() => setSelectedScope(scope.key)}
          >
            <Ionicons
              name={scope.icon}
              size={16}
              color={selectedScope === scope.key ? '#7B9F8C' : '#666666'}
            />
            <Text style={[
              styles.scopeText,
              selectedScope === scope.key && styles.scopeTextActive,
            ]}>
              {scope.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* My Ranking Card */}
      {myRanking && (
        <View style={styles.myRankingCard}>
          <LinearGradient
            colors={['#7B9F8C20', '#7B9F8C10']}
            style={styles.myRankingGradient}
          >
            <Text style={styles.myRankingTitle}>Your Ranking</Text>
            <View style={styles.myRankingContent}>
              <View style={styles.myRankingItem}>
                <Text style={styles.myRankingValue}>#{myRanking.rank}</Text>
                <Text style={styles.myRankingLabel}>Rank</Text>
              </View>
              <View style={styles.myRankingDivider} />
              <View style={styles.myRankingItem}>
                <Text style={styles.myRankingValue}>{myRanking.eloRating}</Text>
                <Text style={styles.myRankingLabel}>ELO</Text>
              </View>
              <View style={styles.myRankingDivider} />
              <View style={styles.myRankingItem}>
                <Text style={styles.myRankingValue}>
                  {Math.round((myRanking.rankedMatchesWon / myRanking.rankedMatchesPlayed) * 100)}%
                </Text>
                <Text style={styles.myRankingLabel}>Win Rate</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Rankings List */}
      {loading ? (
        <ListSkeleton count={10} />
      ) : error ? (
        <ErrorState errorMessage={error} onRetry={fetchRankings} />
      ) : rankings.length === 0 ? (
        <EmptyState
          icon="trophy-outline"
          title="No Rankings Yet"
          message="Rankings will appear here once players complete ranked matches"
        />
      ) : (
        <FlatList
          data={rankings}
          renderItem={renderRankingItem}
          keyExtractor={(item) => item.user.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sportSelector: {
    marginBottom: 16,
  },
  sportSelectorContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  sportChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
  },
  sportChipActive: {
    backgroundColor: '#7B9F8C20',
    borderColor: '#7B9F8C',
  },
  sportChipText: {
    color: '#999999',
    fontSize: 14,
    fontWeight: '500',
  },
  sportChipTextActive: {
    color: '#7B9F8C',
    fontWeight: '600',
  },
  scopeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  scopeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
  },
  scopeButtonActive: {
    backgroundColor: '#7B9F8C20',
  },
  scopeText: {
    color: '#666666',
    fontSize: 12,
    fontWeight: '500',
  },
  scopeTextActive: {
    color: '#7B9F8C',
    fontWeight: '600',
  },
  myRankingCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  myRankingGradient: {
    padding: 16,
  },
  myRankingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7B9F8C',
    marginBottom: 12,
  },
  myRankingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  myRankingItem: {
    flex: 1,
    alignItems: 'center',
  },
  myRankingValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  myRankingLabel: {
    fontSize: 12,
    color: '#999999',
  },
  myRankingDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#333333',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  rankingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  rankingCardHighlight: {
    borderWidth: 2,
    borderColor: '#7B9F8C',
  },
  rankingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  playerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  playerStats: {
    fontSize: 12,
    color: '#999999',
  },
  rankingRight: {
    alignItems: 'center',
  },
  eloRating: {
    fontSize: 20,
    fontWeight: '700',
    color: '#7B9F8C',
    marginBottom: 2,
  },
  eloLabel: {
    fontSize: 10,
    color: '#999999',
    marginBottom: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#DC262620',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
  },
});

export default RankingScreen;

