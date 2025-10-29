// src/components/common/Toast.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Toast Notification Component
 * 
 * Simple toast notification system for displaying temporary messages.
 * Supports success, error, warning, and info types.
 * 
 * Usage:
 * import Toast, { showToast } from '../components/common/Toast';
 * 
 * // In your component
 * <Toast />
 * 
 * // Show toast
 * showToast({
 *   type: 'success',
 *   message: 'Profile updated successfully!',
 *   duration: 3000
 * });
 */

// Global toast state
let toastRef = null;

export const showToast = ({ type = 'info', message, duration = 3000 }) => {
  if (toastRef) {
    toastRef.show({ type, message, duration });
  }
};

const ToastComponent = ({ type, message, onHide }) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const hide = () => {
    // Slide out animation
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'information-circle';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success':
        return '#059669';
      case 'error':
        return '#DC2626';
      case 'warning':
        return '#D97706';
      case 'info':
      default:
        return '#7B9F8C';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={[styles.toast, { borderLeftColor: getColor() }]}>
        <Ionicons name={getIcon()} size={24} color={getColor()} />
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity onPress={hide} style={styles.closeButton}>
          <Ionicons name="close" size={20} color="#999999" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

class Toast extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      type: 'info',
      message: '',
      duration: 3000,
    };
    this.timer = null;
  }

  componentDidMount() {
    toastRef = this;
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    toastRef = null;
  }

  show = ({ type, message, duration = 3000 }) => {
    // Clear existing timer
    if (this.timer) {
      clearTimeout(this.timer);
    }

    // Show new toast
    this.setState({ visible: true, type, message, duration });

    // Auto hide after duration
    this.timer = setTimeout(() => {
      this.hide();
    }, duration);
  };

  hide = () => {
    this.setState({ visible: false });
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  };

  render() {
    if (!this.state.visible) {
      return null;
    }

    return (
      <ToastComponent
        type={this.state.type}
        message={this.state.message}
        onHide={() => this.setState({ visible: false })}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 10,
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 12,
    marginRight: 8,
  },
  closeButton: {
    padding: 4,
  },
});

export default Toast;

