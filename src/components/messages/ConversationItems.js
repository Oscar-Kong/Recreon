// ===================================
// src/components/messages/ConversationItem.js
// ===================================
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ConversationItem = ({ conversation, onPress }) => {
  const hasUnread = conversation.unreadCount > 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.avatar, { backgroundColor: conversation.color }]}>
        <Ionicons name="person-outline" size={30} color="#000000" />
      </View>
      
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.userName}>{conversation.userName}</Text>
          <Text style={[styles.timestamp, hasUnread && styles.unreadTimestamp]}>
            {conversation.timestamp}
          </Text>
        </View>
        
        <View style={styles.bottomRow}>
          <Text 
            style={[styles.lastMessage, hasUnread && styles.unreadMessage]} 
            numberOfLines={1}
          >
            {conversation.lastMessage}
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