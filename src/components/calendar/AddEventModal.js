// src/components/calendar/AddEventModal.js
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.9;

const AddEventModal = ({ visible, onClose, onCreateEvent }) => {
  const [eventName, setEventName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [remindMe, setRemindMe] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);

  // Animation values for dragging
  const translateY = useRef(new Animated.Value(0)).current;

  const tags = [
    { id: 1, name: 'Tag', color: '#DC2626' },
    { id: 2, name: 'Tag', color: '#D97706' },
    { id: 3, name: 'Tag', color: '#059669' },
  ];

  // Pan responder for drag handle
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical drags
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          // If dragged down more than 100 pixels, close the modal
          Animated.timing(translateY, {
            toValue: MODAL_HEIGHT,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            translateY.setValue(0);
            onClose();
          });
        } else {
          // Otherwise, snap back to position
          Animated.spring(translateY, {
            toValue: 0,
            tension: 40,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const toggleTag = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleCreateEvent = () => {
    if (!eventName.trim()) {
      return;
    }

    const eventData = {
      name: eventName,
      notes,
      date: selectedDate,
      startTime,
      endTime,
      remindMe,
      tags: selectedTags,
    };
    
    onCreateEvent(eventData);
    
    // Reset form
    setEventName('');
    setNotes('');
    setSelectedDate(new Date());
    setStartTime('10:00');
    setEndTime('11:00');
    setRemindMe(false);
    setSelectedTags([]);
    
    onClose();
  };

  const resetAndClose = () => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 0,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={resetAndClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View style={styles.modalContent}>
              {/* Drag Handle */}
              <View {...panResponder.panHandlers} style={styles.dragHandleContainer}>
                <View style={styles.dragHandle} />
              </View>

              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Event</Text>
              </View>

              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Event Name Input */}
                <TextInput
                  style={styles.input}
                  placeholder="Event name"
                  placeholderTextColor="#666666"
                  value={eventName}
                  onChangeText={setEventName}
                />

                {/* Notes Input */}
                <TextInput
                  style={[styles.input, styles.notesInput]}
                  placeholder="Type note here..."
                  placeholderTextColor="#666666"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                {/* Date Picker */}
                <TouchableOpacity style={styles.dateTimeInput}>
                  <Text style={styles.dateTimeText}>Date</Text>
                  <View style={styles.dateTimeValue}>
                    <Ionicons name="calendar-outline" size={20} color="#666666" />
                  </View>
                </TouchableOpacity>

                {/* Time Pickers */}
                <View style={styles.timeRow}>
                  <TouchableOpacity style={[styles.timeInput, { marginRight: 10 }]}>
                    <Text style={styles.timeLabel}>Start Time</Text>
                    <View style={styles.timeValue}>
                      <Ionicons name="time-outline" size={20} color="#666666" />
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.timeInput, { marginLeft: 10 }]}>
                    <Text style={styles.timeLabel}>End Time</Text>
                    <View style={styles.timeValue}>
                      <Ionicons name="time-outline" size={20} color="#666666" />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Remind Me Toggle */}
                <View style={styles.remindRow}>
                  <Text style={styles.remindText}>Remind me</Text>
                  <Switch
                    value={remindMe}
                    onValueChange={setRemindMe}
                    trackColor={{ false: '#333333', true: '#7B9F8C' }}
                    thumbColor={remindMe ? '#FFFFFF' : '#666666'}
                    ios_backgroundColor="#333333"
                  />
                </View>

                {/* Tags */}
                <View style={styles.tagsSection}>
                  <Text style={styles.tagsTitle}>Tags</Text>
                  <View style={styles.tagsRow}>
                    {tags.map(tag => (
                      <TouchableOpacity
                        key={tag.id}
                        style={[
                          styles.tag,
                          { borderColor: tag.color },
                          selectedTags.includes(tag.id) && { backgroundColor: tag.color }
                        ]}
                        onPress={() => toggleTag(tag.id)}
                      >
                        <Text style={[
                          styles.tagText,
                          selectedTags.includes(tag.id) && styles.tagTextActive
                        ]}>
                          {tag.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Create Event Button */}
                <TouchableOpacity 
                  style={styles.createButton}
                  onPress={handleCreateEvent}
                >
                  <Text style={styles.createButtonText}>Create Event</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: MODAL_HEIGHT,
  },
  keyboardView: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#666666',
    borderRadius: 2,
  },
  modalHeader: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  input: {
    backgroundColor: '#000000',
    borderRadius: 20,
    padding: 15,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333333',
  },
  notesInput: {
    height: 120,
    paddingTop: 15,
    borderRadius: 20,
  },
  dateTimeInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333333',
  },
  dateTimeText: {
    color: '#999999',
    fontSize: 16,
  },
  dateTimeValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  timeInput: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333333',
  },
  timeLabel: {
    color: '#999999',
    fontSize: 16,
  },
  timeValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  remindRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  remindText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  tagsSection: {
    marginBottom: 30,
  },
  tagsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 15,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tag: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  tagTextActive: {
    color: '#000000',
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: '#7B9F8C',
    borderRadius: 30,
    padding: 18,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AddEventModal;