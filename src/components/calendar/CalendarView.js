import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CalendarView = ({ selectedDate, onDateSelect, events }) => {
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, key: `empty-start-${i}` });
    }
    
    // Add all days in month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({ 
        date, 
        key: `day-${i}`,
        hasEvents: events.some(event => 
          event.date.toDateString() === date.toDateString()
        )
      });
    }
    
    return days;
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const days = getDaysInMonth(selectedDate);
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <View style={styles.container}>
      {/* Week days header */}
      <View style={styles.weekDaysRow}>
        {weekDays.map((day) => (
          <Text key={day} style={styles.weekDay}>{day}</Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.daysGrid}>
        {days.map(({ date, key, hasEvents }) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.dayCell,
              isSelected(date) && styles.selectedDay,
              isToday(date) && styles.todayDay,
            ]}
            onPress={() => date && onDateSelect(date)}
            disabled={!date}
          >
            {date && (
              <>
                <Text style={[
                  styles.dayText,
                  isSelected(date) && styles.selectedDayText,
                  isToday(date) && styles.todayDayText,
                ]}>
                  {date.getDate()}
                </Text>
                {hasEvents && (
                  <View style={styles.eventIndicatorContainer}>
                    <View style={[styles.eventDot, { backgroundColor: '#DC2626' }]} />
                    <View style={[styles.eventDot, { backgroundColor: '#059669' }]} />
                  </View>
                )}
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingBottom: -5, // Add this to reduce bottom space
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekDay: {
    color: '#666666',
    fontSize: 14,
    width: 40,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  selectedDay: {
    backgroundColor: '#7B9F8C',
    borderRadius: 20,
  },
  todayDay: {
    borderWidth: 1,
    borderColor: '#7B9F8C',
    borderRadius: 20,
  },
  dayText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  todayDayText: {
    color: '#7B9F8C',
    fontWeight: '600',
  },
  eventIndicatorContainer: {
    flexDirection: 'row',
    marginTop: 2,
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 1,
  },
});

export default CalendarView;