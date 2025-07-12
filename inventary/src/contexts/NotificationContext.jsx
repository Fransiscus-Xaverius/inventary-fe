import { createContext, useState } from "react";
import { NOTIFICATION_TYPES } from "../constants/notificationTypes";

// Create the notification context
export const NotificationContext = createContext();

// Notification Provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Add a new notification
  const showNotification = (message, type = NOTIFICATION_TYPES.INFO, duration = 3000, options = {}) => {
    const id = Date.now();

    // Support for additional properties like onClose callback
    const notification = {
      id,
      message,
      type,
      duration,
      ...options,
    };

    setNotifications((prev) => [...prev, notification]);

    // Auto-dismiss the notification after duration
    if (duration !== 0) {
      setTimeout(() => {
        dismissNotification(id);
        // Call onClose callback if provided
        if (notification.onClose) {
          notification.onClose();
        }
      }, duration);
    }

    return id;
  };

  // Convenience methods for different notification types
  const showSuccess = (message, duration, options) =>
    showNotification(message, NOTIFICATION_TYPES.SUCCESS, duration, options);

  const showError = (message, duration, options) =>
    showNotification(message, NOTIFICATION_TYPES.ERROR, duration, options);

  const showWarning = (message, duration, options) =>
    showNotification(message, NOTIFICATION_TYPES.WARNING, duration, options);

  const showInfo = (message, duration, options) =>
    showNotification(message, NOTIFICATION_TYPES.INFO, duration, options);

  // Dismiss a notification by id
  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // The context value that will be provided
  const contextValue = {
    notifications,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismissNotification,
    clearAllNotifications,
  };

  return <NotificationContext.Provider value={contextValue}>{children}</NotificationContext.Provider>;
};
