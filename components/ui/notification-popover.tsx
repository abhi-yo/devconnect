"use client";

import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useNotification } from "@/app/providers/NotificationProvider";

export type Notification = {
  id: string;
  title: string;
  body: string;
  link?: string | null;
  isRead: boolean;
  createdAt: Date;
};

interface NotificationItemProps {
  notification: Notification;
  index: number;
  onMarkAsRead: (id: string) => void;
  textColor?: string;
  hoverBgColor?: string;
  dotColor?: string;
}

const NotificationItem = ({
  notification,
  index,
  onMarkAsRead,
  textColor = "text-foreground",
  dotColor = "bg-primary",
  hoverBgColor = "hover:bg-muted",
}: NotificationItemProps) => (
  <motion.div
    initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
    key={notification.id}
    className={cn(`p-4 ${hoverBgColor} cursor-pointer transition-colors`)}
    onClick={() => onMarkAsRead(notification.id)}
  >
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-2">
        {!notification.isRead && (
          <span className={`h-1 w-1 rounded-full ${dotColor}`} />
        )}
        <h4 className={`text-sm font-medium ${textColor}`}>
          {notification.title}
        </h4>
      </div>

      <span className={`text-xs opacity-80 ${textColor}`}>
        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
      </span>
    </div>
    <p className={`text-xs opacity-70 mt-1 ${textColor}`}>
      {notification.body}
    </p>
  </motion.div>
);

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  textColor?: string;
  hoverBgColor?: string;
  dividerColor?: string;
}

const NotificationList = ({
  notifications,
  onMarkAsRead,
  textColor,
  hoverBgColor,
  dividerColor = "divide-border",
}: NotificationListProps) => (
  <div className={`divide-y ${dividerColor}`}>
    {notifications.map((notification, index) => (
      <NotificationItem
        key={notification.id}
        notification={notification}
        index={index}
        onMarkAsRead={onMarkAsRead}
        textColor={textColor}
        hoverBgColor={hoverBgColor}
      />
    ))}
  </div>
);

interface NotificationPopoverProps {
  buttonClassName?: string;
  popoverClassName?: string;
  textColor?: string;
  hoverBgColor?: string;
  dividerColor?: string;
  headerBorderColor?: string;
}

export const NotificationPopover = ({
  buttonClassName = "w-10 h-10 rounded-xl bg-background hover:bg-muted",
  popoverClassName = "bg-background/95 backdrop-blur-sm",
  textColor = "text-foreground",
  hoverBgColor = "hover:bg-muted",
  dividerColor = "divide-border",
  headerBorderColor = "border-border",
}: NotificationPopoverProps) => {
  const router = useRouter();
  const { unreadCount, setUnreadCount } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const utils = trpc.useContext();

  const { data, isLoading } = trpc.notification.getAll.useQuery(
    { limit: 10 },
    {
      enabled: isOpen,
    }
  );

  const { mutate: markAsRead } = trpc.notification.markAsRead.useMutation({
    onSuccess: () => {
      if (unreadCount > 0) {
        setUnreadCount(unreadCount - 1);
      }
      utils.notification.getAll.invalidate();
    },
  });

  const { mutate: markAllAsRead } = trpc.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      setUnreadCount(0);
      utils.notification.getAll.invalidate();
    },
  });

  const handleNotificationClick = (id: string) => {
    const notification = data?.notifications.find((n) => n.id === id);
    if (!notification) return;

    if (!notification.isRead) {
      markAsRead({ id });
    }
    if (notification.link) {
      setIsOpen(false);
      router.push(notification.link);
    }
  };

  const notifications = data?.notifications || [];

  return (
    <div className={`relative ${textColor}`}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className={cn("relative", buttonClassName)}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
            {unreadCount}
          </div>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute right-0 mt-2 w-80 max-h-[400px] overflow-y-auto rounded-xl shadow-lg",
              popoverClassName
            )}
          >
            <div
              className={`p-4 border-b ${headerBorderColor} flex justify-between items-center`}
            >
              <h3 className="text-sm font-medium">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  onClick={() => markAllAsRead()}
                  variant="ghost"
                  size="sm"
                  className={`text-xs ${hoverBgColor}`}
                >
                  Mark all as read
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No notifications
              </div>
            ) : (
              <NotificationList
                notifications={notifications}
                onMarkAsRead={handleNotificationClick}
                textColor={textColor}
                hoverBgColor={hoverBgColor}
                dividerColor={dividerColor}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 