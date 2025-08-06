// src/components/calendar/AddEventModal.js - OPTIMIZED VERSION
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState, useCallback, useMemo } from 'react';
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
const CLOSE_THRESHOLD = 100; // Pixels to drag before closing

const AddEventModal = ({ visible, onClose, onCreateEvent }) => {
  const [eventName, setEventName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [remindMe, setRemindMe] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);

  // Animation values - optimized with useRef
  const translateY = useRef(new Animated.Value(0)).current;
  const gestureState = useRef({ isActive: false }).current;

  // Memoized tags to prevent re-creation
  const tags = useMemo(() => [
    { id: 1, name: 'Tag', color: '#DC2626' },
    { id: 2, name: 'Tag', color: '#D97706' },
    { id: 3, name: 'Tag', color: '#059669' },
  ], []);

  // Optimized pan responder with performance improvements
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical drags greater than 5px
        return Math.abs(gestureState.dy) > 5 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderGrant: () => {
        gestureState.isActive = true;
        // Set initial value for smoother animation start
        translateY.setOffset(translateY._value);
        translateY.setValue(0);
      },
      onPanResponderMove: (_, gesture) => {
        // Only allow downward dragging and limit the range
        if (gesture.dy > 0 && gesture.dy < MODAL_HEIGHT * 0.5) {
          // Use native driver compatible animation
          translateY.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        gestureState.isActive = false;
        translateY.flattenOffset();

        if (gesture.dy > CLOSE_THRESHOLD || gesture.vy > 0.5) {
          // Close modal with faster animation
          Animated.timing(translateY, {
            toValue: MODAL_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            translateY.setValue(0);
            onClose();
          });
        } else {
          // Snap back with spring animation for better feel
          Animated.spring(translateY, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        gestureState.isActive = false;
        translateY.flattenOffset();
        // Snap back if gesture is terminated
        Animated.spring(translateY, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  // Memoized handlers to prevent re-creation
  const toggleTag = useCallback((tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  }, []);

  const handleCreateEvent = useCallback(() => {
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
  }, [eventName, notes, selectedDate, startTime, endTime, remindMe, selectedTags, onCreateEvent, onClose]);

  const resetAndClose = useCallback(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 0,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  }, [onClose, translateY]);

  // Memoized styles for better performance
  const animatedStyle = useMemo(() => ({
    transform: [{ translateY }],
  }), [translateY]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={resetAndClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[styles.modalContainer, animatedStyle]}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View style={styles.modalContent}>
              {/* Drag Handle - Only this area responds to pan gestures */}
              <View {...panResponder.panHandlers} style={styles.dragHandleContainer}>
                <View style={styles.dragHandle} />
              </View>

              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Event</Text>
              </View>

              {/* Optimized ScrollView with performance props */}
              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                scrollEventThrottle={16}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={10}
              >
                {/* Event Name Input */}
                <TextInput
                  style={styles.input}
                  placeholder="Event name"
                  placeholderTextColor="#666666"
                  value={eventName}
                  onChangeText={setEventName}
                  maxLength={100}
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
                  maxLength={500}
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
                        activeOpacity={0.7}
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
                  activeOpacity={0.8}
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
    // Remove any shadow/elevation that might cause performance issues
  },
  keyboardView: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    // Increase touch area for better gesture handling
    paddingHorizontal: 50,
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
    // Add grow property for better ScrollView performance
    flexGrow: 1,
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
    textAlignVertical: 'top',
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
    // Add shadow for better visual feedback
    shadowColor: '#7B9F8C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AddEventModal;