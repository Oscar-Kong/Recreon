// src/screens/EventDetailsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { eventService } from '../services/eventService';
import { useAuth } from '../hooks/useAuth';
import EmptyState, { ErrorState } from '../components/common/EmptyState';
import { showToast } from '../components/common/Toast';

const EventDetailsScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Create getEventById endpoint in backend
      const response = await eventService.getMyEvents();
      const foundEvent = response.events.find(e => e.id === eventId);
      
      if (foundEvent) {
        setEvent(foundEvent);
      } else {
        setError('Event not found');
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setJoining(true);
      
      await eventService.joinEvent(eventId);
      
      showToast({
        type: 'success',
        message: 'Successfully joined event!',
      });

      // Refresh event details
      await fetchEventDetails();
    } catch (err) {
      console.error('Error joining event:', err);
      showToast({
        type: 'error',
        message: err.error || 'Failed to join event',
      });
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveEvent = async () => {
    Alert.alert(
      'Leave Event',
      'Are you sure you want to leave this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await eventService.leaveEvent(eventId);
              showToast({
                type: 'success',
                message: 'Left event',
              });
              navigation.goBack();
            } catch (err) {
              showToast({
                type: 'error',
                message: 'Failed to leave event',
              });
            }
          },
        },
      ]
    );
  };

  const isParticipant = event?.participants?.some(p => p.userId === user?.id);
  const isCreator = event?.creatorId === user?.id;
  const isFull = event?.maxParticipants && 
                 event?.participants?.length >= event?.maxParticipants;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7B9F8C" />
          <Text style={styles.loadingText}>Loading event...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState
          errorMessage={error}
          onRetry={fetchEventDetails}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Details</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Event Info Card */}
        <View style={styles.eventCard}>
          <LinearGradient
            colors={['#7B9F8C20', '#7B9F8C10']}
            style={styles.gradient}
          >
            <View style={styles.eventHeader}>
              <View style={styles.sportBadge}>
                <Ionicons name="tennisball" size={20} color="#7B9F8C" />
                <Text style={styles.sportText}>{event.sport?.displayName || 'Sport'}</Text>
              </View>
              {isFull && (
                <View style={styles.fullBadge}>
                  <Text style={styles.fullText}>FULL</Text>
                </View>
              )}
            </View>

            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventType}>{event.eventType}</Text>

            {event.description && (
              <Text style={styles.description}>{event.description}</Text>
            )}
          </LinearGradient>
        </View>

        {/* Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>

          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={20} color="#7B9F8C" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>
                {new Date(event.startTime).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              <Text style={styles.detailValue}>
                {new Date(event.startTime).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })} - {new Date(event.endTime).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>

          {event.venue && (
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={20} color="#7B9F8C" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{event.venue}</Text>
              </View>
            </View>
          )}

          <View style={styles.detailItem}>
            <Ionicons name="people-outline" size={20} color="#7B9F8C" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Participants</Text>
              <Text style={styles.detailValue}>
                {event.participants?.length || 0}
                {event.maxParticipants && ` / ${event.maxParticipants}`} players
              </Text>
            </View>
          </View>

          {event.skillLevelMin && (
            <View style={styles.detailItem}>
              <Ionicons name="bar-chart-outline" size={20} color="#7B9F8C" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Skill Level</Text>
                <Text style={styles.detailValue}>
                  {event.skillLevelMin}
                  {event.skillLevelMax && event.skillLevelMax !== event.skillLevelMin
                    ? ` - ${event.skillLevelMax}`
                    : ''}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Participants Section */}
        {event.participants && event.participants.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Participants ({event.participants.length})
            </Text>
            {event.participants.map((participant) => (
              <View key={participant.userId} style={styles.participantItem}>
                <View style={[
                  styles.participantAvatar,
                  { backgroundColor: participant.user?.avatarColor || '#7B9F8C' }
                ]}>
                  <Ionicons name="person" size={20} color="#000000" />
                </View>
                <Text style={styles.participantName}>
                  {participant.user?.fullName || participant.user?.username || 'Player'}
                  {participant.userId === event.creatorId && ' (Organizer)'}
                </Text>
                <View style={[
                  styles.statusBadge,
                  participant.status === 'CONFIRMED' && styles.statusConfirmed
                ]}>
                  <Text style={styles.statusText}>{participant.status}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Spacer for button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Action Button */}
      {!isCreator && (
        <View style={styles.actionContainer}>
          {isParticipant ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.leaveButton]}
              onPress={handleLeaveEvent}
            >
              <Text style={styles.actionButtonText}>Leave Event</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.actionButton,
                (isFull || joining) && styles.actionButtonDisabled
              ]}
              onPress={handleJoinEvent}
              disabled={isFull || joining}
            >
              <LinearGradient
                colors={isFull ? ['#666666', '#555555'] : ['#7B9F8C', '#059669']}
                style={styles.actionButtonGradient}
              >
                {joining ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>
                      {isFull ? 'Event Full' : 'Join Event'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  eventCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
  },
  gradient: {
    padding: 20,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7B9F8C20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  sportText: {
    color: '#7B9F8C',
    fontSize: 14,
    fontWeight: '600',
  },
  fullBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  fullText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  eventType: {
    fontSize: 14,
    color: '#7B9F8C',
    textTransform: 'capitalize',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  participantName: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#333333',
  },
  statusConfirmed: {
    backgroundColor: '#05966920',
  },
  statusText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  leaveButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EventDetailsScreen;

