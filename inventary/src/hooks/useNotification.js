import { useContext } from "react";
import { NotificationContext } from "../contexts/NotificationContext";

// Custom hook to access the notification context

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
