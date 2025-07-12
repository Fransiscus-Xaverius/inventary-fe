import React from "react";
import { useNotification } from "../../contexts/NotificationContext";
import Notification from "./Notification";

export default function NotificationContainer() {
  const { notifications, dismissNotification } = useNotification();

  // Don't render anything if no notifications
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-[9999] w-80">
      {notifications.map((notification) => (
        <Notification key={notification.id} notification={notification} onDismiss={dismissNotification} />
      ))}
    </div>
  );
}
