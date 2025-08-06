// src/hooks/useMessages.js
import { useState, useEffect, useCallback } from 'react';
import { messageService } from '../services/messageService';
import { socketService } from '../services/socketService';
import { useAuth } from './useAuth';

export const useMessages = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const [error, setError] = useState(null);
  
  const { user } = useAuth(); // Get current user for message operations

  useEffect(() => {
    if (conversationId && user) {
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
  }, [conversationId, user]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await messageService.getMessages(conversationId);
      setMessages(data.messages || []);
      setHasMore(data.hasMore || false);
    } catch (error) {
      console.error('Error loading messages:', error);
      setError(error.error || 'Failed to load messages');
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
      
      setMessages(prevMessages => [...(data.messages || []), ...prevMessages]);
      setHasMore(data.hasMore || false);
    } catch (error) {
      console.error('Error loading more messages:', error);
      setError(error.error || 'Failed to load more messages');
    }
  };

  const sendMessage = async (content, messageType = 'text', metadata = {}) => {
    if (!user || !conversationId) {
      throw new Error('User or conversation not available');
    }

    try {
      // Create optimistic update with current user info
      const tempMessage = {
        id: `temp-${Date.now()}`,
        content,
        messageType,
        metadata,
        senderId: user.id,
        sender: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          avatarColor: user.avatarColor,
          avatarUrl: user.avatarUrl
        },
        createdAt: new Date().toISOString(),
        isTemp: true
      };
      
      // Add temp message to UI immediately
      setMessages(prev => [...prev, tempMessage]);

      // Send via API
      const sentMessage = await messageService.sendMessage(
        conversationId,
        content,
        messageType,
        { ...metadata, userId: user.id }
      );

      // Replace temp message with real one
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id ? sentMessage : msg
        )
      );

      // Emit via socket for real-time delivery to other users
      socketService.sendMessage({
        conversationId,
        message: sentMessage
      });

      return sentMessage;
    } catch (error) {
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => !msg.isTemp));
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await messageService.deleteMessage(messageId);
      
      // Remove message from local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
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

  const handleNewMessage = useCallback((data) => {
    if (data.conversationId === conversationId && data.message) {
      setMessages(prev => {
        // Avoid duplicates - check if message already exists
        const exists = prev.some(msg => msg.id === data.message.id);
        if (exists) return prev;
        
        // Don't add if it's from current user (already added optimistically)
        if (data.message.senderId === user?.id) return prev;
        
        return [...prev, data.message];
      });
    }
  }, [conversationId, user?.id]);

  const handleUserTyping = useCallback(({ userId, conversationId: convId }) => {
    if (convId === conversationId && userId !== user?.id) {
      setTypingUsers(prev => {
        if (!prev.includes(userId)) {
          return [...prev, userId];
        }
        return prev;
      });
    }
  }, [conversationId, user?.id]);

  const handleUserStoppedTyping = useCallback(({ userId, conversationId: convId }) => {
    if (convId === conversationId) {
      setTypingUsers(prev => prev.filter(id => id !== userId));
    }
  }, [conversationId]);

  const startTyping = useCallback(() => {
    if (conversationId && user?.id) {
      socketService.startTyping(conversationId, user.id);
    }
  }, [conversationId, user?.id]);

  const stopTyping = useCallback(() => {
    if (conversationId && user?.id) {
      socketService.stopTyping(conversationId, user.id);
    }
  }, [conversationId, user?.id]);

  return {
    messages,
    loading,
    hasMore,
    typingUsers,
    error,
    sendMessage,
    deleteMessage,
    loadMoreMessages,
    refresh: loadMessages,
    startTyping,
    stopTyping
  };
};