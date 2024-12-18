import React from 'react';
import { CheckCircle, Info, AlertTriangle, XCircle } from 'lucide-react';
import { formatNotificationMessage, formatNotificationDate } from '../utils/notificationFormatting';

interface NotificationItemProps {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  isRead: boolean;
  created_at: string; // Changed from Date to string to match API response
  onMarkAsRead: (id: number) => void;
}

export default function NotificationItem({
  id,
  title,
  message,
  type,
  isRead,
  created_at, // Updated parameter name
  onMarkAsRead
}: NotificationItemProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const handleClick = () => {
    if (!isRead) {
      onMarkAsRead(id);
    }
  };

  // Format the notification content
  const formattedContent = formatNotificationMessage(message);

  return (
    <div
      className={`p-4 cursor-pointer transition-colors duration-200 ${
        !isRead ? 'bg-indigo-50 hover:bg-indigo-100' : 'hover:bg-gray-50'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">
            {formattedContent.title}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {formattedContent.message}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {formatNotificationDate(created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}