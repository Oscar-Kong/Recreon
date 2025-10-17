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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [eventType, setEventType] = useState('practice');
  const [date, setDate] = useState(new Date(selectedDate));
  const [startTime, setStartTime] = useState(new Date(selectedDate.setHours(10, 0, 0, 0)));
  const [endTime, setEndTime] = useState(new Date(selectedDate.setHours(11, 0, 0, 0)));
  
  // State for showing/hiding pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    const eventData = {
      title: title.trim(),
      description: description.trim(),
      sportId: 1, // Default to Tennis for now
      eventType: eventType,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      venue: venue.trim() || null
    };

    await onSubmit(eventData);
    
    // Reset form
    setTitle('');
    setDescription('');
    setVenue('');
    setEventType('practice');
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
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
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
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
            />
          </View>

          {/* Event Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Type</Text>
            <View style={styles.eventTypeContainer}>
              {['practice', 'social', 'tournament', 'league'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.eventTypeButton,
                    eventType === type && styles.eventTypeButtonActive
                  ]}
                  onPress={() => setEventType(type)}
                >
                  <Text style={[
                    styles.eventTypeText,
                    eventType === type && styles.eventTypeTextActive
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
            
            {/* Date Picker */}
            <TouchableOpacity 
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#7B9F8C" />
              <Text style={styles.dateTimeButtonText}>{formatDate(date)}</Text>
              <Ionicons name="chevron-forward" size={20} color="#666666" />
            </TouchableOpacity>

            {/* Start Time Picker */}
            <TouchableOpacity 
              style={styles.dateTimeButton}
              onPress={() => setShowStartTimePicker(true)}
            >
              <Text style={styles.dateTimeLabel}>Start Time</Text>
              <Text style={styles.dateTimeButtonText}>{formatTime(startTime)}</Text>
              <Ionicons name="chevron-forward" size={20} color="#666666" />
            </TouchableOpacity>

            {/* End Time Picker */}
            <TouchableOpacity 
              style={styles.dateTimeButton}
              onPress={() => setShowEndTimePicker(true)}
            >
              <Text style={styles.dateTimeLabel}>End Time</Text>
              <Text style={styles.dateTimeButtonText}>{formatTime(endTime)}</Text>
              <Ionicons name="chevron-forward" size={20} color="#666666" />
            </TouchableOpacity>
          </View>

          {/* Date Picker Modal */}
          {showDatePicker && (
            <Modal
              transparent={true}
              animationType="slide"
              visible={showDatePicker}
              onRequestClose={() => setShowDatePicker(false)}
            >
              <View style={styles.pickerModalContainer}>
                <View style={styles.pickerModal}>
                  <View style={styles.pickerHeader}>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.pickerDoneButton}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                      if (Platform.OS === 'android') {
                        setShowDatePicker(false);
                      }
                      if (selectedDate) {
                        setDate(selectedDate);
                        // Update start and end times with new date
                        const newStart = new Date(selectedDate);
                        newStart.setHours(startTime.getHours(), startTime.getMinutes());
                        setStartTime(newStart);
                        
                        const newEnd = new Date(selectedDate);
                        newEnd.setHours(endTime.getHours(), endTime.getMinutes());
                        setEndTime(newEnd);
                      }
                    }}
                    textColor="#FFFFFF"
                  />
                </View>
              </View>
            </Modal>
          )}

          {/* Start Time Picker Modal */}
          {showStartTimePicker && (
            <Modal
              transparent={true}
              animationType="slide"
              visible={showStartTimePicker}
              onRequestClose={() => setShowStartTimePicker(false)}
            >
              <View style={styles.pickerModalContainer}>
                <View style={styles.pickerModal}>
                  <View style={styles.pickerHeader}>
                    <TouchableOpacity onPress={() => setShowStartTimePicker(false)}>
                      <Text style={styles.pickerDoneButton}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={startTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedTime) => {
                      if (Platform.OS === 'android') {
                        setShowStartTimePicker(false);
                      }
                      if (selectedTime) {
                        setStartTime(selectedTime);
                        // Auto-adjust end time to be 1 hour after start
                        const newEnd = new Date(selectedTime);
                        newEnd.setHours(newEnd.getHours() + 1);
                        setEndTime(newEnd);
                      }
                    }}
                    textColor="#FFFFFF"
                  />
                </View>
              </View>
            </Modal>
          )}

          {/* End Time Picker Modal */}
          {showEndTimePicker && (
            <Modal
              transparent={true}
              animationType="slide"
              visible={showEndTimePicker}
              onRequestClose={() => setShowEndTimePicker(false)}
            >
              <View style={styles.pickerModalContainer}>
                <View style={styles.pickerModal}>
                  <View style={styles.pickerHeader}>
                    <TouchableOpacity onPress={() => setShowEndTimePicker(false)}>
                      <Text style={styles.pickerDoneButton}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={endTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    minimumDate={startTime}
                    onChange={(event, selectedTime) => {
                      if (Platform.OS === 'android') {
                        setShowEndTimePicker(false);
                      }
                      if (selectedTime) {
                        setEndTime(selectedTime);
                      }
                    }}
                    textColor="#FFFFFF"
                  />
                </View>
              </View>
            </Modal>
          )}

          {/* Venue */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Venue (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter location"
              placeholderTextColor="#666666"
              value={venue}
              onChangeText={setVenue}
            />
          </View>

          {/* Description */}
          <View style={[styles.section, { marginBottom: 40 }]}>
            <Text style={styles.sectionTitle}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add event details"
              placeholderTextColor="#666666"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>
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
  eventTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  eventTypeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
  },
  eventTypeButtonActive: {
    backgroundColor: '#7B9F8C',
    borderColor: '#7B9F8C',
  },
  eventTypeText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
  },
  eventTypeTextActive: {
    color: '#FFFFFF',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },
  dateTimeLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  dateTimeButtonText: {
    color: '#7B9F8C',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginLeft: 12,
  },
  // Picker Modal Styles
  pickerModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerModal: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  pickerDoneButton: {
    color: '#7B9F8C',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default AddEventModal;