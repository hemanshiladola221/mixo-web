import React, { createContext, useContext } from "react";
import { toast, Toaster } from "sonner";

const NotificationContext = createContext();

export const useNotificationContext = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const openNotification = (
    type = "info",
    message = "Hello",
    description = "Hello"
  ) => {
    switch (type) {
      case "success":
        toast.success(message, { description });
        break;
      case "error":
        toast.error(message, { description });
        break;
      case "warning":
        toast.warning(message, { description });
        break;
      case "info":
      default:
        toast(message, { description });
        break;
    }
  };

  return (
    <NotificationContext.Provider value={{ openNotification }}>
      <Toaster richColors position="top-right" />
      {children}
    </NotificationContext.Provider>
  );
};
