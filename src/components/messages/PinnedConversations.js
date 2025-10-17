// src/components/messages/PinnedConversations.js
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const PinnedConversations = ({ conversations, currentUserId, onPress }) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {conversations.map((conversation) => {
        const otherParticipant = conversation.participants.find(p => p.userId !== currentUserId);
        const avatarColor = otherParticipant?.user?.avatarColor || conversation.avatarColor || '#666666';

        return (
          <TouchableOpacity
            key={conversation.id}
            style={[styles.pinnedItem, { backgroundColor: avatarColor }]}
            onPress={() => onPress(conversation)}
          >
            <Ionicons name="person-outline" size={28} color="#000000" />
            {conversation.unreadCount > 0 && (
              <View style={styles.unreadDot} />
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 12,
  },
  pinnedItem: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#DC2626',
    borderWidth: 2,
    borderColor: '#000000',
  },
});

export default PinnedConversations;