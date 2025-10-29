// src/components/common/EmptyState.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Empty State Component
 * 
 * Displays a friendly empty state message with optional action button.
 * Used when lists or screens have no data to display.
 * 
 * Usage:
 * <EmptyState
 *   icon="calendar-outline"
 *   title="No Events Yet"
 *   message="Create your first event to get started"
 *   actionText="Create Event"
 *   onActionPress={() => navigation.navigate('CreateEvent')}
 * />
 */

const EmptyState = ({
  icon = 'information-circle-outline',
  title = 'Nothing Here',
  message = 'There is no data to display yet.',
  actionText,
  onActionPress,
  iconColor = '#7B9F8C',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={64} color={iconColor} />
      </View>

      <Text style={styles.title}>{title}</Text>
      
      {message && (
        <Text style={styles.message}>{message}</Text>
      )}

      {actionText && onActionPress && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onActionPress}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={20} color="#7B9F8C" />
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Predefined Empty States for common scenarios

export const EmptyEventsState = ({ onCreatePress }) => (
  <EmptyState
    icon="calendar-outline"
    title="No Events Yet"
    message="Create your first event to start playing with others"
    actionText="Create Event"
    onActionPress={onCreatePress}
  />
);

export const EmptyMessagesState = () => (
  <EmptyState
    icon="chatbubbles-outline"
    title="No Messages"
    message="Start a conversation with other players"
  />
);

export const EmptySearchState = ({ searchQuery }) => (
  <EmptyState
    icon="search-outline"
    title="No Results"
    message={`No results found for "${searchQuery}"`}
    iconColor="#999999"
  />
);

export const EmptyGamesState = ({ onCreatePress }) => (
  <EmptyState
    icon="game-controller-outline"
    title="No Games Available"
    message="Be the first to create a game in your area"
    actionText="Create Game"
    onActionPress={onCreatePress}
  />
);

export const EmptyPlayersState = () => (
  <EmptyState
    icon="people-outline"
    title="No Players Found"
    message="Try adjusting your filters or check back later"
  />
);

export const EmptyHistoryState = () => (
  <Empty State
    icon="time-outline"
    title="No Match History"
    message="Your match history will appear here after you play your first game"
  />
);

export const EmptyNotificationsState = () => (
  <EmptyState
    icon="notifications-outline"
    title="No Notifications"
    message="You're all caught up! Notifications will appear here."
  />
);

export const ErrorState = ({ onRetry, errorMessage }) => (
  <EmptyState
    icon="alert-circle-outline"
    title="Oops! Something Went Wrong"
    message={errorMessage || "We couldn't load your data. Please try again."}
    actionText="Try Again"
    onActionPress={onRetry}
    iconColor="#DC2626"
  />
);

export const NoConnectionState = ({ onRetry }) => (
  <EmptyState
    icon="cloud-offline-outline"
    title="No Internet Connection"
    message="Please check your connection and try again"
    actionText="Retry"
    onActionPress={onRetry}
    iconColor="#D97706"
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  iconContainer: {
    marginBottom: 24,
    opacity: 0.8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7B9F8C',
    marginTop: 8,
  },
  actionText: {
    color: '#7B9F8C',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmptyState;

