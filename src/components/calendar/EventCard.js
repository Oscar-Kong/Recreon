import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const EventCard = ({ event, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.colorIndicator, { backgroundColor: event.color }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.time}>{event.time}</Text>
          <Text style={styles.type}>| {event.type}</Text>
        </View>
        <Text style={styles.title}>{event.name}</Text>
        <Text style={styles.notes}>{event.notes}</Text>
      </View>
      <TouchableOpacity style={styles.moreButton}>
        <Text style={styles.moreButtonText}>•••</Text>
      </TouchableOpacity>
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
    alignItems: 'center',
  },
  colorIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  time: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  type: {
    color: '#666666',
    fontSize: 14,
    marginLeft: 5,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  notes: {
    color: '#666666',
    fontSize: 14,
  },
  moreButton: {
    padding: 5,
  },
  moreButtonText: {
    color: '#666666',
    fontSize: 18,
    letterSpacing: 2,
  },
});

export default EventCard;