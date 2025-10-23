// src/components/calendar/AddEventModal.js
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { sportsService } from '../../services/sportsService';

const AddEventModal = ({ visible, onClose, onSubmit, selectedDate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [eventType, setEventType] = useState('practice');
  const [date, setDate] = useState(new Date(selectedDate));
  const [startTime, setStartTime] = useState(new Date(selectedDate.setHours(10, 0, 0, 0)));
  const [endTime, setEndTime] = useState(new Date(selectedDate.setHours(11, 0, 0, 0)));
  
  // New state for sport selection
  const [sports, setSports] = useState([]);
  const [selectedSportId, setSelectedSportId] = useState(null);
  const [loadingSports, setLoadingSports] = useState(true);
  
  // State for showing/hiding pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showSportPicker, setShowSportPicker] = useState(false);

  // Fetch sports list when modal opens
  useEffect(() => {
    if (visible) {
      fetchSports();
    }
  }, [visible]);

  const fetchSports = async () => {
    try {
      setLoadingSports(true);
      const response = await sportsService.getAllSports();
      setSports(response.sports || []);
      
      // Auto-select first sport if available
      if (response.sports && response.sports.length > 0) {
        setSelectedSportId(response.sports[0].id);
      }
    } catch (error) {
      console.error('Error fetching sports:', error);
      Alert.alert('Error', 'Failed to load sports list');
    } finally {
      setLoadingSports(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    if (!selectedSportId) {
      Alert.alert('Error', 'Please select a sport');
      return;
    }

    const eventData = {
      title: title.trim(),
      description: description.trim(),
      sportId: selectedSportId,
      eventType: eventType,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      venue: venue.trim() || null
    };

    await onSubmit(eventData);
    
    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setVenue('');
    setEventType('practice');
    setDate(new Date(selectedDate));
    setStartTime(new Date(selectedDate.setHours(10, 0, 0, 0)));
    setEndTime(new Date(selectedDate.setHours(11, 0, 0, 0)));
    if (sports.length > 0) {
      setSelectedSportId(sports[0].id);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const eventTypes = [
    { value: 'practice', label: 'Practice', color: '#7B9F8C' },
    { value: 'social', label: 'Social', color: '#3B82F6' },
    { value: 'tournament', label: 'Tournament', color: '#DC2626' },
    { value: 'league', label: 'League', color: '#D97706' },
  ];

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getSelectedSportName = () => {
    const sport = sports.find(s => s.id === selectedSportId);
    return sport ? sport.displayName : 'Select Sport';
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
            <Text style={styles.headerButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Event</Text>
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={[styles.headerButton, styles.createButton]}>Create</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Event Title */}
          <View style={styles.section}>
            <Text style={styles.label}>Event Title <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Enter event name"
              placeholderTextColor="#666"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Sport Picker */}
          <View style={styles.section}>
            <Text style={styles.label}>Sport <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity 
              style={styles.pickerButton}
              onPress={() => setShowSportPicker(true)}
              disabled={loadingSports}
            >
              <View style={styles.pickerContent}>
                <Ionicons 
                  name="basketball-outline" 
                  size={20} 
                  color="#7B9F8C" 
                />
                <Text style={styles.pickerText}>
                  {loadingSports ? 'Loading...' : getSelectedSportName()}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Event Type */}
          <View style={styles.section}>
            <Text style={styles.label}>Event Type</Text>
            <View style={styles.eventTypeContainer}>
              {eventTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.eventTypeButton,
                    eventType === type.value && { 
                      backgroundColor: type.color,
                      borderColor: type.color 
                    }
                  ]}
                  onPress={() => setEventType(type.value)}
                >
                  <Text
                    style={[
                      styles.eventTypeText,
                      eventType === type.value && styles.eventTypeTextSelected
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date & Time */}
          <View style={styles.section}>
            <Text style={styles.label}>Date & Time</Text>
            
            {/* Date Picker */}
            <TouchableOpacity 
              style={styles.pickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.pickerContent}>
                <Ionicons name="calendar-outline" size={20} color="#7B9F8C" />
                <Text style={styles.pickerText}>{formatDate(date)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            {/* Start Time */}
            <TouchableOpacity 
              style={styles.pickerButton}
              onPress={() => setShowStartTimePicker(true)}
            >
              <View style={styles.pickerContent}>
                <Text style={styles.timeLabel}>Start Time</Text>
                <Text style={styles.pickerText}>{formatTime(startTime)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            {/* End Time */}
            <TouchableOpacity 
              style={styles.pickerButton}
              onPress={() => setShowEndTimePicker(true)}
            >
              <View style={styles.pickerContent}>
                <Text style={styles.timeLabel}>End Time</Text>
                <Text style={styles.pickerText}>{formatTime(endTime)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Venue */}
          <View style={styles.section}>
            <Text style={styles.label}>Venue (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter location"
              placeholderTextColor="#666"
              value={venue}
              onChangeText={setVenue}
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add event details"
              placeholderTextColor="#666"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="spinner"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
          />
        )}

        {/* Start Time Picker Modal */}
        {showStartTimePicker && (
          <DateTimePicker
            value={startTime}
            mode="time"
            display="spinner"
            onChange={(event, selectedTime) => {
              setShowStartTimePicker(false);
              if (selectedTime) {
                setStartTime(selectedTime);
              }
            }}
          />
        )}

        {/* End Time Picker Modal */}
        {showEndTimePicker && (
          <DateTimePicker
            value={endTime}
            mode="time"
            display="spinner"
            onChange={(event, selectedTime) => {
              setShowEndTimePicker(false);
              if (selectedTime) {
                setEndTime(selectedTime);
              }
            }}
          />
        )}

        {/* Sport Picker Modal */}
        <Modal
          visible={showSportPicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowSportPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.sportPickerContainer}>
              <View style={styles.sportPickerHeader}>
                <Text style={styles.sportPickerTitle}>Select Sport</Text>
                <TouchableOpacity onPress={() => setShowSportPicker(false)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.sportList}>
                {loadingSports ? (
                  <ActivityIndicator size="large" color="#7B9F8C" style={{ marginTop: 20 }} />
                ) : (
                  sports.map((sport) => (
                    <TouchableOpacity
                      key={sport.id}
                      style={[
                        styles.sportItem,
                        selectedSportId === sport.id && styles.sportItemSelected
                      ]}
                      onPress={() => {
                        setSelectedSportId(sport.id);
                        setShowSportPicker(false);
                      }}
                    >
                      <View style={styles.sportItemContent}>
                        <Text style={styles.sportIcon}>{sport.icon || '🏃'}</Text>
                        <Text style={styles.sportName}>{sport.displayName}</Text>
                      </View>
                      {selectedSportId === sport.id && (
                        <Ionicons name="checkmark" size={24} color="#7B9F8C" />
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerButton: {
    fontSize: 16,
    color: '#666',
  },
  createButton: {
    color: '#7B9F8C',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  required: {
    color: '#DC2626',
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pickerText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
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
    borderColor: '#2A2A2A',
  },
  eventTypeText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  eventTypeTextSelected: {
    color: '#000000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sportPickerContainer: {
    backgroundColor: '#000000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  sportPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  sportPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sportList: {
    flex: 1,
  },
  sportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  sportItemSelected: {
    backgroundColor: '#1A1A1A',
  },
  sportItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sportIcon: {
    fontSize: 24,
  },
  sportName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default AddEventModal;