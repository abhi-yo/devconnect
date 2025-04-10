"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

interface ProfileSettings {
  name: string;
  username: string;
  bio: string;
  email: string;
  location: string;
  website: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  emailDigest: boolean;
  emailComments: boolean;
  emailMentions: boolean;
  browserNotifications: boolean;
  browserLikes: boolean;
  browserComments: boolean;
  browserFollows: boolean;
}

export function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  
  const [profileForm, setProfileForm] = useState<ProfileSettings>({
    name: "",
    username: "",
    bio: "",
    email: "",
    location: "",
    website: ""
  });
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: false,
    emailDigest: false,
    emailComments: false,
    emailMentions: false,
    browserNotifications: false,
    browserLikes: false,
    browserComments: false,
    browserFollows: false
  });
  
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  
  // Fetch profile settings
  useEffect(() => {
    const fetchProfileSettings = async () => {
      try {
        setIsLoadingProfile(true);
        const response = await fetch('/api/settings/profile');
        if (response.ok) {
          const data = await response.json();
          setProfileForm(data);
        }
      } catch (error) {
        console.error("Failed to fetch profile settings:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfileSettings();
  }, []);

  // Fetch notification settings
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        setIsLoadingNotifications(true);
        const response = await fetch('/api/settings/notifications');
        if (response.ok) {
          const data = await response.json();
          setNotificationSettings(data);
        }
      } catch (error) {
        console.error("Failed to fetch notification settings:", error);
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    fetchNotificationSettings();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (setting: keyof NotificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const saveProfileSettings = async () => {
    try {
      setIsSavingProfile(true);
      const response = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileForm)
      });
      
      if (!response.ok) {
        console.error("Failed to save profile settings");
      }
    } catch (error) {
      console.error("Error saving profile settings:", error);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const saveNotificationSettings = async () => {
    try {
      setIsSavingNotifications(true);
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationSettings)
      });
      
      if (!response.ok) {
        console.error("Failed to save notification settings");
      }
    } catch (error) {
      console.error("Error saving notification settings:", error);
    } finally {
      setIsSavingNotifications(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        
        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card className="p-6">
            {isLoadingProfile ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">Loading profile settings...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src={session?.user?.image || undefined} 
                      alt={session?.user?.name || "User"} 
                    />
                    <AvatarFallback>
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-medium">Profile Picture</h2>
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload a new profile picture
                    </p>
                    <Button variant="outline" size="sm">
                      Change Picture
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Name
                      </label>
                      <Input 
                        id="name"
                        name="name"
                        value={profileForm.name}
                        onChange={handleProfileChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="username" className="text-sm font-medium">
                        Username
                      </label>
                      <Input 
                        id="username"
                        name="username"
                        value={profileForm.username}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="bio" className="text-sm font-medium">
                      Bio
                    </label>
                    <Textarea 
                      id="bio"
                      name="bio"
                      rows={4}
                      value={profileForm.bio}
                      onChange={handleProfileChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input 
                      id="email"
                      name="email"
                      type="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="location" className="text-sm font-medium">
                        Location
                      </label>
                      <Input 
                        id="location"
                        name="location"
                        value={profileForm.location}
                        onChange={handleProfileChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="website" className="text-sm font-medium">
                        Website
                      </label>
                      <Input 
                        id="website"
                        name="website"
                        value={profileForm.website}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={saveProfileSettings}
                      disabled={isSavingProfile}
                    >
                      {isSavingProfile ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card className="p-6">
            {isLoadingNotifications ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">Loading notification settings...</p>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold mb-6">Email Notifications</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">
                        Email Notifications
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Receive email notifications
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={() => handleNotificationChange('emailNotifications')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">
                        Weekly Digest
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Receive a weekly summary of activity
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailDigest}
                      onCheckedChange={() => handleNotificationChange('emailDigest')}
                      disabled={!notificationSettings.emailNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">
                        Comments
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails when someone comments on your posts
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailComments}
                      onCheckedChange={() => handleNotificationChange('emailComments')}
                      disabled={!notificationSettings.emailNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">
                        Mentions
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails when someone mentions you
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailMentions}
                      onCheckedChange={() => handleNotificationChange('emailMentions')}
                      disabled={!notificationSettings.emailNotifications}
                    />
                  </div>
                </div>
                
                <h2 className="text-lg font-bold mt-8 mb-6">Browser Notifications</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">
                        Browser Notifications
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Receive browser notifications
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.browserNotifications}
                      onCheckedChange={() => handleNotificationChange('browserNotifications')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">
                        Likes
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications when someone likes your posts
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.browserLikes}
                      onCheckedChange={() => handleNotificationChange('browserLikes')}
                      disabled={!notificationSettings.browserNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">
                        Comments
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications when someone comments on your posts
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.browserComments}
                      onCheckedChange={() => handleNotificationChange('browserComments')}
                      disabled={!notificationSettings.browserNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">
                        Follows
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications when someone follows you
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.browserFollows}
                      onCheckedChange={() => handleNotificationChange('browserFollows')}
                      disabled={!notificationSettings.browserNotifications}
                    />
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <Button 
                      onClick={saveNotificationSettings}
                      disabled={isSavingNotifications}
                    >
                      {isSavingNotifications ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </TabsContent>
        
        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-6">Theme Preferences</h2>
            
            <div className="grid grid-cols-3 gap-4">
              <div 
                className={`p-4 border rounded-lg text-center cursor-pointer transition-all ${
                  theme === 'light' ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground'
                }`}
                onClick={() => setTheme('light')}
              >
                <Sun className="h-6 w-6 mx-auto mb-2" />
                <p className="font-medium">Light</p>
              </div>
              
              <div 
                className={`p-4 border rounded-lg text-center cursor-pointer transition-all ${
                  theme === 'dark' ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground'
                }`}
                onClick={() => setTheme('dark')}
              >
                <Moon className="h-6 w-6 mx-auto mb-2" />
                <p className="font-medium">Dark</p>
              </div>
              
              <div 
                className={`p-4 border rounded-lg text-center cursor-pointer transition-all ${
                  theme === 'system' ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground'
                }`}
                onClick={() => setTheme('system')}
              >
                <Monitor className="h-6 w-6 mx-auto mb-2" />
                <p className="font-medium">System</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 