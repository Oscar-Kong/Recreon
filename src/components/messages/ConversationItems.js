// src/components/messages/ConversationItems.js
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ConversationItem = ({ conversation, currentUserId, onPress, onLongPress }) => {
  const hasUnread = conversation.unreadCount > 0;

  // Get display data - handle both mock and API data structures
  const getDisplayData = () => {
    let displayName = 'Unknown User';
    let avatarColor = '#666666';

    // Try to get from API structure (with participants array)
    if (conversation.participants && currentUserId) {
      const otherParticipant = conversation.participants.find(
        p => p.userId !== currentUserId
      );
      
      if (otherParticipant?.user) {
        displayName = otherParticipant.user.fullName || 
                      otherParticipant.user.username || 
                      displayName;
        avatarColor = otherParticipant.user.avatarColor || avatarColor;
      }
    }
    
    // Fallback to mock data structure (simple properties)
    if (conversation.userName) {
      displayName = conversation.userName;
    }
    if (conversation.color) {
      avatarColor = conversation.color;
    }

    return { displayName, avatarColor };
  };

  const { displayName, avatarColor } = getDisplayData();

  // Get last message text
  const getLastMessage = () => {
    // API format: message object with content property
    if (conversation.lastMessage?.content) {
      return conversation.lastMessage.content;
    }
    // Mock format: simple string
    if (typeof conversation.lastMessage === 'string') {
      return conversation.lastMessage;
    }
    return 'No messages yet';
  };

  const lastMessageText = getLastMessage();

  // Get timestamp
  const getTimestamp = () => {
    if (conversation.timestamp) {
      return conversation.timestamp;
    }
    if (conversation.lastMessageAt) {
      // Format the date/time if needed
      return 'now'; // You can add proper date formatting here
    }
    return '';
  };

  const timestampText = getTimestamp();

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Ionicons name="person-outline" size={30} color="#000000" />
      </View>
      
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.userName}>{displayName}</Text>
          {timestampText && (
            <Text style={[styles.timestamp, hasUnread && styles.unreadTimestamp]}>
              {timestampText}
            </Text>
          )}
        </View>
        
        <View style={styles.bottomRow}>
          <Text 
            style={[styles.lastMessage, hasUnread && styles.unreadMessage]} 
            numberOfLines={1}
          >
            {lastMessageText}
          </Text>
          {hasUnread && (
            <View style={styles.unreadDot} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 12,
    color: '#666666',
  },
  unreadTimestamp: {
    color: '#FFFFFF',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
    marginRight: 10,
  },
  unreadMessage: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});

export default ConversationItem;