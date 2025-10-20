// src/screens/MessagesScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import SearchBar from '../components/common/SearchBar';
import ConversationItems from '../components/messages/ConversationItems';
import PinnedConversations from '../components/messages/PinnedConversations';
import { messageService } from '../services/messageService';
import { socketService } from '../services/socketService';
import { useAuth } from '../hooks/useAuth';

const MessagesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch conversations when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchConversations();
      
      // Connect to socket if not already connected
      if (!socketService.isConnected) {
        socketService.connect();
      }

      // Setup real-time listeners
      setupSocketListeners();

      return () => {
        cleanupSocketListeners();
      };
    }, [user?.id])
  );

  // Filter conversations based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = conversations.filter(conv => {
        // Get other participant's name (for direct chats)
        const otherParticipant = conv.participants?.find(p => p.userId !== user?.id);
        const participantName = otherParticipant?.user?.fullName || 
                                otherParticipant?.user?.username || 
                                conv.userName || '';
        
        // Search in participant name or last message
        return (
          participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchQuery, conversations, user?.id]);

  const fetchConversations = async () => {
    try {
      setError(null);
      
      // Try to fetch from API first
      const data = await messageService.getConversations();
      const apiConversations = data.conversations || [];
      
      // If API returns conversations, use them
      if (apiConversations.length > 0) {
        setConversations(apiConversations);
      } else {
        // Fallback to mock data for development/testing
        setConversations(getMockConversations());
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err.error || 'Failed to load conversations');
      
      // Use mock data as fallback
      setConversations(getMockConversations());
      
      // Only show alert if it's not a network error
      if (!err.message?.includes('Network')) {
        Alert.alert('Error', 'Could not load conversations. Showing demo data.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getMockConversations = () => {
    return [
      {
        id: '1',
        userId: 'u1',
        userName: 'Ryan Choi',
        lastMessage: 'Hey, are you coming to practice?',
        timestamp: 'now',
        unreadCount: 1,
        color: '#FFFFFF',
        isPinned: true
      },
      {
        id: '2',
        userId: 'u2',
        userName: 'Sarah Johnson',
        lastMessage: 'Great game today!',
        timestamp: '5 min ago',
        unreadCount: 0,
        color: '#DC2626',
        isPinned: true
      },
      {
        id: '3',
        userId: 'u3',
        userName: 'Mike Davis',
        lastMessage: 'See you at the court',
        timestamp: '10 min ago',
        unreadCount: 2,
        color: '#D97706',
        isPinned: false
      },
      {
        id: '4',
        userId: 'u4',
        userName: 'Emma Wilson',
        lastMessage: 'Thanks for the tips!',
        timestamp: '1 hour ago',
        unreadCount: 0,
        color: '#059669',
        isPinned: false
      },
      {
        id: '5',
        userId: 'u5',
        userName: 'Alex Thompson',
        lastMessage: 'What time tomorrow?',
        timestamp: '2 hours ago',
        unreadCount: 0,
        color: '#3B82F6',
        isPinned: false
      },
    ];
  };

  const setupSocketListeners = () => {
    // Listen for new messages in any conversation
    socketService.on('new_message', handleNewMessage);
    
    // Listen for conversation updates
    socketService.on('conversation_updated', handleConversationUpdate);
  };

  const cleanupSocketListeners = () => {
    socketService.off('new_message', handleNewMessage);
    socketService.off('conversation_updated', handleConversationUpdate);
  };

  const handleNewMessage = useCallback((data) => {
    const { conversationId, message } = data;
    
    // Update conversation with new message
    setConversations(prev => {
      const updated = prev.map(conv => {
        if (conv.id === conversationId) {
          // Only increment unread if message is from someone else
          if (message.senderId !== user?.id) {
            return {
              ...conv,
              lastMessage: message.content || message,
              lastMessageAt: message.createdAt || new Date().toISOString(),
              timestamp: 'now',
              unreadCount: (conv.unreadCount || 0) + 1
            };
          }
          // Update last message even if it's from current user
          return {
            ...conv,
            lastMessage: message.content || message,
            lastMessageAt: message.createdAt || new Date().toISOString(),
            timestamp: 'now'
          };
        }
        return conv;
      });

      // Sort by last message time (most recent first)
      return updated.sort((a, b) => 
        new Date(b.lastMessageAt || b.timestamp) - new Date(a.lastMessageAt || a.timestamp)
      );
    });
  }, [user?.id]);

  const handleConversationUpdate = useCallback(() => {
    // Refresh conversations when there's an update
    fetchConversations();
  }, []);

  const handleConversationPress = (conversation) => {
    // Handle both data structures: API format and mock format
    let userName = 'Chat';
    let avatarColor = '#666666';

    // Try to get data from API structure first (with participants)
    if (conversation.participants && user?.id) {
      const otherParticipant = conversation.participants.find(p => p.userId !== user.id);
      if (otherParticipant) {
        userName = otherParticipant.user?.fullName || otherParticipant.user?.username || userName;
        avatarColor = otherParticipant.user?.avatarColor || avatarColor;
      }
    }
    
    // Fallback to mock data structure (simple properties)
    if (!conversation.participants) {
      userName = conversation.userName || userName;
      avatarColor = conversation.color || avatarColor;
    }
    
    navigation.navigate('Chat', {
      conversationId: conversation.id,
      userName,
      avatarColor,
    });

    // Mark conversation as read when opening
    markAsRead(conversation.id);
  };

  const markAsRead = async (conversationId) => {
    // Update locally immediately for instant UI feedback
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );

    // TODO: Add API call here to update lastReadAt timestamp on the server
    // This would typically be:
    // try {
    //   await messageService.markAsRead(conversationId);
    // } catch (err) {
    //   console.error('Error marking as read:', err);
    // }
  };

  const handleComposePress = () => {
    // Navigate to new message screen
    // You'll need to create this screen
    navigation.navigate('NewMessage');
  };

  const handleTogglePin = async (conversationId) => {
    try {
      const isPinned = await messageService.togglePin(conversationId);
      
      // Update local state
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, isPinned }
            : conv
        )
      );
    } catch (err) {
      console.error('Error toggling pin:', err);
      Alert.alert('Error', 'Could not update pin status');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  // Separate pinned and unpinned conversations
  const pinnedConversations = filteredConversations.filter(c => c.isPinned);
  const unpinnedConversations = filteredConversations.filter(c => !c.isPinned);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7B9F8C" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity onPress={handleComposePress}>
          <Ionicons name="create-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Search"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Pinned Conversations */}
      {pinnedConversations.length > 0 && (
        <View style={styles.pinnedSection}>
          <Text style={styles.sectionTitle}>Pinned</Text>
          <PinnedConversations 
            conversations={pinnedConversations}
            onPress={handleConversationPress}
          />
        </View>
      )}

      {/* Conversations List */}
      <FlatList
        data={unpinnedConversations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ConversationItems
            conversation={item}
            onPress={() => handleConversationPress(item)}
            onLongPress={() => handleTogglePin(item.id)}
          />
        )}
        contentContainerStyle={styles.conversationsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7B9F8C"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color="#666666" />
            <Text style={styles.emptyStateText}>No conversations yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Start a new conversation to get started
            </Text>
          </View>
        }
      />
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  pinnedSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  conversationsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyStateText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyStateSubtext: {
    color: '#666666',
    fontSize: 14,
    marginTop: 8,
  },
});

export default MessagesScreen;