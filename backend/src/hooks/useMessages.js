import { useState, useEffect, useCallback } from 'react';
import { messageService } from '../services/messageService';
import socketService from '../services/socketService';

export const useMessages = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
      setupSocketListeners();
      socketService.joinConversation(conversationId);
    }

    return () => {
      if (conversationId) {
        socketService.leaveConversation(conversationId);
        cleanupSocketListeners();
      }
    };
  }, [conversationId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await messageService.getMessages(conversationId);
      setMessages(data.messages);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!hasMore || messages.length === 0) return;

    try {
      const oldestMessage = messages[0];
      const data = await messageService.getMessages(
        conversationId, 
        50, 
        oldestMessage.createdAt
      );
      setMessages([...data.messages, ...messages]);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Error loading more messages:', error);
    }
  };

  const sendMessage = async (content, messageType = 'text', metadata = {}) => {
    try {
      // Optimistic update
      const tempMessage = {
        id: `temp-${Date.now()}`,
        content,
        messageType,
        metadata,
        senderId: metadata.userId, // You'll need to pass this
        createdAt: new Date().toISOString(),
        isTemp: true
      };
      
      setMessages(prev => [...prev, tempMessage]);

      // Send via API
      const sentMessage = await messageService.sendMessage(
        conversationId,
        content,
        messageType,
        metadata
      );

      // Replace temp message with real one
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id ? sentMessage : msg
        )
      );

      // Emit via socket for real-time delivery
      socketService.sendMessage({
        conversationId,
        message: sentMessage
      });

      return sentMessage;
    } catch (error) {
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => !msg.isTemp));
      throw error;
    }
  };

  const setupSocketListeners = () => {
    socketService.on('new_message', handleNewMessage);
    socketService.on('user_typing', handleUserTyping);
    socketService.on('user_stopped_typing', handleUserStoppedTyping);
  };

  const cleanupSocketListeners = () => {
    socketService.off('new_message', handleNewMessage);
    socketService.off('user_typing', handleUserTyping);
    socketService.off('user_stopped_typing', handleUserStoppedTyping);
  };

  const handleNewMessage = (data) => {
    if (data.conversationId === conversationId) {
      setMessages(prev => {
        // Avoid duplicates
        const exists = prev.some(msg => msg.id === data.message.id);
        if (exists) return prev;
        return [...prev, data.message];
      });
    }
  };

  const handleUserTyping = ({ userId, conversationId: convId }) => {
    if (convId === conversationId) {
      setTypingUsers(prev => {
        if (!prev.includes(userId)) {
          return [...prev, userId];
        }
        return prev;
      });
    }
  };

  const handleUserStoppedTyping = ({ userId, conversationId: convId }) => {
    if (convId === conversationId) {
      setTypingUsers(prev => prev.filter(id => id !== userId));
    }
  };

  return {
    messages,
    loading,
    hasMore,
    typingUsers,
    sendMessage,
    loadMoreMessages,
    refresh: loadMessages
  };
};