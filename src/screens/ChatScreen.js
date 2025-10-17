// src/screens/ChatScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useRef, useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MessageBubble from '../components/messages/MessageBubble';
import { useAuth } from '../hooks/useAuth';
import { useMessages } from '../hooks/useMessages';
import * as Haptics from 'expo-haptics';

const ChatScreen = ({ route, navigation }) => {
  const { conversationId, userName, avatarColor } = route.params;
  const { user } = useAuth();
  const { 
    messages, 
    loading, 
    sendMessage, 
    startTyping, 
    stopTyping,
    typingUsers,
    loadMoreMessages,
    hasMore 
  } = useMessages(conversationId);

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Configure header
  useEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#000000',
      },
      headerTintColor: '#FFFFFF',
      headerTitle: () => (
        <View style={styles.headerTitleContainer}>
          <View style={[styles.headerAvatar, { backgroundColor: avatarColor || '#666666' }]}>
            <Ionicons name="person-outline" size={20} color="#000000" />
          </View>
          <Text style={styles.headerTitle}>{userName}</Text>
        </View>
      ),
      headerRight: () => (
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleMoreOptions}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, userName, avatarColor]);

  const handleMoreOptions = () => {
    // Show options menu (block, mute, etc.)
    Alert.alert(
      'Chat Options',
      'Choose an option',
      [
        { text: 'Mute', onPress: () => console.log('Mute') },
        { text: 'Block', onPress: () => console.log('Block'), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleSend = async () => {
    const messageText = inputText.trim();
    if (!messageText || isSending) return;

    try {
      setIsSending(true);
      setInputText(''); // Clear input immediately for better UX
      
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Stop typing indicator
      stopTyping();

      // Send message
      await sendMessage(messageText);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);

    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message text on error
      setInputText(messageText);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (text) => {
    setInputText(text);

    // Handle typing indicators
    if (text.length > 0) {
      startTyping();

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, 2000);
    } else {
      stopTyping();
    }
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      await loadMoreMessages();
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const renderMessage = useCallback(({ item }) => (
    <MessageBubble 
      message={item} 
      isCurrentUser={item.senderId === user?.id}
      avatarColor={avatarColor}
    />
  ), [user?.id, avatarColor]);

  const renderHeader = () => {
    if (!isLoadingMore) return null;
    
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color="#7B9F8C" />
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;

    return (
      <View style={styles.typingContainer}>
        <View style={[styles.typingAvatar, { backgroundColor: avatarColor || '#666666' }]}>
          <Ionicons name="person-outline" size={16} color="#000000" />
        </View>
        <View style={styles.typingBubble}>
          <View style={styles.typingDots}>
            <View style={[styles.typingDot, styles.typingDot1]} />
            <View style={[styles.typingDot, styles.typingDot2]} />
            <View style={[styles.typingDot, styles.typingDot3]} />
          </View>
        </View>
      </View>
    );
  };

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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id?.toString() || `temp-${item.createdAt}`}
          contentContainerStyle={styles.messagesList}
          inverted
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-ellipses-outline" size={64} color="#666666" />
              <Text style={styles.emptyStateText}>No messages yet</Text>
              <Text style={styles.emptyStateSubtext}>Send a message to start the conversation</Text>
            </View>
          }
        />

        {/* Typing Indicator */}
        {renderTypingIndicator()}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add-circle-outline" size={28} color="#7B9F8C" />
          </TouchableOpacity>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Message..."
              placeholderTextColor="#666666"
              value={inputText}
              onChangeText={handleInputChange}
              multiline
              maxLength={1000}
              editable={!isSending}
            />
          </View>

          <TouchableOpacity 
            style={[
              styles.sendButton,
              (!inputText.trim() || isSending) && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons 
                name="send" 
                size={20} 
                color={inputText.trim() ? '#FFFFFF' : '#666666'} 
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardView: {
    flex: 1,
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 100,
    transform: [{ scaleY: -1 }], // Flip back since list is inverted
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
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  typingBubble: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666666',
    marginHorizontal: 2,
  },
  typingDot1: {
    animation: 'typing 1.4s infinite',
  },
  typingDot2: {
    animation: 'typing 1.4s infinite 0.2s',
  },
  typingDot3: {
    animation: 'typing 1.4s infinite 0.4s',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  attachButton: {
    padding: 8,
    marginBottom: 4,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 8,
    maxHeight: 100,
  },
  input: {
    color: '#FFFFFF',
    fontSize: 16,
    maxHeight: 80,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7B9F8C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#1A1A1A',
  },
});

export default ChatScreen;