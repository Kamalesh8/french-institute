"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRealtime } from "@/context/realtime-context";
import { useAuth } from "@/context/auth-context";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/services/notification-service";
import type { Notification } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import {
  FaBell,
  FaEnvelope,
  FaCheck,
  FaGraduationCap,
  FaBook,
  FaCertificate,
  FaExclamationCircle,
} from "react-icons/fa";

export default function NotificationCenter() {
  const { user } = useAuth();
  const { unreadNotifications, unreadMessages } = useRealtime();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      loadNotifications();
    }
  }, [user, isOpen]);

  const loadNotifications = async () => {
    if (!user) return;
    const userNotifications = await getUserNotifications(user.uid);
    setNotifications(userNotifications);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    loadNotifications();
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    await markAllNotificationsAsRead(user.uid);
    loadNotifications();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "course":
        return <FaBook className="h-4 w-4 text-blue-500" />;
      case "achievement":
        return <FaCertificate className="h-4 w-4 text-yellow-500" />;
      case "message":
        return <FaEnvelope className="h-4 w-4 text-green-500" />;
      default:
        return <FaExclamationCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setIsOpen(true)}
        >
          <FaBell className="h-5 w-5" />
          {(unreadNotifications > 0 || unreadMessages > 0) && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {unreadNotifications + unreadMessages}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex justify-between items-center">
            <span>Notifications</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-sm"
            >
              Mark all as read
            </Button>
          </SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="all" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadNotifications})
            </TabsTrigger>
            <TabsTrigger value="messages">
              Messages ({unreadMessages})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <ScrollArea className="h-[500px] pr-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start space-x-4 p-4 rounded-lg mb-2 ${
                    notification.read
                      ? "bg-secondary/50"
                      : "bg-secondary"
                  }`}
                >
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium">
                        {notification.title}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <FaCheck className="h-4 w-4 mr-1" />
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="unread">
            <ScrollArea className="h-[500px] pr-4">
              {notifications
                .filter((n) => !n.read)
                .map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start space-x-4 p-4 bg-secondary rounded-lg mb-2"
                  >
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium">
                          {notification.title}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <FaCheck className="h-4 w-4 mr-1" />
                        Mark as read
                      </Button>
                    </div>
                  </div>
                ))}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="messages">
            <ScrollArea className="h-[500px] pr-4">
              {notifications
                .filter((n) => n.type === "message")
                .map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start space-x-4 p-4 rounded-lg mb-2 ${
                      notification.read
                        ? "bg-secondary/50"
                        : "bg-secondary"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <FaEnvelope className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium">
                          {notification.title}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <FaCheck className="h-4 w-4 mr-1" />
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
