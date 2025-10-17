// src/components/messages/MessageBubble.js
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MessageBubble = ({ message, isCurrentUser, avatarColor }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <View style={[
      styles.container,
      isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer
    ]}>
      {/* Show avatar for other user */}
      {!isCurrentUser && (
        <View style={[styles.avatar, { backgroundColor: avatarColor || '#666666' }]}>
          <Ionicons name="person-outline" size={16} color="#000000" />
        </View>
      )}

      {/* Message Bubble */}
      <View style={[
        styles.bubble,
        isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
      ]}>
        <Text style={[
          styles.messageText,
          isCurrentUser ? styles.currentUserText : styles.otherUserText
        ]}>
          {message.content}
        </Text>
        
        <View style={styles.metaContainer}>
          <Text style={[
            styles.timestamp,
            isCurrentUser ? styles.currentUserTimestamp : styles.otherUserTimestamp
          ]}>
            {formatTime(message.createdAt)}
          </Text>
          
          {/* Show delivery status for current user */}
          {isCurrentUser && !message.isTemp && (
            <Ionicons 
              name="checkmark-done" 
              size={14} 
              color="rgba(255, 255, 255, 0.7)"
              style={styles.checkmark}
            />
          )}
          
          {/* Show sending indicator for temp messages */}
          {message.isTemp && (
            <Ionicons 
              name="time-outline" 
              size={14} 
              color="rgba(255, 255, 255, 0.5)"
              style={styles.checkmark}
            />
          )}
        </View>
      </View>

      {/* Spacer for alignment */}
      {isCurrentUser && <View style={styles.avatarSpacer} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 4,
    alignItems: 'flex-end',
  },
  currentUserContainer: {
    justifyContent: 'flex-end',
  },
  otherUserContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 2,
  },
  avatarSpacer: {
    width: 36,
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  currentUserBubble: {
    backgroundColor: '#7B9F8C',
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: '#1A1A1A',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  currentUserText: {
    color: '#FFFFFF',
  },
  otherUserText: {
    color: '#FFFFFF',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 2,
  },
  currentUserTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherUserTimestamp: {
    color: '#666666',
  },
  checkmark: {
    marginLeft: 4,
  },
});

export default MessageBubble;