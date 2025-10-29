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
        const participantName = conv.userName || '';
        const lastMessageContent = conv.lastMessage?.content || conv.lastMessageContent || '';
        
        // Search in participant name or last message
        return (
          participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lastMessageContent.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchQuery, conversations]);

  const fetchConversations = async () => {
    try {
      setError(null);
      
      // Try to fetch from API
      const data = await messageService.getConversations();
      const apiConversations = data.conversations || [];
      
      // Transform API conversations to include necessary fields
      const transformedConversations = apiConversations.map(conv => {
        // Get other participant info for direct chats
        const otherParticipant = conv.participants?.find(p => p.userId !== user?.id);
        
        return {
          ...conv,
          // Ensure consistent structure
          userName: otherParticipant?.user?.fullName || otherParticipant?.user?.username || 'Unknown',
          color: otherParticipant?.user?.avatarColor || '#666666',
          avatarUrl: otherParticipant?.user?.avatarUrl,
          timestamp: formatTimestamp(conv.lastMessageAt || conv.lastMessage?.createdAt),
          lastMessageContent: conv.lastMessage?.content || 'No messages yet',
        };
      });
      
      setConversations(transformedConversations);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err.error || 'Failed to load conversations');
      
      // Show empty state instead of mock data
      setConversations([]);
      
      // Show alert if it's not a network/auth error
      if (!err.message?.includes('Network') && !err.error?.includes('token')) {
        Alert.alert('Error', 'Could not load conversations.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
    const userName = conversation.userName || 'Chat';
    const avatarColor = conversation.color || '#666666';
    const avatarUrl = conversation.avatarUrl || null;
    
    navigation.navigate('Chat', {
      conversationId: conversation.id,
      userName,
      avatarColor,
      avatarUrl,
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

    // Note: Backend should have an endpoint to update lastReadAt
    // For now, marking as read is handled locally
    // Future: Add messageService.markAsRead(conversationId) when backend endpoint is ready
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
            currentUserId={user?.id}
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
            currentUserId={user?.id}
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