// src/components/common/LoadingSkeleton.js
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

/**
 * Loading Skeleton Component
 * 
 * Provides skeleton loading animations for better perceived performance.
 * Shows placeholder UI while content is loading.
 */

// Base Skeleton Component
export const Skeleton = ({ width, height, borderRadius = 8, style }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Event Card Skeleton
export const EventCardSkeleton = () => (
  <View style={styles.eventCard}>
    <View style={styles.eventCardHeader}>
      <View>
        <Skeleton width={150} height={20} style={styles.mb8} />
        <Skeleton width={80} height={14} />
      </View>
      <Skeleton width={50} height={24} borderRadius={6} />
    </View>
    
    <View style={styles.playerDots}>
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} width={8} height={8} borderRadius={4} />
      ))}
    </View>
    
    <Skeleton width={120} height={14} style={styles.mb8} />
    <Skeleton width={100} height={14} />
  </View>
);

// User Card Skeleton
export const UserCardSkeleton = () => (
  <View style={styles.userCard}>
    <Skeleton width={60} height={60} borderRadius={30} style={styles.mb8} />
    <Skeleton width={70} height={12} />
  </View>
);

// Message Item Skeleton
export const MessageItemSkeleton = ({ isOwnMessage = false }) => (
  <View style={[styles.messageItem, isOwnMessage && styles.messageItemRight]}>
    <Skeleton width={200} height={40} borderRadius={16} />
  </View>
);

// Conversation Item Skeleton
export const ConversationItemSkeleton = () => (
  <View style={styles.conversationItem}>
    <Skeleton width={50} height={50} borderRadius={25} />
    <View style={styles.conversationInfo}>
      <Skeleton width={120} height={16} style={styles.mb8} />
      <Skeleton width={180} height={14} />
    </View>
    <Skeleton width={40} height={12} />
  </View>
);

// Profile Header Skeleton
export const ProfileHeaderSkeleton = () => (
  <View style={styles.profileHeader}>
    <Skeleton width={100} height={100} borderRadius={50} style={styles.mb16} />
    <Skeleton width={150} height={24} style={styles.mb8} />
    <Skeleton width={100} height={16} style={styles.mb16} />
    <View style={styles.profileStats}>
      {[...Array(3)].map((_, i) => (
        <View key={i} style={styles.statItem}>
          <Skeleton width={40} height={20} style={styles.mb4} />
          <Skeleton width={60} height={14} />
        </View>
      ))}
    </View>
  </View>
);

// Sport Icon Skeleton
export const SportIconSkeleton = () => (
  <View style={styles.sportIcon}>
    <Skeleton width={70} height={70} borderRadius={35} style={styles.mb8} />
    <Skeleton width={60} height={12} />
  </View>
);

// List Skeleton - General purpose list skeleton
export const ListSkeleton = ({ count = 5, renderItem = () => <EventCardSkeleton /> }) => (
  <View>
    {[...Array(count)].map((_, index) => (
      <View key={index}>
        {renderItem(index)}
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#2A2A2A',
  },
  mb4: {
    marginBottom: 4,
  },
  mb8: {
    marginBottom: 8,
  },
  mb16: {
    marginBottom: 16,
  },
  // Event Card
  eventCard: {
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  eventCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  playerDots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  // User Card
  userCard: {
    alignItems: 'center',
    width: 70,
    marginRight: 16,
  },
  // Message
  messageItem: {
    marginHorizontal: 16,
    marginVertical: 4,
    alignSelf: 'flex-start',
  },
  messageItemRight: {
    alignSelf: 'flex-end',
  },
  // Conversation
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
  },
  conversationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  // Profile
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileStats: {
    flexDirection: 'row',
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  // Sport Icon
  sportIcon: {
    alignItems: 'center',
    marginRight: 16,
  },
});

