// src/components/messages/PinnedConversations.js
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const PinnedConversations = ({ conversations, onPress, currentUserId }) => {
  if (!conversations || conversations.length === 0) {
    return null;
  }

  const getAvatarColor = (conversation) => {
    // Handle both data structures:
    // 1. Simple structure with direct 'color' property
    if (conversation.color) {
      return conversation.color;
    }
    
    // 2. API structure with participants array
    if (conversation.participants && currentUserId) {
      const otherParticipant = conversation.participants.find(
        p => p.userId !== currentUserId
      );
      return otherParticipant?.user?.avatarColor || '#666666';
    }
    
    // Fallback
    return '#666666';
  };

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {conversations.map((conversation) => (
        <TouchableOpacity
          key={conversation.id}
          style={styles.pinnedItem}
          onPress={() => onPress(conversation)}
        >
          <View 
            style={[
              styles.avatar, 
              { backgroundColor: getAvatarColor(conversation) }
            ]}
          >
            <Ionicons name="person-outline" size={30} color="#000000" />
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 12,
  },
  pinnedItem: {
    marginRight: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PinnedConversations;