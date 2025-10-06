// src/components/calendar/AddEventModal.js
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddEventModal = ({ visible, onClose, onSubmit, selectedDate }) => {
  // Basic event info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  
  // Time management - create NEW date objects to avoid mutation
  const [startTime, setStartTime] = useState(() => {
    const date = new Date(selectedDate);
    date.setHours(10, 0, 0, 0);
    return date;
  });
  
  const [endTime, setEndTime] = useState(() => {
    const date = new Date(selectedDate);
    date.setHours(11, 0, 0, 0);
    return date;
  });
  
  // Additional fields
  const [eventType, setEventType] = useState('practice'); // practice, social, tournament, league
  const [maxParticipants, setMaxParticipants] = useState('');
  
  // Date picker visibility
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    // Validate time logic
    if (endTime <= startTime) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    // Construct event data payload
    const eventData = {
      title: title.trim(),
      description: description.trim() || '',
      sportId: 1, // Default to Tennis - you could add sport selection later
      eventType: eventType,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      venue: venue.trim() || null,
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
      minParticipants: 1, // Default minimum
    };

    await onSubmit(eventData);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setVenue('');
    setEventType('practice');
    setMaxParticipants('');
    
    // Reset times to default for next use
    const newStart = new Date(selectedDate);
    newStart.setHours(10, 0, 0, 0);
    setStartTime(newStart);
    
    const newEnd = new Date(selectedDate);
    newEnd.setHours(11, 0, 0, 0);
    setEndTime(newEnd);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Format time for display
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Handle date picker changes
  const onStartTimeChange = (event, selected) => {
    setShowStartPicker(Platform.OS === 'ios'); // Keep open on iOS
    if (selected) {
      setStartTime(selected);
      
      // Auto-adjust end time if it's now before start time
      if (endTime <= selected) {
        const newEnd = new Date(selected);
        newEnd.setHours(selected.getHours() + 1);
        setEndTime(newEnd);
      }
    }
  };

  const onEndTimeChange = (event, selected) => {
    setShowEndPicker(Platform.OS === 'ios'); // Keep open on iOS
    if (selected) {
      setEndTime(selected);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Event</Text>
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={styles.createButton}>Create</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Event Title */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter event name"
              placeholderTextColor="#666666"
              value={title}
              onChangeText={setTitle}
              autoCapitalize="words"
            />
          </View>

          {/* Event Type Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Type</Text>
            <View style={styles.typeSelector}>
              {['practice', 'social', 'tournament', 'league'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    eventType === type && styles.typeButtonActive
                  ]}
                  onPress={() => setEventType(type)}
                >
                  <Text style={[
                    styles.typeButtonText,
                    eventType === type && styles.typeButtonTextActive
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date & Time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date & Time</Text>
            
            {/* Selected Date Display */}
            <View style={styles.dateDisplay}>
              <Ionicons name="calendar-outline" size={20} color="#7B9F8C" />
              <Text style={styles.dateText}>
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Text>
            </View>

            {/* Start Time */}
            <TouchableOpacity 
              style={styles.timeRow}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={styles.timeLabel}>Start Time</Text>
              <View style={styles.timeValue}>
                <Text style={styles.timeText}>{formatTime(startTime)}</Text>
                <Ionicons name="chevron-forward" size={20} color="#666666" />
              </View>
            </TouchableOpacity>

            {/* End Time */}
            <TouchableOpacity 
              style={styles.timeRow}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={styles.timeLabel}>End Time</Text>
              <View style={styles.timeValue}>
                <Text style={styles.timeText}>{formatTime(endTime)}</Text>
                <Ionicons name="chevron-forward" size={20} color="#666666" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Venue */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Venue (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter location"
              placeholderTextColor="#666666"
              value={venue}
              onChangeText={setVenue}
              autoCapitalize="words"
            />
          </View>

          {/* Max Participants */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Max Participants (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter maximum number"
              placeholderTextColor="#666666"
              value={maxParticipants}
              onChangeText={setMaxParticipants}
              keyboardType="number-pad"
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add event details"
              placeholderTextColor="#666666"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Bottom padding for keyboard */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>

      {/* Date/Time Pickers - iOS shows inline, Android shows dialog */}
      {showStartPicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onStartTimeChange}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endTime}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onEndTimeChange}
        />
      )}
    </Modal>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  cancelButton: {
    color: '#999999',
    fontSize: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  createButton: {
    color: '#7B9F8C',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  
  // Event Type Selector
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
  },
  typeButtonActive: {
    backgroundColor: '#7B9F8C',
    borderColor: '#7B9F8C',
  },
  typeButtonText: {
    color: '#999999',
    fontSize: 14,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  
  // Date & Time Display
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  timeLabel: {
    color: '#999999',
    fontSize: 16,
  },
  timeValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AddEventModal;