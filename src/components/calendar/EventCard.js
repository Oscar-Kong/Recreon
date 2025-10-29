import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';

const EventCard = ({ event, onPress, onLongPress }) => {
  const handleLongPress = () => {
    if (onLongPress) {
      onLongPress(event);
    } else if (event.isCreator) {
      // Show action menu for creator
      Alert.alert(
        event.name || event.title,
        'Event Options',
        [
          { text: 'Edit Event', onPress: () => console.log('Edit event:', event.id) },
          { text: 'Cancel Event', onPress: () => console.log('Cancel event:', event.id), style: 'destructive' },
          { text: 'Close', style: 'cancel' }
        ]
      );
    }
  };

  // Format participants display
  const participantsText = event.maxParticipants 
    ? `${event.participants || 0}/${event.maxParticipants}`
    : `${event.participants || 0}`;

  // Get event type badge color
  const getTypeBadgeColor = (type) => {
    const colors = {
      'practice': '#D97706',
      'social': '#059669',
      'tournament': '#DC2626',
      'league': '#2563EB',
    };
    return colors[type?.toLowerCase()] || '#666666';
  };

  // Get event title safely
  const eventTitle = event.title || event.name || 'Untitled Event';

  // Format the date for display
  const formatEventDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Check if it's today or tomorrow
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      // Format as "Mon, Dec 25"
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      onLongPress={handleLongPress}
      delayLongPress={500}
    >
      <View style={[styles.colorIndicator, { backgroundColor: event.color || '#7B9F8C' }]} />
      <View style={styles.content}>
        {/* Header: Date, Time and Type */}
        <View style={styles.header}>
          {event.startTime && (
            <Text style={styles.date}>{formatEventDate(event.startTime)}</Text>
          )}
          {event.time && <Text style={styles.time}>• {event.time}</Text>}
          {event.eventType && (
            <View style={[styles.typeBadge, { backgroundColor: getTypeBadgeColor(event.eventType) }]}>
              <Text style={styles.typeBadgeText}>{event.eventType?.toUpperCase()}</Text>
            </View>
          )}
        </View>

        {/* Event Title */}
        <Text style={styles.title}>{eventTitle}</Text>

        {/* Sport Name */}
        {event.sport && (
          <View style={styles.infoRow}>
            <Ionicons name="tennisball-outline" size={14} color="#7B9F8C" />
            <Text style={styles.infoText}>{event.sport}</Text>
          </View>
        )}

        {/* Location/Venue */}
        {(event.venue || event.location) && (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={14} color="#999999" />
            <Text style={styles.locationText} numberOfLines={1}>
              {event.venue || event.location}
            </Text>
          </View>
        )}

        {/* Participants Count */}
        <View style={styles.infoRow}>
          <Ionicons name="people-outline" size={14} color="#999999" />
          <Text style={styles.participantsText}>{participantsText} players</Text>
        </View>

        {/* Skill Level Range (if available) */}
        {event.skillLevelRange && typeof event.skillLevelRange === 'string' && (
          <View style={styles.infoRow}>
            <Ionicons name="bar-chart-outline" size={14} color="#999999" />
            <Text style={styles.infoText}>{event.skillLevelRange}</Text>
          </View>
        )}
      </View>

      {/* Creator Badge or More Button */}
      {event.isCreator ? (
        <View style={styles.creatorBadge}>
          <Ionicons name="star" size={16} color="#D97706" />
        </View>
      ) : (
        <TouchableOpacity style={styles.moreButton} onPress={handleLongPress}>
          <Ionicons name="ellipsis-vertical" size={20} color="#666666" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  colorIndicator: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
    flexWrap: 'wrap',
  },
  date: {
    color: '#7B9F8C',
    fontSize: 14,
    fontWeight: '600',
  },
  time: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  infoText: {
    color: '#7B9F8C',
    fontSize: 13,
    fontWeight: '500',
  },
  locationText: {
    color: '#999999',
    fontSize: 13,
    flex: 1,
  },
  participantsText: {
    color: '#999999',
    fontSize: 13,
  },
  moreButton: {
    padding: 5,
    marginLeft: 8,
  },
  creatorBadge: {
    padding: 5,
    marginLeft: 8,
  },
});

export default EventCard;