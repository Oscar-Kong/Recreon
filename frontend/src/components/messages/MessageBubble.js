import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';

const MessageBubble = ({ message, isCurrentUser }) => {
  return (
    <View style={[
      styles.container, 
      isCurrentUser ? styles.currentUser : styles.otherUser
    ]}>
      <Text style={[
        styles.messageText,
        isCurrentUser ? styles.currentUserText : styles.otherUserText
      ]}>
        {message.content}
      </Text>
      <Text style={styles.timestamp}>
        {new Date(message.createdAt).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  currentUser: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  otherUser: {
    backgroundColor: Colors.card,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  currentUserText: {
    color: Colors.background,
  },
  otherUserText: {
    color: Colors.text,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.7,
    alignSelf: 'flex-end',
  },
});

export default MessageBubble;