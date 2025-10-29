// src/components/calendar/CalendarView.js
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CalendarView = ({ selectedDate, onDateSelect, events }) => {
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get day of week (0-6, where 0 is Sunday)
    // Convert to Monday-first (0-6, where 0 is Monday)
    let startingDayOfWeek = firstDay.getDay() - 1;
    if (startingDayOfWeek === -1) startingDayOfWeek = 6; // Sunday becomes 6
    
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
          new Date(event.date).toDateString() === date.toDateString()
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
          <View key={day} style={styles.weekDayCell}>
            <Text style={styles.weekDay}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.daysGrid}>
        {days.map(({ date, key, hasEvents }) => (
          <TouchableOpacity
            key={key}
            style={styles.dayCell}
            onPress={() => date && onDateSelect(date)}
            disabled={!date}
          >
            <View style={[
              styles.dayContent,
              isSelected(date) && styles.selectedDay,
              isToday(date) && styles.todayDay,
            ]}>
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
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekDayCell: {
    width: '14.28%',
    alignItems: 'center',
  },
  weekDay: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%', // Exactly 1/7 of container width
    aspectRatio: 1,
    padding: 2,
  },
  dayContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  selectedDay: {
    backgroundColor: '#7B9F8C',
  },
  todayDay: {
    borderWidth: 1.5,
    borderColor: '#7B9F8C',
    backgroundColor: '#7B9F8C20',
  },
  dayText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  selectedDayText: {
    color: '#000000',
    fontWeight: '600',
  },
  todayDayText: {
    color: '#000000',
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