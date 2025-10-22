// src/screens/HomeScreen.js - UPDATED WITH DATABASE INTEGRATION
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import SearchBar from '../components/common/SearchBar';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

// Component for recently played user cards
const RecentlyPlayedCard = ({ user, onPress }) => (
  <TouchableOpacity style={styles.recentlyPlayedCard} onPress={onPress}>
    <View style={[styles.avatar, { backgroundColor: user.avatarColor || '#7B9F8C' }]}>
      <Ionicons name="person-outline" size={30} color="#000000" />
    </View>
    <Text style={styles.recentlyPlayedName} numberOfLines={1}>
      {user.fullName || user.username}
    </Text>
  </TouchableOpacity>
);

// Component for game cards
const GameCard = ({ game, onPress }) => (
  <TouchableOpacity style={styles.gameCard} onPress={onPress}>
    <View style={styles.gameHeader}>
      <View>
        <Text style={styles.gameTitle}>{game.title}</Text>
        <Text style={styles.gameType}>{game.eventType || 'Match'}</Text>
      </View>
      {game.isFull && (
        <View style={styles.fullBadge}>
          <Text style={styles.fullText}>FULL</Text>
        </View>
      )}
    </View>
    
    <View style={styles.playersRow}>
      {[...Array(game.maxPlayers || 4)].map((_, i) => (
        <View 
          key={i}
          style={[
            styles.playerDot,
            { backgroundColor: i < (game.currentPlayers || 0) ? '#FFFFFF' : '#333333' }
          ]}
        />
      ))}
    </View>
    
    <View style={styles.gameInfo}>
      <Ionicons name="location-outline" size={14} color="#666666" />
      <Text style={styles.gameLocation}>{game.venue || 'Location TBD'}</Text>
    </View>
    
    <View style={styles.gameInfo}>
      <Ionicons name="time-outline" size={14} color="#666666" />
      <Text style={styles.gameTime}>
        {new Date(game.startTime).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        })}
      </Text>
    </View>
  </TouchableOpacity>
);

// Component for article/guide cards
const ArticleCard = ({ article, onPress }) => (
  <TouchableOpacity style={styles.articleCard} onPress={onPress}>
    <View>
      <Text style={styles.articleTitle}>{article.title}</Text>
      <Text style={styles.articleInfo}>
        {article.sport} • {article.readTime || 5} min read
      </Text>
    </View>
    <View style={[
      styles.levelBadge, 
      { backgroundColor: article.level === 'BEGINNER' ? '#7B9F8C' : '#D97706' }
    ]}>
      <Text style={styles.levelText}>{article.level || 'ALL'}</Text>
    </View>
  </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // State for real data
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [games, setGames] = useState([]);
  const [articles, setArticles] = useState([]);

  // Fetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, [])
  );

  // Request location permission and get current location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        try {
          const currentLocation = await Location.getCurrentPositionAsync({});
          setLocation(currentLocation);
        } catch (error) {
          console.error('Error getting location:', error);
        }
      }
    })();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch data in parallel
      await Promise.all([
        fetchRecentlyPlayed(),
        fetchGames(),
        fetchArticles(),
      ]);
    } catch (error) {
      console.error('Error fetching home data:', error);
      Alert.alert('Error', 'Failed to load data. Pull down to refresh.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentlyPlayed = async () => {
    try {
      // TODO: Replace with actual API endpoint
      // const response = await api.get('/users/recent-matches');
      // setRecentlyPlayed(response.data.users || []);
      
      // For now, show empty state
      setRecentlyPlayed([]);
    } catch (error) {
      console.error('Error fetching recently played:', error);
      setRecentlyPlayed([]);
    }
  };

  const fetchGames = async () => {
    try {
      // Fetch upcoming events/games from API
      const response = await api.get('/events/discover', {
        params: {
          limit: 5,
          // Add location params if available
          ...(location && {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }),
        },
      });
      
      setGames(response.data.events || []);
    } catch (error) {
      console.error('Error fetching games:', error);
      // Show empty state instead of crashing
      setGames([]);
    }
  };

  const fetchArticles = async () => {
    try {
      // TODO: Replace with actual API endpoint when articles feature is implemented
      // const response = await api.get('/articles/featured');
      // setArticles(response.data.articles || []);
      
      // For now, show empty state or placeholder
      setArticles([]);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const handleGamePress = (game) => {
    // Navigate to game details
    Alert.alert('Game Details', `Selected: ${game.title}`);
    // navigation.navigate('GameDetails', { gameId: game.id });
  };

  const handleArticlePress = (article) => {
    // Navigate to article details
    Alert.alert('Article', `Selected: ${article.title}`);
    // navigation.navigate('Article', { articleId: article.id });
  };

  const handleUserPress = (userItem) => {
    // Navigate to user profile
    Alert.alert('User Profile', `Selected: ${userItem.fullName || userItem.username}`);
    // navigation.navigate('UserProfile', { userId: userItem.id });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7B9F8C" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>PlayNow</Text>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar 
            placeholder="Search sports, players, games..."
            onChangeText={(text) => {
              // TODO: Implement search functionality
              console.log('Search:', text);
            }}
          />
        </View>

        {/* Recently Played Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recently Played</Text>
          
          {recentlyPlayed.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.horizontalList}>
                {recentlyPlayed.map((userItem) => (
                  <RecentlyPlayedCard 
                    key={userItem.id} 
                    user={userItem}
                    onPress={() => handleUserPress(userItem)}
                  />
                ))}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Match with people to see them here!</Text>
            </View>
          )}
        </View>

        {/* Discover Games Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Discover Games</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Play')}>
              <Text style={styles.seeAll}>See all ›</Text>
            </TouchableOpacity>
          </View>
          
          {games.length > 0 ? (
            <View>
              {games.map((game) => (
                <GameCard 
                  key={game.id} 
                  game={game}
                  onPress={() => handleGamePress(game)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No games available nearby</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => navigation.navigate('Calendar')}
              >
                <Ionicons name="add" size={24} color="#7B9F8C" />
                <Text style={styles.addButtonText}>Create Game</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Blogs/Guides Section */}
        {articles.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Blogs / Guides</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all ›</Text>
              </TouchableOpacity>
            </View>
            
            {articles.map((article) => (
              <ArticleCard 
                key={article.id} 
                article={article}
                onPress={() => handleArticlePress(article)}
              />
            ))}
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
    fontSize: 16,
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    color: '#7B9F8C',
    fontWeight: '500',
  },
  horizontalList: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
  },
  recentlyPlayedCard: {
    alignItems: 'center',
    width: 70,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentlyPlayedName: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  addButtonText: {
    color: '#7B9F8C',
    fontSize: 16,
    fontWeight: '600',
  },
  gameCard: {
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  gameType: {
    fontSize: 12,
    color: '#7B9F8C',
    textTransform: 'capitalize',
  },
  fullBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  fullText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  playersRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  playerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  gameInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  gameLocation: {
    fontSize: 13,
    color: '#666666',
  },
  gameTime: {
    fontSize: 13,
    color: '#666666',
  },
  articleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  articleInfo: {
    fontSize: 12,
    color: '#666666',
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

export default HomeScreen;