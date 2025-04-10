"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Heart, MessageCircle, UserPlus, Bell } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc/client";

interface Notification {
  id: string;
  title: string;
  body: string;
  link?: string | null;
  image?: string | null;
  read: boolean;
  createdAt: Date;
  userId: string;
}

export function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all");

  // tRPC hooks
  const notificationsQuery = trpc.notification.getAll.useQuery({ limit: 50 }, {
    onError: (error) => {
      console.error("Failed to fetch notifications:", error);
    }
  });

  const markAllReadMutation = trpc.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      notificationsQuery.refetch();
    },
    onError: (error) => {
      console.error("Failed to mark notifications as read:", error);
    }
  });

  // Helper function to transform notification data from API to component format
  const formatNotification = (notification: any): Notification => {
    return {
      id: notification.id,
      title: notification.title,
      body: notification.body,
      link: notification.link ?? undefined,
      image: notification.image ?? undefined,
      read: notification.read,
      createdAt: notification.createdAt instanceof Date 
        ? notification.createdAt 
        : new Date(notification.createdAt),
      userId: notification.userId
    };
  };

  const getFilteredNotifications = () => {
    const notificationsData = notificationsQuery.data?.notifications || [];
    const formattedNotifications = notificationsData.map(formatNotification);
    
    if (activeTab === "all") return formattedNotifications;
    
    return formattedNotifications.filter(notification => {
      const title = notification.title.toLowerCase();
      if (activeTab === "mentions" && title.includes("mention")) return true;
      if (activeTab === "likes" && title.includes("like")) return true;
      if (activeTab === "comments" && title.includes("comment")) return true;
      if (activeTab === "follows" && title.includes("follow")) return true;
      return false;
    });
  };

  const markAllAsRead = async () => {
    markAllReadMutation.mutate();
  };

  const renderNotificationIcon = (notification: Notification) => {
    const title = notification.title.toLowerCase();
    
    if (title.includes("like")) {
      return <Heart className="h-5 w-5 text-rose-500" />;
    } else if (title.includes("comment")) {
      return <MessageCircle className="h-5 w-5 text-blue-500" />;
    } else if (title.includes("follow")) {
      return <UserPlus className="h-5 w-5 text-green-500" />;
    } else if (title.includes("mention")) {
      return <User className="h-5 w-5 text-purple-500" />;
    } else {
      return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const hasUnreadNotifications = filteredNotifications.some(n => !n.read);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={markAllAsRead}
          disabled={!hasUnreadNotifications || markAllReadMutation.isLoading}
        >
          {markAllReadMutation.isLoading ? "Marking..." : "Mark all as read"}
        </Button>
      </div>

      <Tabs 
        defaultValue="all"
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="mentions">Mentions</TabsTrigger>
          <TabsTrigger value="likes">Likes</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="follows">Follows</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {notificationsQuery.isLoading ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Loading notifications...</p>
            </Card>
          ) : filteredNotifications.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No notifications to display</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`p-4 ${!notification.read ? 'bg-muted/30' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={notification.image || undefined} 
                          alt="Notification"
                        />
                        <AvatarFallback>
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex items-start gap-2">
                        <div className="flex-grow">
                          <p className="text-sm font-medium">
                            {notification.title}
                          </p>
                          
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.body}
                          </p>
                          
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.createdAt.toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="flex-shrink-0 bg-muted/30 rounded-full p-2">
                          {renderNotificationIcon(notification)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 