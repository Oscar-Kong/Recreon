// src/screens/HomeScreen.js
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import your SearchBar component
import SearchBar from '../components/common/SearchBar';

// Keep the other inline components for now
const RecentlyPlayedCard = ({ user }) => (
  <TouchableOpacity style={styles.recentlyPlayedCard}>
    <View style={[styles.avatar, { backgroundColor: user.color }]}>
      <Ionicons name="person-outline" size={30} color="#000000" />
    </View>
  </TouchableOpacity>
);

const GameCard = ({ game }) => (
  <TouchableOpacity style={styles.gameCard}>
    <View style={styles.gameHeader}>
      <View>
        <Text style={styles.gameTitle}>{game.title}</Text>
        <Text style={styles.gameType}>{game.type}</Text>
      </View>
      {game.isFull && (
        <View style={styles.fullBadge}>
          <Text style={styles.fullText}>FULL</Text>
        </View>
      )}
    </View>
    <View style={styles.playersRow}>
      {[...Array(game.maxPlayers)].map((_, i) => (
        <View 
          key={i}
          style={[
            styles.playerDot,
            { backgroundColor: i < game.players.length ? '#FFFFFF' : '#333333' }
          ]}
        />
      ))}
    </View>
    <Text style={styles.gameLocation}>{game.location}</Text>
    <Text style={styles.gameRank}>Ranks: {game.rank}</Text>
  </TouchableOpacity>
);

const ArticleCard = ({ article }) => (
  <TouchableOpacity style={styles.articleCard}>
    <View>
      <Text style={styles.articleTitle}>{article.title}</Text>
      <Text style={styles.articleInfo}>{article.sport} • {article.readTime} min</Text>
    </View>
    <View style={[styles.levelBadge, { backgroundColor: article.level === 'BEGINNER' ? '#059669' : '#D97706' }]}>
      <Text style={styles.levelText}>{article.level}</Text>
    </View>
  </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [district, setDistrict] = useState('Loading...');
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [games, setGames] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);

  useEffect(() => {
    getLocationAndDistrict();
    fetchHomeData();
  }, []);

  const getLocationAndDistrict = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setDistrict('Location access denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);

      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      setDistrict(address.district || address.city || 'San Jose');
    } catch (error) {
      console.error('Location error:', error);
      setDistrict('San Jose'); // Default
    }
  };

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with API calls
      setRecentlyPlayed([
        { id: '1', name: 'Ryan Choi', color: '#FFFFFF' },
        { id: '2', name: 'Ryan Choi', color: '#DC2626' },
        { id: '3', name: 'Ryan Choi', color: '#D97706' },
        { id: '4', name: 'Ryan Choi', color: '#059669' },
      ]);

      setGames([
        {
          id: '1',
          title: 'Tennis',
          type: 'Doubles',
          players: [1, 2, 3, 4],
          maxPlayers: 4,
          location: '1234 Awesome Rd 09876',
          rank: 'Intermediate',
          isFull: true,
        },
        {
          id: '2',
          title: 'Tennis',
          type: 'Singles',
          players: [1],
          maxPlayers: 2,
          location: '1234 Awesome Rd 09876',
          rank: 'Beginner',
          isFull: false,
        },
      ]);

      setArticles([
        {
          id: '1',
          title: 'Overhead Guide',
          sport: 'Tennis',
          readTime: 4,
          level: 'BEGINNER',
        },
        {
          id: '2',
          title: 'Serve Technique',
          sport: 'Tennis',
          readTime: 6,
          level: 'INTERMEDIATE',
        },
      ]);

      setHasNotifications(true);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHomeData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7B9F8C" />
      </View>
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
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
            {hasNotifications && <View style={styles.notificationDot} />}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar placeholder="Search" />
        </View>

        {/* Recently Played Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Played</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all ›</Text>
            </TouchableOpacity>
          </View>
          
          {recentlyPlayed.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.horizontalList}>
                {recentlyPlayed.map((user) => (
                  <RecentlyPlayedCard key={user.id} user={user} />
                ))}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Match with people!</Text>
            </View>
          )}
        </View>

        {/* Discover Games Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Discover Games</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all ›</Text>
            </TouchableOpacity>
          </View>
          
          {games.length > 0 ? (
            <View>
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Create a new game</Text>
              <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={24} color="#7B9F8C" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Blogs/Guides Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Blogs / Guides</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all ›</Text>
            </TouchableOpacity>
          </View>
          
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
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
  appName: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  notificationButton: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A5F52',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchPlaceholder: {
    color: '#999999',
    marginLeft: 10,
    fontSize: 16,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  seeAll: {
    color: '#666666',
    fontSize: 14,
  },
  horizontalList: {
    flexDirection: 'row',
    paddingLeft: 20,
  },
  recentlyPlayedCard: {
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gameTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  gameType: {
    color: '#666666',
    fontSize: 14,
  },
  fullBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  fullText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  playersRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  playerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  gameLocation: {
    color: '#999999',
    fontSize: 14,
    marginBottom: 5,
  },
  gameRank: {
    color: '#666666',
    fontSize: 14,
  },
  articleCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  articleTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  articleInfo: {
    color: '#666666',
    fontSize: 14,
  },
  levelBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    color: '#666666',
    fontSize: 16,
    marginBottom: 15,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7B9F8C',
  },
});

export default HomeScreen;