// src/components/profile/AddSportModal.js
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { sportsService } from '../../services/sportsService';

const SKILL_LEVELS = [
  { value: 'BEGINNER', label: 'Beginner', color: '#666666' },
  { value: 'INTERMEDIATE', label: 'Intermediate', color: '#7B9F8C' },
  { value: 'ADVANCED', label: 'Advanced', color: '#D97706' },
  { value: 'EXPERT', label: 'Expert', color: '#DC2626' },
  { value: 'PROFESSIONAL', label: 'Professional', color: '#9333EA' },
];

const AddSportModal = ({ visible, onClose, onAdd, existingSportIds = [] }) => {
  const [loading, setLoading] = useState(false);
  const [sports, setSports] = useState([]);
  const [selectedSport, setSelectedSport] = useState(null);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState(null);
  const [yearsPlaying, setYearsPlaying] = useState(null);

  useEffect(() => {
    if (visible) {
      fetchSports();
    }
  }, [visible]);

  const fetchSports = async () => {
    try {
      setLoading(true);
      const data = await sportsService.getAllSports();
      // data returns { sports: [...], count: ... }
      const allSports = data.sports || [];
      // Filter out sports user already has
      const availableSports = allSports.filter(sport => !existingSportIds.includes(sport.id));
      setSports(availableSports);
    } catch (error) {
      console.error('Error fetching sports:', error);
      Alert.alert('Error', 'Failed to load sports');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSport = async () => {
    if (!selectedSport || !selectedSkillLevel) {
      Alert.alert('Missing Information', 'Please select a sport and skill level');
      return;
    }

    try {
      setLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      await onAdd({
        sportId: selectedSport.id,
        skillLevel: selectedSkillLevel,
        yearsPlaying: yearsPlaying || 0,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Reset state
      setSelectedSport(null);
      setSelectedSkillLevel(null);
      setYearsPlaying(null);
      
      onClose();
    } catch (error) {
      console.error('Error adding sport:', error);
      Alert.alert('Error', error.error || 'Failed to add sport');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const getSportIcon = (category) => {
    const icons = {
      racquet: 'tennisball-outline',
      team: 'football-outline',
      individual: 'person-outline',
      combat: 'fitness-outline',
      water: 'water-outline',
    };
    return icons[category] || 'basketball-outline';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Sport</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7B9F8C" />
              </View>
            ) : (
              <>
                {/* Select Sport */}
                <Text style={styles.sectionTitle}>Select Sport</Text>
                {sports.length === 0 ? (
                  <Text style={styles.emptyText}>No more sports available to add</Text>
                ) : (
                  sports.map((sport) => (
                    <TouchableOpacity
                      key={sport.id}
                      style={[
                        styles.sportOption,
                        selectedSport?.id === sport.id && styles.sportOptionSelected,
                      ]}
                      onPress={() => {
                        setSelectedSport(sport);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      <View style={styles.sportInfo}>
                        <Ionicons
                          name={getSportIcon(sport.category)}
                          size={24}
                          color={selectedSport?.id === sport.id ? '#7B9F8C' : '#FFFFFF'}
                        />
                        <View style={styles.sportDetails}>
                          <Text style={styles.sportName}>{sport.displayName}</Text>
                          <Text style={styles.sportCategory}>{sport.category}</Text>
                        </View>
                      </View>
                      {selectedSport?.id === sport.id && (
                        <Ionicons name="checkmark-circle" size={24} color="#7B9F8C" />
                      )}
                    </TouchableOpacity>
                  ))
                )}

                {selectedSport && (
                  <>
                    {/* Select Skill Level */}
                    <Text style={styles.sectionTitle}>Skill Level</Text>
                    {SKILL_LEVELS.map((level) => (
                      <TouchableOpacity
                        key={level.value}
                        style={[
                          styles.skillOption,
                          selectedSkillLevel === level.value && styles.skillOptionSelected,
                        ]}
                        onPress={() => {
                          setSelectedSkillLevel(level.value);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                      >
                        <View style={styles.skillInfo}>
                          <View
                            style={[styles.skillIndicator, { backgroundColor: level.color }]}
                          />
                          <Text style={styles.skillLabel}>{level.label}</Text>
                        </View>
                        {selectedSkillLevel === level.value && (
                          <Ionicons name="checkmark-circle" size={24} color="#7B9F8C" />
                        )}
                      </TouchableOpacity>
                    ))}

                    {/* Years Playing (Optional) */}
                    <Text style={styles.sectionTitle}>Years Playing (Optional)</Text>
                    <View style={styles.yearsRow}>
                      {[0, 1, 2, 3, 5, 10, 15, 20].map((years) => (
                        <TouchableOpacity
                          key={years}
                          style={[
                            styles.yearButton,
                            yearsPlaying === years && styles.yearButtonSelected,
                          ]}
                          onPress={() => {
                            setYearsPlaying(years);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }}
                        >
                          <Text
                            style={[
                              styles.yearText,
                              yearsPlaying === years && styles.yearTextSelected,
                            ]}
                          >
                            {years === 0 ? 'New' : `${years}+`}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                <View style={{ height: 100 }} />
              </>
            )}
          </ScrollView>

          {/* Add Button */}
          {selectedSport && selectedSkillLevel && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddSport}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <Text style={styles.addButtonText}>Add Sport</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 16,
  },
  emptyText: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  sportOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0D0D0D',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sportOptionSelected: {
    borderColor: '#7B9F8C',
    backgroundColor: '#7B9F8C15',
  },
  sportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sportDetails: {
    marginLeft: 12,
    flex: 1,
  },
  sportName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  sportCategory: {
    fontSize: 13,
    color: '#666666',
    textTransform: 'capitalize',
  },
  skillOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0D0D0D',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  skillOptionSelected: {
    borderColor: '#7B9F8C',
    backgroundColor: '#7B9F8C15',
  },
  skillInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  skillLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  yearsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  yearButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0D0D0D',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  yearButtonSelected: {
    borderColor: '#7B9F8C',
    backgroundColor: '#7B9F8C15',
  },
  yearText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  yearTextSelected: {
    color: '#7B9F8C',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  addButton: {
    backgroundColor: '#7B9F8C',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});

export default AddSportModal;

