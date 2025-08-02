// src/screens/MessagesScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../components/common/SearchBar';
import ConversationItem from '../components/messages/ConversationItem';
import PinnedConversations from '../components/messages/PinnedConversations';

const MessagesScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [pinnedConversations, setPinnedConversations] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);

  useEffect(() => {
    // Fetch conversations data
    fetchConversations();
  }, []);

  useEffect(() => {
    // Filter conversations based on search query
    if (searchQuery) {
      const filtered = conversations.filter(conv => 
        conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchQuery, conversations]);

  const fetchConversations = async () => {
    // Mock data - replace with actual API call
    const mockPinnedConversations = [
      { id: '1', userId: 'u1', userName: 'Ryan Choi', color: '#FFFFFF', isPinned: true },
      { id: '2', userId: 'u2', userName: 'Ryan Choi', color: '#DC2626', isPinned: true },
      { id: '3', userId: 'u3', userName: 'Ryan Choi', color: '#D97706', isPinned: true },
      { id: '4', userId: 'u4', userName: 'Ryan Choi', color: '#059669', isPinned: true },
    ];

    const mockConversations = [
      {
        id: '5',
        userId: 'u5',
        userName: 'Ryan Choi',
        lastMessage: 'Hey, are you coming to practice?',
        timestamp: 'now',
        unreadCount: 1,
        color: '#FFFFFF',
      },
      {
        id: '6',
        userId: 'u6',
        userName: 'Ryan Choi',
        lastMessage: 'Great game today!',
        timestamp: '5 min ago',
        unreadCount: 0,
        color: '#DC2626',
      },
      {
        id: '7',
        userId: 'u7',
        userName: 'Ryan Choi',
        lastMessage: 'See you at the court',
        timestamp: 'now',
        unreadCount: 1,
        color: '#D97706',
      },
      {
        id: '8',
        userId: 'u8',
        userName: 'Ryan Choi',
        lastMessage: 'Thanks for the tips!',
        timestamp: 'now',
        unreadCount: 1,
        color: '#059669',
      },
      {
        id: '9',
        userId: 'u9',
        userName: 'Ryan Choi',
        lastMessage: 'What time tomorrow?',
        timestamp: '5 min ago',
        unreadCount: 0,
        color: '#FFFFFF',
      },
      {
        id: '10',
        userId: 'u10',
        userName: 'Ryan Choi',
        lastMessage: 'Good luck!',
        timestamp: 'now',
        unreadCount: 1,
        color: '#DC2626',
      },
    ];

    setPinnedConversations(mockPinnedConversations);
    setConversations(mockConversations);
    setFilteredConversations(mockConversations);
  };

  const handleConversationPress = (conversation) => {
    navigation.navigate('Conversation', {
      conversationId: conversation.id,
      userName: conversation.userName,
    });
  };

  const handleComposePress = () => {
    navigation.navigate('NewMessage');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity onPress={handleComposePress}>
          <Ionicons name="create-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Search"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Pinned Conversations */}
      {pinnedConversations.length > 0 && (
        <View style={styles.pinnedSection}>
          <Text style={styles.sectionTitle}>Pinned</Text>
          <PinnedConversations 
            conversations={pinnedConversations}
            onPress={handleConversationPress}
          />
        </View>
      )}

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationItem
            conversation={item}
            onPress={() => handleConversationPress(item)}
          />
        )}
        contentContainerStyle={styles.conversationsList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  pinnedSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  conversationsList: {
    paddingHorizontal: 20,
  },
});

export default MessagesScreen;

