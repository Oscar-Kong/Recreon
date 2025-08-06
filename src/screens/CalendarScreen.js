// src/screens/CalendarScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
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

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CalendarScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('myEvents'); // 'myEvents' or 'findEvents'
  const [events, setEvents] = useState([]);
  const [findEvents, setFindEvents] = useState([]);
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [selectedDate, activeTab]);

  const fetchEvents = async () => {
    // Mock data for My Events
    const mockMyEvents = [
      {
        id: '1',
        name: 'Tennis Match',
        type: 'Singles',
        time: '10:00 - 11:00',
        date: new Date(),
        notes: 'Notes',
        color: '#DC2626',
      },
      {
        id: '2',
        name: 'Tennis Match',
        type: 'Singles',
        time: '10:00 - 11:00',
        date: new Date(),
        notes: 'Notes',
        color: '#D97706',
      },
      {
        id: '3',
        name: 'Tennis Match',
        type: 'Singles',
        time: '10:00 - 11:00',
        date: new Date(),
        notes: 'Notes',
        color: '#059669',
      },
    ];

    // Mock data for Find Events
    const mockFindEvents = [
      {
        id: '4',
        name: 'Tennis',
        type: 'Singles',
        time: '10:00 - 11:00',
        date: new Date(),
        rank: 'Intermediate',
        color: '#DC2626',
        hasJoinButton: true,
      },
      {
        id: '5',
        name: 'Tennis',
        type: 'Singles',
        time: '10:00 - 11:00',
        date: new Date(),
        rank: 'Beginner',
        color: '#D97706',
        hasJoinButton: true,
      },
      {
        id: '6',
        name: 'Tennis',
        type: 'Singles',
        time: '10:00 - 11:00',
        date: new Date(),
        rank: 'Advanced',
        color: '#059669',
        hasJoinButton: true,
      },
    ];

    if (activeTab === 'myEvents') {
      setEvents(mockMyEvents);
    } else {
      setFindEvents(mockFindEvents);
    }
  };

  const handleCreateEvent = (eventData) => {
    console.log('Creating event:', eventData);
    fetchEvents();
  };

  const handleEventPress = (event) => {
    navigation.navigate('EventDetails', { eventId: event.id });
  };

  const handleJoinEvent = (event) => {
    console.log('Joining event:', event.id);
    // Add join logic here
  };

  const renderMyEvent = ({ item }) => (
    <EventCard event={item} onPress={() => handleEventPress(item)} />
  );

  const renderFindEvent = ({ item }) => (
    <TouchableOpacity style={styles.findEventCard} onPress={() => handleEventPress(item)}>
      <View style={[styles.eventColorBar, { backgroundColor: item.color }]} />
      <View style={styles.findEventContent}>
        <View style={styles.findEventHeader}>
          <Text style={styles.findEventTime}>{item.time}</Text>
          <Text style={styles.findEventType}>| {item.type}</Text>
        </View>
        <Text style={styles.findEventTitle}>{item.name}</Text>
        <Text style={styles.findEventRank}>Ranks: {item.rank}</Text>
      </View>
      <TouchableOpacity 
        style={styles.joinButton}
        onPress={() => handleJoinEvent(item)}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header and Calendar */}
      <View style={styles.fixedTop}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            const newDate = new Date(selectedDate);
            newDate.setMonth(newDate.getMonth() - 1);
            setSelectedDate(newDate);
          }}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerTitle}>
            <Text style={styles.monthText}>
              {selectedDate.toLocaleString('default', { month: 'long' })}
            </Text>
            <Text style={styles.yearText}>{selectedDate.getFullYear()}</Text>
          </View>
          
          <TouchableOpacity onPress={() => {
            const newDate = new Date(selectedDate);
            newDate.setMonth(newDate.getMonth() + 1);
            setSelectedDate(newDate);
          }}>
            <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Calendar View */}
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
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {activeTab === 'myEvents' 
                ? 'No events scheduled' 
                : 'No events found'}
            </Text>
          </View>
        }
      />

      {/* Fixed Bottom Tab Buttons */}
      <View style={styles.fixedTabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'myEvents' && styles.activeTab]}
          onPress={() => setActiveTab('myEvents')}
        >
          <Text style={[styles.tabText, activeTab === 'myEvents' && styles.activeTabText]}>
            My Events
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddEventModal(true)}
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </TouchableOpacity>
        
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
        onCreateEvent={handleCreateEvent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
    paddingBottom: 100, // Space for fixed bottom tabs
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    color: '#666666',
    fontSize: 16,
  },
});

export default CalendarScreen;