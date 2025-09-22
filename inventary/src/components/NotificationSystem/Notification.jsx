import React from "react";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import { NOTIFICATION_TYPES } from "../../constants/notificationTypes";

// Get icon based on notification type
const getIcon = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.SUCCESS:
      return <CheckCircleIcon />;
    case NOTIFICATION_TYPES.ERROR:
      return <ErrorIcon />;
    case NOTIFICATION_TYPES.WARNING:
      return <WarningIcon />;
    case NOTIFICATION_TYPES.INFO:
    default:
      return <InfoIcon />;
  }
};

// Get the class names based on notification type
const getStyles = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.SUCCESS:
      return {
        container: "bg-green-50 border-green-400 text-green-800",
        icon: "text-green-400",
      };
    case NOTIFICATION_TYPES.ERROR:
      return {
        container: "bg-red-50 border-red-400 text-red-800",
        icon: "text-red-400",
      };
    case NOTIFICATION_TYPES.WARNING:
      return {
        container: "bg-yellow-50 border-yellow-400 text-yellow-800",
        icon: "text-yellow-400",
      };
    case NOTIFICATION_TYPES.INFO:
    default:
      return {
        container: "bg-blue-50 border-blue-400 text-blue-800",
        icon: "text-blue-400",
      };
  }
};

export default function Notification({ notification, onDismiss }) {
  const { id, message, type } = notification;
  const styles = getStyles(type);

  return (
    <div className={`${styles.container} mb-2 flex items-center rounded border px-4 py-3 shadow-md`} role="alert">
      <div className={`${styles.icon} mr-2`}>{getIcon(type)}</div>
      <div className="flex-grow">{message}</div>
      <IconButton size="small" onClick={() => onDismiss(id)} className="ml-2">
        <CloseIcon fontSize="small" />
      </IconButton>
    </div>
  );
}
