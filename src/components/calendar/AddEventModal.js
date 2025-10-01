// src/components/calendar/AddEventModal.js
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../services/api';

/**
 * ADD EVENT MODAL
 * 
 * This modal handles creating new events with all necessary fields.
 * 
 * Form State Management:
 * - Each field has its own state
 * - Validation happens on submit
 * - Data is formatted before sending to backend
 */

const AddEventModal = ({ visible, onClose, onSubmit, selectedDate }) => {
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [selectedSport, setSelectedSport] = useState(null);
  const [eventType, setEventType] = useState('practice');
  const [sports, setSports] = useState([]);
  
  // Date/time state
  const [startDate, setStartDate] = useState(selectedDate || new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(Date.now() + 3600000)); // +1 hour
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  
  // Additional settings
  const [maxParticipants, setMaxParticipants] = useState('');
  const [enableReminder, setEnableReminder] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);

  // Event types for selection
  const eventTypes = [
    { id: 'practice', name: 'Practice', color: '#D97706' },
    { id: 'tournament', name: 'Tournament', color: '#DC2626' },
    { id: 'social', name: 'Social', color: '#059669' },
    { id: 'league', name: 'League', color: '#2563EB' }
  ];

  /**
   * Fetch available sports from backend when modal opens
   */
  useEffect(() => {
    if (visible) {
      fetchSports();
      // Reset form when opening
      resetForm();
    }
  }, [visible]);

  /**
   * Fetch sports from API
   */
  const fetchSports = async () => {
    try {
      const response = await api.get('/sports'); // You'll need to create this endpoint
      setSports(response.data.sports);
      
      // Auto-select first sport if available
      if (response.data.sports.length > 0 && !selectedSport) {
        setSelectedSport(response.data.sports[0]);
      }
    } catch (error) {
      console.error('Error fetching sports:', error);
      // Use fallback sports if API fails
      setSports([
        { id: 1, displayName: 'Tennis', name: 'tennis' },
        { id: 2, displayName: 'Basketball', name: 'basketball' },
        { id: 3, displayName: 'Soccer', name: 'soccer' },
        { id: 4, displayName: 'Badminton', name: 'badminton' }
      ]);
      setSelectedSport({ id: 1, displayName: 'Tennis', name: 'tennis' });
    }
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setVenue('');
    setEventType('practice');
    setStartDate(selectedDate || new Date());
    setStartTime(new Date());
    setEndTime(new Date(Date.now() + 3600000));
    setMaxParticipants('');
    setEnableReminder(true);
    setSelectedTag(null);
  };

  /**
   * Combine date and time into single DateTime
   */
  const combineDateAndTime = (date, time) => {
    const combined = new Date(date);
    combined.setHours(time.getHours());
    combined.setMinutes(time.getMinutes());
    combined.setSeconds(0);
    combined.setMilliseconds(0);
    return combined;
  };

  /**
   * Handle form submission
   * Validates input and formats data for backend
   */
  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    if (!selectedSport) {
      Alert.alert('Error', 'Please select a sport');
      return;
    }

    // Combine date and time
    const startDateTime = combineDateAndTime(startDate, startTime);
    const endDateTime = combineDateAndTime(startDate, endTime);

    // Validate end time is after start time
    if (endDateTime <= startDateTime) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    // Validate max participants is a number
    if (maxParticipants && isNaN(parseInt(maxParticipants))) {
      Alert.alert('Error', 'Max participants must be a number');
      return;
    }

    // Build event data object
    const eventData = {
      title: title.trim(),
      description: description.trim(),
      sportId: selectedSport.id,
      eventType: eventType,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      venue: venue.trim() || null,
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
      tags: selectedTag ? [{
        name: selectedTag.name,
        color: selectedTag.color
      }] : []
    };

    // Call parent's onSubmit handler
    await onSubmit(eventData);
    
    // Reset form after successful submission
    resetForm();
  };

  /**
   * Handle time picker change
   */
  const onStartTimeChange = (event, selected) => {
    setShowStartTimePicker(false);
    if (selected) {
      setStartTime(selected);
    }
  };

  const onEndTimeChange = (event, selected) => {
    setShowEndTimePicker(false);
    if (selected) {
      setEndTime(selected);
    }
  };

  /**
   * Format time for display
   */
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  /**
   * Format date for display
   */
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Event</Text>
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={styles.createButton}>Create</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Event Title */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter event name"
              placeholderTextColor="#666666"
              value={title}
              onChangeText={setTitle}
              maxLength={200}
            />
          </View>

          {/* Sport Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sport</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.sportScroll}
            >
              {sports.map((sport) => (
                <TouchableOpacity
                  key={sport.id}
                  style={[
                    styles.sportChip,
                    selectedSport?.id === sport.id && styles.sportChipSelected
                  ]}
                  onPress={() => setSelectedSport(sport)}
                >
                  <Text style={[
                    styles.sportChipText,
                    selectedSport?.id === sport.id && styles.sportChipTextSelected
                  ]}>
                    {sport.displayName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Event Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Type</Text>
            <View style={styles.typeContainer}>
              {eventTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeChip,
                    eventType === type.id && styles.typeChipSelected,
                    eventType === type.id && { borderColor: type.color }
                  ]}
                  onPress={() => {
                    setEventType(type.id);
                    setSelectedTag({ name: type.name, color: type.color });
                  }}
                >
                  <Text style={[
                    styles.typeChipText,
                    eventType === type.id && styles.typeChipTextSelected
                  ]}>
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date</Text>
            <View style={styles.dateDisplay}>
              <Ionicons name="calendar-outline" size={20} color="#7B9F8C" />
              <Text style={styles.dateText}>{formatDate(startDate)}</Text>
            </View>
          </View>

          {/* Time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Time</Text>
            <View style={styles.timeRow}>
              {/* Start Time */}
              <TouchableOpacity 
                style={styles.timeInput}
                onPress={() => setShowStartTimePicker(true)}
              >
                <Text style={styles.timeLabel}>Start</Text>
                <View style={styles.timeValue}>
                  <Text style={styles.timeText}>{formatTime(startTime)}</Text>
                  <Ionicons name="chevron-down" size={20} color="#999999" />
                </View>
              </TouchableOpacity>

              {/* End Time */}
              <TouchableOpacity 
                style={[styles.timeInput, styles.timeInputRight]}
                onPress={() => setShowEndTimePicker(true)}
              >
                <Text style={styles.timeLabel}>End</Text>
                <View style={styles.timeValue}>
                  <Text style={styles.timeText}>{formatTime(endTime)}</Text>
                  <Ionicons name="chevron-down" size={20} color="#999999" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Time Pickers */}
            {showStartTimePicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                display="spinner"
                onChange={onStartTimeChange}
              />
            )}
            {showEndTimePicker && (
              <DateTimePicker
                value={endTime}
                mode="time"
                display="spinner"
                onChange={onEndTimeChange}
              />
            )}
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
              maxLength={255}
            />
          </View>

          {/* Max Participants */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Max Participants (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Leave empty for unlimited"
              placeholderTextColor="#666666"
              value={maxParticipants}
              onChangeText={setMaxParticipants}
              keyboardType="number-pad"
              maxLength={3}
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
              maxLength={5000}
            />
          </View>

          {/* Reminder Toggle */}
          <View style={styles.section}>
            <View style={styles.remindRow}>
              <Text style={styles.remindText}>Remind me 1 hour before</Text>
              <Switch
                value={enableReminder}
                onValueChange={setEnableReminder}
                trackColor={{ false: '#333333', true: '#7B9F8C' }}
                thumbColor={enableReminder ? '#FFFFFF' : '#666666'}
              />
            </View>
          </View>

          {/* Spacer for bottom padding */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
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
  sportScroll: {
    flexDirection: 'row',
  },
  sportChip: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#333333',
  },
  sportChipSelected: {
    backgroundColor: '#7B9F8C',
    borderColor: '#7B9F8C',
  },
  sportChipText: {
    color: '#999999',
    fontSize: 14,
    fontWeight: '500',
  },
  sportChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeChip: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#333333',
  },
  typeChipSelected: {
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
  },
  typeChipText: {
    color: '#999999',
    fontSize: 14,
    fontWeight: '500',
  },
  typeChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 12,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  timeInput: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  timeInputRight: {
    marginLeft: 0,
  },
  timeLabel: {
    color: '#999999',
    fontSize: 14,
  },
  timeValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 8,
  },
  remindRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  remindText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default AddEventModal;