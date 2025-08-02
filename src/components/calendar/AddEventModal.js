// src/components/calendar/AddEventModal.js
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AddEventModal = ({ visible, onClose, onCreateEvent }) => {
  const [eventName, setEventName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [remindMe, setRemindMe] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);

  const tags = [
    { id: 1, name: 'Tag', color: '#DC2626' },
    { id: 2, name: 'Tag', color: '#D97706' },
    { id: 3, name: 'Tag', color: '#059669' },
  ];

  const toggleTag = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleCreateEvent = () => {
    if (!eventName.trim()) {
      // Add validation feedback
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            {/* Drag Handle */}
            <View style={styles.dragHandle} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Event</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
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
                  <Text style={styles.dateTimeValueText}>
                    {selectedDate.toLocaleDateString()}
                  </Text>
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
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    maxHeight: '90%',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  input: {
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 15,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333333',
  },
  notesInput: {
    height: 100,
    paddingTop: 15,
  },
  dateTimeInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333333',
  },
  dateTimeText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  dateTimeValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeValueText: {
    color: '#666666',
    fontSize: 14,
    marginRight: 10,
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
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#333333',
  },
  timeLabel: {
    color: '#FFFFFF',
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
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tag: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
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
    borderRadius: 25,
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