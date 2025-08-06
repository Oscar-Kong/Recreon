import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MessageBubble from '../../components/messages/MessageBubble';
import { useAuth } from '../../hooks/useAuth';
import { useMessages } from '../../hooks/useMessages';

const ChatScreen = ({ route }) => {
  const { conversationId } = route.params;
  const { user } = useAuth();
  const { messages, sendMessage, loading } = useMessages(conversationId);

  const renderMessage = ({ item }) => (
    <MessageBubble 
      message={item} 
      isCurrentUser={item.senderId === user?.id} 
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        style={styles.messagesList}
        inverted
      />
      {/* Add TextInput for sending messages */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default ChatScreen;