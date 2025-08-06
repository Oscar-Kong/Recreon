// ===================================
// src/components/messages/PinnedConversations.js
// ===================================
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const PinnedConversations = ({ conversations, onPress }) => {
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
          <View style={[styles.avatar, { backgroundColor: conversation.color }]}>
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
  },
  pinnedItem: {
    marginRight: 15,
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

