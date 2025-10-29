// src/screens/CalendarScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddEventModal from '../components/calendar/AddEventModal';
import CalendarView from '../components/calendar/CalendarView';
import EventCard from '../components/calendar/EventCard';
import { eventService } from '../services/eventService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * CALENDAR SCREEN
 * 
 * This is the main calendar interface showing user's events and discoverable events.
 * 
 * State Management:
 * - selectedDate: Currently selected date in calendar
 * - activeTab: 'myEvents' or 'findEvents' (discover mode)
 * - events/findEvents: Arrays of event data from backend
 * - loading/refreshing: UI state indicators
 * 
 * Data Flow:
 * 1. User interacts with calendar (selects date, switches tab)
 * 2. Component calls eventService methods
 * 3. Service makes API request to backend
 * 4. Backend queries PostgreSQL database
 * 5. Data flows back through service to component
 * 6. Component updates state and re-renders UI
 */

const CalendarScreen = ({ navigation }) => {
  // State management
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('myEvents'); // 'myEvents' or 'findEvents'
  const [events, setEvents] = useState([]);
  const [findEvents, setFindEvents] = useState([]);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch events when component mounts or dependencies change
   * 
   * useEffect Hook Pattern:
   * - Runs after component renders
   * - For "My Events": fetches all future events (not date-specific)
   * - For "Find Events": fetches events for selected date
   */
  useEffect(() => {
    fetchEvents();
  }, [activeTab]); // Only refetch when switching tabs
  
  // Separate effect for Find Events to refetch when date changes
  useEffect(() => {
    if (activeTab === 'findEvents') {
      fetchEvents();
    }
  }, [selectedDate]);

  /**
   * Fetch events from backend based on current tab
   * 
   * Async/Await Pattern:
   * - Modern JavaScript for handling promises
   * - Makes asynchronous code look synchronous
   * - Easier to read and maintain than promise chains
   */
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'myEvents') {
        // Fetch all user's future events (not filtered by specific date)
        const params = {
          startDate: new Date().toISOString(), // From now onwards
        };
        const fetchedEvents = await eventService.getMyEvents(params);
        setEvents(fetchedEvents);
      } else {
        // For discover events, show events for the selected date
        const params = {
          date: selectedDate.toISOString(),
        };
        const fetchedEvents = await eventService.getDiscoverEvents(params);
        setFindEvents(fetchedEvents);
      }

    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.error || 'Failed to load events');
      
      // Show user-friendly error
      Alert.alert(
        'Error',
        'Could not load events. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Handle pull-to-refresh gesture
   * 
   * This provides a native mobile experience where users can
   * pull down on the list to refresh data
   */
  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  /**
   * Create a new event
   * 
   * Flow:
   * 1. User fills out form in modal
   * 2. Modal calls this function with event data
   * 3. We send to backend via eventService
   * 4. Backend creates event in database
   * 5. We refresh the list to show new event
   */
  const handleCreateEvent = async (eventData) => {
    try {
      console.log('Creating event:', eventData);
      
      // Call backend API
      await eventService.createEvent(eventData);
      
      // Show success feedback
      Alert.alert(
        'Success',
        'Event created successfully!',
        [{ text: 'OK' }]
      );
      
      // Close modal and refresh events list
      setShowAddEventModal(false);
      fetchEvents();
      
    } catch (err) {
      console.error('Error creating event:', err);
      
      // Show error with details if available
      const errorMessage = err.details 
        ? err.details.map(d => d.message).join('\n')
        : err.error || 'Failed to create event';
      
      Alert.alert(
        'Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    }
  };

  /**
   * Navigate to event details screen
   * 
   * React Navigation Pattern:
   * - Pass eventId as parameter
   * - Next screen can fetch full event details
   */
  const handleEventPress = (event) => {
    navigation.navigate('EventDetails', { eventId: event.id });
  };

  /**
   * Join a discoverable event
   * 
   * Optimistic UI Pattern:
   * - We could immediately update UI before backend confirms
   * - But here we wait for confirmation for data integrity
   */
  const handleJoinEvent = async (event) => {
    try {
      console.log('Joining event:', event.id);
      
      // Show confirmation dialog
      Alert.alert(
        'Join Event',
        `Do you want to join "${event.title || event.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Join', 
            onPress: async () => {
              try {
                await eventService.joinEvent(event.id);
                
                Alert.alert(
                  'Success',
                  'You have joined the event!',
                  [{ text: 'OK' }]
                );
                
                // Refresh to show updated participant list
                fetchEvents();
              } catch (err) {
                Alert.alert(
                  'Error',
                  err.error || 'Failed to join event',
                  [{ text: 'OK' }]
                );
              }
            }
          }
        ]
      );
      
    } catch (err) {
      console.error('Error joining event:', err);
    }
  };

  /**
   * Change selected month
   */
  const changeMonth = (delta) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setSelectedDate(newDate);
  };

  /**
   * Render event card for "My Events" tab
   */
  const renderMyEvent = ({ item }) => (
    <EventCard event={item} onPress={() => handleEventPress(item)} />
  );

  /**
   * Render event card for "Find Events" tab
   * Different UI for discoverable events with join button
   */
  const renderFindEvent = ({ item }) => {
    const isFull = item.maxParticipants && item.participants >= item.maxParticipants;
    
    return (
      <TouchableOpacity 
        style={styles.findEventCard} 
        onPress={() => handleEventPress(item)}
      >
        {/* Color indicator bar */}
        <View style={[styles.eventColorBar, { backgroundColor: item.color || '#7B9F8C' }]} />
        
        {/* Event information */}
        <View style={styles.findEventContent}>
          <View style={styles.findEventHeader}>
            <Text style={styles.findEventTime}>{item.time}</Text>
            <Text style={styles.findEventType}>| {item.eventType || 'Event'}</Text>
          </View>
          <Text style={styles.findEventTitle}>{item.title || item.name}</Text>
          {item.skillLevelRange && (
            <Text style={styles.findEventRank}>Skill: {item.skillLevelRange}</Text>
          )}
          {item.sport && (
            <View style={styles.sportBadge}>
              <Ionicons name="tennisball-outline" size={14} color="#7B9F8C" />
              <Text style={styles.sportBadgeText}>{item.sport}</Text>
            </View>
          )}
          {item.venue && (
            <Text style={styles.findEventVenue}>📍 {item.venue}</Text>
          )}
          <Text style={styles.findEventParticipants}>
            {item.participants || 0}
            {item.maxParticipants && `/${item.maxParticipants}`} participants
          </Text>
        </View>
        
        {/* Join button */}
        {!isFull ? (
          <TouchableOpacity 
            style={styles.joinButton}
            onPress={(e) => {
              e.stopPropagation(); // Prevent triggering card press
              handleJoinEvent(item);
            }}
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.fullBadge}>
            <Text style={styles.fullBadgeText}>FULL</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  /**
   * Empty state component
   * Shows when no events exist
   */
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={48} color="#666666" />
      <Text style={styles.emptyStateText}>
        {activeTab === 'myEvents' 
          ? 'No upcoming events'
          : 'No events available to join'}
      </Text>
      <Text style={styles.emptyStateSubtext}>
        {activeTab === 'myEvents' 
          ? 'Create your first event to get started'
          : 'Check back later for new events'}
      </Text>
      {activeTab === 'myEvents' && (
        <TouchableOpacity 
          style={styles.createEventButton}
          onPress={() => setShowAddEventModal(true)}
        >
          <Text style={styles.createEventButtonText}>Create Event</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  /**
   * Loading indicator
   */
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7B9F8C" />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header and Calendar */}
      <View style={styles.fixedTop}>
        {/* Header with month navigation */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => changeMonth(-1)}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerTitle}>
            <Text style={styles.monthText}>
              {selectedDate.toLocaleString('default', { month: 'long' })}
            </Text>
            <Text style={styles.yearText}>{selectedDate.getFullYear()}</Text>
          </View>
          
          <TouchableOpacity onPress={() => changeMonth(1)}>
            <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Calendar Grid */}
        <CalendarView
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          events={activeTab === 'myEvents' ? events : findEvents}
        />
      </View>

      {/* Scrollable Events List */}
      <FlatList
        data={activeTab === 'myEvents' ? events : findEvents}
        renderItem={activeTab === 'myEvents' ? renderMyEvent : renderFindEvent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.eventsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />

      {/* Fixed Bottom: Tab Switcher + Add Button */}
      <View style={styles.fixedTabContainer}>
        {/* My Events Tab */}
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'myEvents' && styles.activeTab]}
          onPress={() => setActiveTab('myEvents')}
        >
          <Text style={[styles.tabText, activeTab === 'myEvents' && styles.activeTabText]}>
            My Events
          </Text>
        </TouchableOpacity>

        {/* Add Event Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddEventModal(true)}
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Find Events Tab */}
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'findEvents' && styles.activeTab]}
          onPress={() => setActiveTab('findEvents')}
        >
          <Text style={[styles.tabText, activeTab === 'findEvents' && styles.activeTabText]}>
            Find Events
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Event Modal */}
      <AddEventModal
        visible={showAddEventModal}
        onClose={() => setShowAddEventModal(false)}
        onSubmit={handleCreateEvent}
        selectedDate={selectedDate}
      />
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
    marginTop: 16,
    fontSize: 16,
  },
  fixedTop: {
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
    alignItems: 'center',
  },
  monthText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  yearText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 2,
  },
  eventsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  fixedTabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  tabButton: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  activeTab: {
    backgroundColor: '#7B9F8C',
  },
  tabText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7B9F8C',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  // Find Events specific styles
  findEventCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    alignItems: 'center',
  },
  eventColorBar: {
    width: 4,
    height: '100%',
    position: 'absolute',
    left: 0,
  },
  findEventContent: {
    flex: 1,
    padding: 15,
    paddingLeft: 20,
  },
  findEventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  findEventTime: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  findEventType: {
    color: '#666666',
    fontSize: 14,
    marginLeft: 5,
  },
  findEventTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  findEventRank: {
    color: '#666666',
    fontSize: 14,
    marginBottom: 5,
  },
  sportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 5,
  },
  sportBadgeText: {
    color: '#7B9F8C',
    fontSize: 13,
    fontWeight: '500',
  },
  findEventVenue: {
    color: '#999999',
    fontSize: 13,
    marginBottom: 5,
  },
  findEventParticipants: {
    color: '#7B9F8C',
    fontSize: 13,
    fontWeight: '500',
  },
  joinButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  fullBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 15,
  },
  fullBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    color: '#666666',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  createEventButton: {
    backgroundColor: '#7B9F8C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 20,
  },
  createEventButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CalendarScreen;