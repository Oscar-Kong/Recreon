// src/screens/MatchHistoryScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { EmptyHistoryState, ErrorState } from '../components/common/EmptyState';
import { ListSkeleton } from '../components/common/LoadingSkeleton';

/**
 * Match History Screen
 * 
 * Displays user's past matches with results and statistics.
 */

const MatchHistoryScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'won', 'lost'

  useEffect(() => {
    fetchMatchHistory();
  }, []);

  const fetchMatchHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Create getMatchHistory endpoint in backend
      const response = await api.get('/api/matches/history');
      setMatches(response.data.matches || []);
    } catch (err) {
      console.error('Error fetching match history:', err);
      // For now, show empty state instead of error
      setMatches([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredMatches = () => {
    if (filter === 'all') return matches;
    if (filter === 'won') return matches.filter(m => m.result === 'won');
    if (filter === 'lost') return matches.filter(m => m.result === 'lost');
    return matches;
  };

  const getResultColor = (result) => {
    if (result === 'won') return '#059669';
    if (result === 'lost') return '#DC2626';
    return '#999999';
  };

  const getResultIcon = (result) => {
    if (result === 'won') return 'checkmark-circle';
    if (result === 'lost') return 'close-circle';
    return 'remove-circle';
  };

  const renderMatchItem = ({ item }) => {
    const matchDate = new Date(item.scheduledTime);
    const isRecent = Date.now() - matchDate.getTime() < 24 * 60 * 60 * 1000;

    return (
      <TouchableOpacity
        style={styles.matchCard}
        onPress={() => {
          // TODO: Navigate to match details
          console.log('Match details:', item.id);
        }}
      >
        <View style={styles.matchHeader}>
          <View style={styles.sportBadge}>
            <Ionicons name="tennisball" size={16} color="#7B9F8C" />
            <Text style={styles.sportText}>{item.sport?.displayName || 'Sport'}</Text>
          </View>
          <Text style={styles.matchDate}>
            {isRecent ? 'Today' : matchDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>

        <View style={styles.matchContent}>
          <View style={styles.matchPlayers}>
            <View style={styles.playerSection}>
              <Text style={styles.playerLabel}>You</Text>
              <Text style={styles.playerScore}>{item.yourScore || 0}</Text>
            </View>

            <View style={[
              styles.resultBadge,
              { backgroundColor: getResultColor(item.result) + '20' }
            ]}>
              <Ionicons
                name={getResultIcon(item.result)}
                size={32}
                color={getResultColor(item.result)}
              />
            </View>

            <View style={[styles.playerSection, styles.playerSectionRight]}>
              <Text style={styles.playerLabel}>Opponent</Text>
              <Text style={styles.playerScore}>{item.opponentScore || 0}</Text>
            </View>
          </View>

          {item.opponent && (
            <TouchableOpacity
              style={styles.opponentInfo}
              onPress={() => navigation.navigate('UserProfile', { userId: item.opponent.id })}
            >
              <View style={[
                styles.opponentAvatar,
                { backgroundColor: item.opponent.avatarColor || '#7B9F8C' }
              ]}>
                <Ionicons name="person" size={16} color="#000000" />
              </View>
              <Text style={styles.opponentName}>
                {item.opponent.fullName || item.opponent.username}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#666666" />
            </TouchableOpacity>
          )}

          {item.venue && (
            <View style={styles.matchDetail}>
              <Ionicons name="location-outline" size={14} color="#666666" />
              <Text style={styles.matchDetailText}>{item.venue}</Text>
            </View>
          )}

          <View style={styles.matchDetail}>
            <Ionicons name="time-outline" size={14} color="#666666" />
            <Text style={styles.matchDetailText}>
              {matchDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          </View>

          {item.matchType === 'RANKED' && item.eloChange && (
            <View style={styles.eloChange}>
              <Ionicons
                name={item.eloChange > 0 ? 'trending-up' : 'trending-down'}
                size={14}
                color={item.eloChange > 0 ? '#059669' : '#DC2626'}
              />
              <Text style={[
                styles.eloChangeText,
                { color: item.eloChange > 0 ? '#059669' : '#DC2626' }
              ]}>
                {item.eloChange > 0 ? '+' : ''}{item.eloChange} ELO
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

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
        <Text style={styles.headerTitle}>Match History</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['all', 'won', 'lost'].map((filterType) => (
          <TouchableOpacity
            key={filterType}
            style={[
              styles.filterTab,
              filter === filterType && styles.filterTabActive,
            ]}
            onPress={() => setFilter(filterType)}
          >
            <Text style={[
              styles.filterText,
              filter === filterType && styles.filterTextActive,
            ]}>
              {filterType === 'all' ? 'All' : filterType === 'won' ? 'Won' : 'Lost'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Match List */}
      {loading ? (
        <ListSkeleton count={5} />
      ) : error ? (
        <ErrorState errorMessage={error} onRetry={fetchMatchHistory} />
      ) : getFilteredMatches().length === 0 ? (
        <EmptyHistoryState />
      ) : (
        <FlatList
          data={getFilteredMatches()}
          renderItem={renderMatchItem}
          keyExtractor={(item) => item.id.toString()}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
  },
  filterTabActive: {
    backgroundColor: '#7B9F8C20',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  filterTextActive: {
    color: '#7B9F8C',
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  matchCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7B9F8C20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sportText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7B9F8C',
  },
  matchDate: {
    fontSize: 12,
    color: '#999999',
  },
  matchContent: {
    gap: 12,
  },
  matchPlayers: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerSection: {
    flex: 1,
    alignItems: 'center',
  },
  playerSectionRight: {
    alignItems: 'center',
  },
  playerLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },
  playerScore: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resultBadge: {
    padding: 12,
    borderRadius: 50,
  },
  opponentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  opponentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  opponentName: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  matchDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matchDetailText: {
    fontSize: 13,
    color: '#999999',
  },
  eloChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
  },
  eloChangeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default MatchHistoryScreen;

