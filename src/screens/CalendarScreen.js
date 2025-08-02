// src/screens/CalendarScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CalendarView from '../components/calendar/CalendarView';
import EventCard from '../components/calendar/EventCard';
import AddEventModal from '../components/calendar/AddEventModal';

const CalendarScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('myEvents'); // 'myEvents' or 'findEvents'
  const [events, setEvents] = useState([]);
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [selectedDate, activeTab]);

  const fetchEvents = async () => {
    // Mock data - replace with actual API call
    const mockEvents = [
      {
        id: '1',
        name: 'Tennis Match',
        type: 'Singles',
        time: '10:00 - 11:00',
        date: new Date(),
        notes: 'Bring extra rackets',
        color: '#DC2626',
      },
      {
        id: '2',
        name: 'Tennis Match',
        type: 'Singles',
        time: '10:00 - 11:00',
        date: new Date(),
        notes: 'Court 3',
        color: '#D97706',
      },
      {
        id: '3',
        name: 'Tennis Match',
        type: 'Singles',
        time: '10:00 - 11:00',
        date: new Date(),
        notes: 'Tournament prep',
        color: '#059669',
      },
    ];

    setEvents(mockEvents);
  };

  const handleCreateEvent = (eventData) => {
    // Handle event creation
    console.log('Creating event:', eventData);
    // Add API call to save event
    // Refresh events list
    fetchEvents();
  };

  const handleEventPress = (event) => {
    navigation.navigate('EventDetails', { eventId: event.id });
  };

  const renderEvent = ({ item }) => (
    <EventCard event={item} onPress={() => handleEventPress(item)} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
          events={events}
        />

        {/* Tab Buttons */}
        <View style={styles.tabContainer}>
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
            <Ionicons name="add" size={24} color="#FFFFFF" />
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

        {/* Events List */}
        <View style={styles.eventsContainer}>
          {events.length > 0 ? (
            events.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                onPress={() => handleEventPress(event)} 
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {activeTab === 'myEvents' 
                  ? 'No events scheduled' 
                  : 'No events found'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

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
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  tabButton: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#7B9F8C',
  },
  tabText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7B9F8C',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  eventsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
