import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

interface SportSpecificRequirementsProps {
  sportType: string;
  onComplete: (requirements: SportRequirements) => void;
}

interface SportRequirements {
  sport: string;
  specializations: string[];
  experience: {
    years: number;
    competitionLevel: string;
    achievements: string[];
  };
  equipment: {
    owns: boolean;
    certifiedFor: string[];
  };
  availability: {
    venues: string[];
    preferredHours: string[];
  };
  additionalCertifications: any;
}

const SPORT_CONFIGS = {
  swimming: {
    specializations: [
      'Freestyle',
      'Backstroke',
      'Breaststroke',
      'Butterfly',
      'Open Water',
      'Water Polo',
      'Synchronized Swimming',
      'Aqua Therapy',
    ],
    certifications: [
      'Pool Lifeguard',
      'Beach Lifeguard',
      'Water Safety Instructor',
      'Aquatic Therapy Specialist',
    ],
    equipment: [
      'Training aids',
      'Underwater cameras',
      'Resistance equipment',
      'Timing systems',
    ],
    venues: [
      '25m Pool',
      '50m Pool',
      'Open Water',
      'Therapy Pool',
    ],
  },
  shooting: {
    specializations: [
      'Air Rifle',
      'Air Pistol',
      '.22 Rifle',
      'Shotgun',
      'Archery',
      'Crossbow',
    ],
    certifications: [
      'Range Safety Officer',
      'Firearms Instructor',
      'Competition Judge',
      'Youth Program Certified',
    ],
    equipment: [
      'Personal firearms',
      'Electronic scoring',
      'Safety equipment',
      'Training rifles',
    ],
    venues: [
      '10m Range',
      '25m Range',
      '50m Range',
      'Outdoor Range',
    ],
  },
  basketball: {
    specializations: [
      'Youth Development',
      'Skills Training',
      'Team Tactics',
      'Shooting Coach',
      'Defense Specialist',
      'Conditioning',
    ],
    certifications: [
      'FIBA License A',
      'FIBA License B',
      'Youth Coach',
      'Strength & Conditioning',
    ],
    equipment: [
      'Training cones',
      'Agility ladders',
      'Video analysis tools',
      'Shooting machines',
    ],
    venues: [
      'Indoor Court',
      'Outdoor Court',
      'Training Facility',
      'School Gym',
    ],
  },
};

export const SportSpecificRequirements: React.FC<SportSpecificRequirementsProps> = ({
  sportType,
  onComplete,
}) => {
  const config = SPORT_CONFIGS[sportType as keyof typeof SPORT_CONFIGS];
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState('');
  const [competitionLevel, setCompetitionLevel] = useState('recreational');
  const [achievements, setAchievements] = useState('');
  const [ownsEquipment, setOwnsEquipment] = useState(false);
  const [certifiedEquipment, setCertifiedEquipment] = useState<string[]>([]);
  const [selectedVenues, setSelectedVenues] = useState<string[]>([]);
  const [additionalCerts, setAdditionalCerts] = useState<Record<string, boolean>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [licenseExpiry, setLicenseExpiry] = useState(new Date());

  const toggleSpecialization = (spec: string) => {
    setSelectedSpecs(prev =>
      prev.includes(spec)
        ? prev.filter(s => s !== spec)
        : [...prev, spec]
    );
  };

  const toggleEquipment = (equip: string) => {
    setCertifiedEquipment(prev =>
      prev.includes(equip)
        ? prev.filter(e => e !== equip)
        : [...prev, equip]
    );
  };

  const toggleVenue = (venue: string) => {
    setSelectedVenues(prev =>
      prev.includes(venue)
        ? prev.filter(v => v !== venue)
        : [...prev, venue]
    );
  };

  const handleSubmit = () => {
    if (!experienceYears || selectedSpecs.length === 0 || selectedVenues.length === 0) {
      Alert.alert('Incomplete Information', 'Please fill in all required fields');
      return;
    }

    const requirements: SportRequirements = {
      sport: sportType,
      specializations: selectedSpecs,
      experience: {
        years: parseInt(experienceYears),
        competitionLevel,
        achievements: achievements.split(',').map(a => a.trim()).filter(a => a),
      },
      equipment: {
        owns: ownsEquipment,
        certifiedFor: certifiedEquipment,
      },
      availability: {
        venues: selectedVenues,
        preferredHours: [], // TODO: Add time preference selector
      },
      additionalCertifications: additionalCerts,
    };

    onComplete(requirements);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="sports" size={24} color="#2196F3" />
        <Text style={styles.headerText}>{sportType.toUpperCase()} Coaching Requirements</Text>
      </View>

      {/* Specializations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Specializations *</Text>
        <Text style={styles.sectionSubtext}>Select all areas you're qualified to teach</Text>
        <View style={styles.chipContainer}>
          {config.specializations.map((spec) => (
            <TouchableOpacity
              key={spec}
              style={[
                styles.chip,
                selectedSpecs.includes(spec) && styles.chipSelected,
              ]}
              onPress={() => toggleSpecialization(spec)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedSpecs.includes(spec) && styles.chipTextSelected,
                ]}
              >
                {spec}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Experience */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience *</Text>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Years of Experience:</Text>
          <TextInput
            style={styles.textInput}
            value={experienceYears}
            onChangeText={setExperienceYears}
            keyboardType="numeric"
            placeholder="0"
            maxLength={2}
          />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Highest Competition Level:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={competitionLevel}
              onValueChange={setCompetitionLevel}
              style={styles.picker}
            >
              <Picker.Item label="Recreational" value="recreational" />
              <Picker.Item label="Local/Club" value="club" />
              <Picker.Item label="Regional" value="regional" />
              <Picker.Item label="National" value="national" />
              <Picker.Item label="International" value="international" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputColumn}>
          <Text style={styles.inputLabel}>Notable Achievements:</Text>
          <TextInput
            style={styles.textArea}
            value={achievements}
            onChangeText={setAchievements}
            placeholder="e.g., National Champion 2020, Olympic Trial Participant"
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      {/* Equipment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Equipment & Facilities</Text>
        
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>I own professional equipment</Text>
          <Switch
            value={ownsEquipment}
            onValueChange={setOwnsEquipment}
            trackColor={{ false: '#E0E0E0', true: '#81C784' }}
            thumbColor={ownsEquipment ? '#4CAF50' : '#F5F5F5'}
          />
        </View>

        {ownsEquipment && (
          <>
            <Text style={styles.subsectionTitle}>Equipment you're certified to use:</Text>
            <View style={styles.chipContainer}>
              {config.equipment.map((equip) => (
                <TouchableOpacity
                  key={equip}
                  style={[
                    styles.chip,
                    certifiedEquipment.includes(equip) && styles.chipSelected,
                  ]}
                  onPress={() => toggleEquipment(equip)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      certifiedEquipment.includes(equip) && styles.chipTextSelected,
                    ]}
                  >
                    {equip}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>

      {/* Venue Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Venue Availability *</Text>
        <Text style={styles.sectionSubtext}>Select venues where you can coach</Text>
        <View style={styles.venueContainer}>
          {config.venues.map((venue) => (
            <TouchableOpacity
              key={venue}
              style={[
                styles.venueCard,
                selectedVenues.includes(venue) && styles.venueCardSelected,
              ]}
              onPress={() => toggleVenue(venue)}
            >
              <Icon
                name={selectedVenues.includes(venue) ? 'check-box' : 'check-box-outline-blank'}
                size={24}
                color={selectedVenues.includes(venue) ? '#2196F3' : '#BDBDBD'}
              />
              <Text style={styles.venueText}>{venue}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Additional Certifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Certifications</Text>
        {config.certifications.map((cert) => (
          <View key={cert} style={styles.certRow}>
            <Switch
              value={additionalCerts[cert] || false}
              onValueChange={(value) =>
                setAdditionalCerts(prev => ({ ...prev, [cert]: value }))
              }
              trackColor={{ false: '#E0E0E0', true: '#81C784' }}
              thumbColor={additionalCerts[cert] ? '#4CAF50' : '#F5F5F5'}
            />
            <Text style={styles.certText}>{cert}</Text>
          </View>
        ))}
      </View>

      {/* Special Requirements for Shooting */}
      {sportType === 'shooting' && (
        <View style={styles.warningSection}>
          <Icon name="warning" size={24} color="#FF6B6B" />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Additional Requirements</Text>
            <Text style={styles.warningText}>
              • Valid firearms license required{'\n'}
              • Police clearance certificate{'\n'}
              • Range insurance coverage{'\n'}
              • Annual safety recertification
            </Text>
          </View>
        </View>
      )}

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Complete Requirements</Text>
        <Icon name="arrow-forward" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#212121',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  sectionSubtext: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#424242',
    marginTop: 16,
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
  },
  chipSelected: {
    backgroundColor: '#2196F3',
  },
  chipText: {
    fontSize: 14,
    color: '#424242',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  inputColumn: {
    marginVertical: 8,
  },
  inputLabel: {
    fontSize: 16,
    color: '#424242',
    flex: 1,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    width: 80,
    textAlign: 'center',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 8,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
    flex: 1,
  },
  picker: {
    height: 50,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#424242',
  },
  venueContainer: {
    marginTop: 8,
  },
  venueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginVertical: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  venueCardSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  venueText: {
    fontSize: 16,
    color: '#424242',
    marginLeft: 12,
  },
  certRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  certText: {
    fontSize: 16,
    color: '#424242',
    marginLeft: 12,
  },
  warningSection: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 20,
    borderRadius: 12,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});