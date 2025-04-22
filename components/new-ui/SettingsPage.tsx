"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { User, Sun, Moon, Monitor, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { trpc } from "@/lib/trpc/client";
import toast from 'react-hot-toast';
import { type AppRouter } from "@/lib/trpc/root";
import { type inferRouterOutputs, type inferRouterInputs } from "@trpc/server";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type RouterInputs = inferRouterInputs<AppRouter>;

type ProfileSettingsData = RouterOutputs["user"]["getSettings"]["profile"];
type NotificationSettingsData = RouterOutputs["user"]["getSettings"]["notifications"];

type UpdateProfileInput = RouterInputs["user"]["updateProfile"];
type UpdateNotificationsInput = RouterInputs["user"]["updateNotificationSettings"];

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username?: string;
}

interface EditProfileImagesDialogProps {
  profileData: ProfileSettingsData | null;
  updateProfileMutation: ReturnType<typeof trpc.user.updateProfile.useMutation>;
}

function EditProfileImagesDialog({ 
  profileData,
  updateProfileMutation,
}: EditProfileImagesDialogProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  useEffect(() => {
    if (profileData) {
        setImageUrl(profileData.image ?? "");
        setBannerUrl(profileData.banner ?? "");
    }
  }, [profileData]);

  const handleSaveChanges = () => {
    if (!profileData) return;

    const isValidUrl = (url: string) => url === "" || url.startsWith('http://') || url.startsWith('https://');

    if (!isValidUrl(imageUrl)) {
      toast.error("Invalid Profile Picture URL. Must start with http:// or https://");
      return;
    }
    if (!isValidUrl(bannerUrl)) {
      toast.error("Invalid Banner Image URL. Must start with http:// or https://");
      return;
    }

    const updateData: UpdateProfileInput = { 
        name: profileData.name ?? "",
        bio: profileData.bio ?? null,
        location: profileData.location ?? null,
        website: profileData.website ?? null,
        github: profileData.github ?? null,
        twitter: profileData.twitter ?? null,
        image: imageUrl || null,
        banner: bannerUrl || null,
    };

    updateProfileMutation.mutate(updateData, {
        onSuccess: () => {
            toast.success("Profile images updated successfully!");
        },
    });
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Profile Images</DialogTitle>
        <DialogDescription>
          Update your profile picture and banner image. Enter the URLs for your images.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <label htmlFor="imageUrl" className="text-sm font-medium">
            Profile Picture URL
          </label>
          <Input
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            disabled={updateProfileMutation.isLoading}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="bannerUrl" className="text-sm font-medium">
            Banner Image URL
          </label>
          <Input
            id="bannerUrl"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            placeholder="https://example.com/banner.jpg"
            disabled={updateProfileMutation.isLoading}
          />
        </div>
      </div>
      <DialogFooter>
         <DialogClose asChild>
           <Button type="button" variant="outline" disabled={updateProfileMutation.isLoading}>Cancel</Button>
         </DialogClose>
        <Button 
          type="button" 
          onClick={handleSaveChanges} 
          disabled={updateProfileMutation.isLoading}
         >
          {updateProfileMutation.isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Save Changes
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user as SessionUser | undefined;
  const { theme, setTheme } = useTheme();
  const utils = trpc.useUtils();
  
  const [profileForm, setProfileForm] = useState<ProfileSettingsData | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettingsData | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  
  const { data: initialSettingsData, isLoading: isLoadingSettings } = trpc.user.getSettings.useQuery(undefined, {
    onSuccess: (data: RouterOutputs["user"]["getSettings"] | undefined) => {
      if (data) {
        setProfileForm(data.profile);
        setNotificationSettings(data.notifications);
      }
    },
    onError: (error: any) => {
      console.error("Failed to fetch settings:", error);
      toast.error("Failed to load settings.");
    },
    refetchOnWindowFocus: false,
  });

  const updateProfileMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      utils.user.getSettings.invalidate();
    },
    onError: (error: any) => {
      console.error("Error saving profile settings:", error);
      toast.error("Failed to update profile. Please try again.");
    },
  });

  const updateNotificationsMutation = trpc.user.updateNotificationSettings.useMutation({
    onSuccess: () => {
      toast.success("Notifications updated successfully!");
      utils.user.getSettings.invalidate();
    },
    onError: (error: any) => {
      console.error("Error saving notification settings:", error);
      toast.error("Failed to update notifications. Please try again.");
    },
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev: ProfileSettingsData | null) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleNotificationChange = (setting: keyof NotificationSettingsData) => {
    setNotificationSettings((prev: NotificationSettingsData | null) => {
        if (!prev) return null;
        const newState = { ...prev } as NotificationSettingsData;
        (newState[setting] as boolean) = !prev[setting];
        
        if (setting === 'emailNotifications' && !newState.emailNotifications) {
            newState.mentionNotifications = false;
            newState.followNotifications = false;
            newState.messageNotifications = false;
        }
        return newState;
    });
};

  const saveProfileSettings = () => {
    if (profileForm) {
      const updateData: UpdateProfileInput = { 
          name: profileForm.name ?? "",
          bio: profileForm.bio ?? null,
          location: profileForm.location ?? null,
          website: profileForm.website ?? null,
          github: profileForm.github ?? null,
          twitter: profileForm.twitter ?? null,
          image: profileForm.image ?? null,
          banner: profileForm.banner ?? null,
      };

      updateProfileMutation.mutate(updateData);
    }
  };

  const saveNotificationSettings = () => {
    if (notificationSettings) {
      updateNotificationsMutation.mutate(notificationSettings as UpdateNotificationsInput);
    }
  };
  
  const ProfileSkeleton = () => (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16 mb-1" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 mb-1" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-12 mb-1" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16 mb-1" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 mb-1" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 mb-1" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    </Card>
  );

  const NotificationsSkeleton = () => (
    <Card className="p-6">
      <Skeleton className="h-6 w-48 mb-8" />
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        ))}
      </div>
      <Skeleton className="h-6 w-56 mt-10 mb-8" />
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        ))}
      </div>
       <div className="flex justify-end mt-8">
          <Skeleton className="h-10 w-28" />
      </div>
    </Card>
  );

  return (
    <div className="w-full max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>
      
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
            {isLoadingSettings || !profileForm ? (
              <ProfileSkeleton />
            ) : (
            <Card className="p-6">
                <div className="flex items-center gap-4 mb-8">
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                        src={profileForm.image || user?.image || undefined} 
                        alt={profileForm.name || user?.name || "User"}
                        key={profileForm.image || user?.image}
                    />
                    <AvatarFallback>
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                      <h2 className="text-lg font-medium">Profile Info & Images</h2>
                    <p className="text-sm text-muted-foreground mb-2">
                        Edit your profile details or update image URLs.
                      </p>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                        >
                          <ImageIcon className="mr-2 h-4 w-4" />
                          Edit Images
                    </Button>
                      </DialogTrigger>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Name
                      </label>
                      <Input 
                        id="name"
                        name="name"
                        value={profileForm.name ?? ''}
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
                          value={user?.username ?? ''}
                          disabled
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
                      value={profileForm.bio ?? ''}
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
                      value={user?.email ?? ''}
                      disabled
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
                        value={profileForm.location ?? ''}
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
                        value={profileForm.website ?? ''}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={saveProfileSettings}
                        disabled={updateProfileMutation.isLoading || !profileForm}
                    >
                        {updateProfileMutation.isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Save Profile Info
                    </Button>
                  </div>
                </div>
              </Card>
            )}
        </TabsContent>
        
        <TabsContent value="notifications">
            {isLoadingSettings || !notificationSettings ? (
              <NotificationsSkeleton />
            ) : (
            <Card className="p-6">
                <h2 className="text-lg font-bold mb-8">Email Notifications</h2>
                
                <div className="space-y-6">
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
                      <label className={`text-sm font-medium ${!notificationSettings.emailNotifications ? 'text-muted-foreground/50' : ''}`}>
                        Mentions
                      </label>
                      <p className={`text-sm ${!notificationSettings.emailNotifications ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                        Receive emails when someone mentions you
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.mentionNotifications}
                      onCheckedChange={() => handleNotificationChange('mentionNotifications')}
                      disabled={!notificationSettings.emailNotifications}
                    />
                  </div>
                </div>
                
                <h2 className="text-lg font-bold mt-10 mb-8">Browser Notifications</h2>
                
                <div className="space-y-6">
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
                  </div>
                  
                <div className="flex justify-end mt-8">
                    <Button 
                      onClick={saveNotificationSettings}
                    disabled={updateNotificationsMutation.isLoading || !notificationSettings}
                    >
                    {updateNotificationsMutation.isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {updateNotificationsMutation.isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
              </Card>
            )}
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-6">Theme Preferences</h2>
            
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div 
                  className={`p-4 border rounded-lg text-center cursor-pointer transition-all flex flex-col items-center justify-center aspect-square sm:aspect-auto ${
                    theme === 'light' ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground/50'
                }`}
                onClick={() => setTheme('light')}
              >
                  <Sun className="h-6 w-6 mb-2" />
                <p className="font-medium">Light</p>
              </div>
              
              <div 
                  className={`p-4 border rounded-lg text-center cursor-pointer transition-all flex flex-col items-center justify-center aspect-square sm:aspect-auto ${ 
                    theme === 'dark' ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground/50'
                }`}
                onClick={() => setTheme('dark')}
              >
                  <Moon className="h-6 w-6 mb-2" />
                <p className="font-medium">Dark</p>
              </div>
              
              <div 
                  className={`p-4 border rounded-lg text-center cursor-pointer transition-all flex flex-col items-center justify-center aspect-square sm:aspect-auto ${ 
                    theme === 'system' ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground/50'
                }`}
                onClick={() => setTheme('system')}
              >
                  <Monitor className="h-6 w-6 mb-2" />
                <p className="font-medium">System</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

        <EditProfileImagesDialog 
          profileData={profileForm}
          updateProfileMutation={updateProfileMutation}
        />
      </Dialog>
    </div>
  );
} 