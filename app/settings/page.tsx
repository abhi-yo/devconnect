"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { trpc } from "@/lib/trpc/client"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/auth/signin")
    },
  })
  
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  // Get current settings
  const { data: settings, isLoading: isSettingsLoading } = trpc.user.getSettings.useQuery()

  // Update mutations
  const { mutate: updateProfile } = trpc.user.updateProfile.useMutation({
    onSuccess: async (data) => {
      await updateSession()
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    },
  })

  const { mutate: updateAccount } = trpc.user.updateAccount.useMutation({
    onSuccess: async (data) => {
      await updateSession()
      toast({
        title: "Account updated",
        description: "Your account settings have been updated successfully.",
      })
      // Clear password fields
      setAccountData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update account settings. Please try again.",
        variant: "destructive",
      })
    },
  })

  const { mutate: updateNotifications } = trpc.user.updateNotificationSettings.useMutation({
    onSuccess: () => {
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update notification settings. Please try again.",
        variant: "destructive",
      })
    },
  })

  const { mutate: updatePrivacy } = trpc.user.updatePrivacySettings.useMutation({
    onSuccess: () => {
      toast({
        title: "Privacy settings updated",
        description: "Your privacy preferences have been saved.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update privacy settings. Please try again.",
        variant: "destructive",
      })
    },
  })

  const { mutate: updateAppearance } = trpc.user.updateAppearanceSettings.useMutation({
    onSuccess: () => {
      toast({
        title: "Appearance settings updated",
        description: "Your appearance preferences have been saved.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update appearance settings. Please try again.",
        variant: "destructive",
      })
    },
  })

  const { mutate: updateSecurity } = trpc.user.updateSecuritySettings.useMutation({
    onSuccess: () => {
      toast({
        title: "Security settings updated",
        description: "Your security preferences have been saved.",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update security settings. Please try again.",
        variant: "destructive",
      })
    },
  })

  const { mutate: deleteAccount } = trpc.user.deleteAccount.useMutation({
    onSuccess: () => {
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      })
      // Redirect to home page
      window.location.href = "/"
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account. Please try again.",
        variant: "destructive",
      })
    },
  })

  const { data: userData, refetch: refetchUserData } = trpc.user.exportUserData.useQuery(undefined, {
    enabled: false, // Don't fetch automatically
  })

  // State for delete account form
  const [deleteAccountData, setDeleteAccountData] = useState({
    password: "",
    reason: "",
  })

  // State for delete account confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Profile settings form state
  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    location: "",
    website: "",
    github: "",
    twitter: "",
    image: "",
    banner: "",
  })

  // Account settings form state
  const [accountData, setAccountData] = useState({
    email: "",
    username: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Notification settings form state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    mentionNotifications: true,
    followNotifications: true,
    messageNotifications: true,
    browserNotifications: true,
  })

  // New state for privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public" as "public" | "private" | "hidden",
    showEmail: false,
    showLocation: true,
    allowMessaging: true,
  })

  // New state for appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "system" as "system" | "light" | "dark",
    fontSize: "medium" as "small" | "medium" | "large",
    reducedMotion: false,
    highContrast: false,
  })

  // New state for security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    loginNotifications: true,
    trustedDevices: [] as string[],
  })

  // Update form state when settings are loaded
  useEffect(() => {
    if (settings) {
      setProfileData({
        name: settings.profile.name,
        bio: settings.profile.bio || "",
        location: settings.profile.location || "",
        website: settings.profile.website || "",
        github: settings.profile.github || "",
        twitter: settings.profile.twitter || "",
        image: settings.profile.image || "",
        banner: settings.profile.banner || "",
      })
      setAccountData((prev) => ({
        ...prev,
        email: settings.account.email,
        username: settings.account.username,
      }))
      setNotificationSettings({
        emailNotifications: settings.notifications.emailNotifications,
        mentionNotifications: settings.notifications.mentionNotifications,
        followNotifications: settings.notifications.followNotifications,
        messageNotifications: settings.notifications.messageNotifications,
        browserNotifications: settings.notifications.browserNotifications,
      })
      setPrivacySettings({
        profileVisibility: settings.privacy.profileVisibility as "public" | "private" | "hidden",
        showEmail: settings.privacy.showEmail,
        showLocation: settings.privacy.showLocation,
        allowMessaging: settings.privacy.allowMessaging,
      })
      setAppearanceSettings({
        theme: settings.appearance.theme as "system" | "light" | "dark",
        fontSize: settings.appearance.fontSize as "small" | "medium" | "large",
        reducedMotion: settings.appearance.reducedMotion,
        highContrast: settings.appearance.highContrast,
      })
      setSecuritySettings({
        twoFactorEnabled: settings.security.twoFactorEnabled,
        loginNotifications: settings.security.loginNotifications,
        trustedDevices: settings.security.trustedDevices,
      })
    }
  }, [settings])

  // Type guard for session user
  if (!session?.user || !('username' in session.user)) {
    return null
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await updateProfile({
        name: profileData.name,
        bio: profileData.bio || null,
        location: profileData.location || null,
        website: profileData.website || null,
        github: profileData.github || null,
        twitter: profileData.twitter || null,
        image: profileData.image || null,
        banner: profileData.banner || null,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (accountData.newPassword && accountData.newPassword !== accountData.confirmPassword) {
        throw new Error("New passwords do not match")
      }

      await updateAccount({
        email: accountData.email,
        username: accountData.username,
        currentPassword: accountData.currentPassword || undefined,
        newPassword: accountData.newPassword || undefined,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update account settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSettingsLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <form onSubmit={handleProfileSubmit}>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Update your profile information visible to other users.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="Tell us about yourself"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    placeholder="Where are you based?"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={profileData.website}
                    onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub Username</Label>
                  <Input
                    id="github"
                    value={profileData.github}
                    onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                    placeholder="username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter Username</Label>
                  <Input
                    id="twitter"
                    value={profileData.twitter}
                    onChange={(e) => setProfileData({ ...profileData, twitter: e.target.value })}
                    placeholder="username"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Profile
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <form onSubmit={handleAccountSubmit}>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Update your account credentials and security settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={accountData.email}
                    onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={accountData.username}
                    onChange={(e) => setAccountData({ ...accountData, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={accountData.currentPassword}
                    onChange={(e) => setAccountData({ ...accountData, currentPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={accountData.newPassword}
                    onChange={(e) => setAccountData({ ...accountData, newPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={accountData.confirmPassword}
                    onChange={(e) => setAccountData({ ...accountData, confirmPassword: e.target.value })}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Account Settings
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about activity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about activity via email.
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Browser Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive desktop notifications when your browser is open.
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.browserNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, browserNotifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mention Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when someone mentions you in a post.
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.mentionNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, mentionNotifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Follow Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when someone follows you.
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.followNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, followNotifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Message Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when you receive a new message.
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.messageNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, messageNotifications: checked })
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => {
                  updateNotifications(notificationSettings)
                }}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Notification Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control who can see your information and interact with you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Profile Visibility</Label>
                <select
                  className="w-full rounded-md border p-2"
                  value={privacySettings.profileVisibility}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === "public" || value === "private" || value === "hidden") {
                      setPrivacySettings({
                        ...privacySettings,
                        profileVisibility: value,
                      })
                    }
                  }}
                >
                  <option value="public">Public - Anyone can view your profile</option>
                  <option value="private">Private - Only followers can view your profile</option>
                  <option value="hidden">Hidden - Only you can view your profile</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Email Address</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to see your email address on your profile.
                  </p>
                </div>
                <Switch
                  checked={privacySettings.showEmail}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({ ...privacySettings, showEmail: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Location</Label>
                  <p className="text-sm text-muted-foreground">
                    Display your location on your profile.
                  </p>
                </div>
                <Switch
                  checked={privacySettings.showLocation}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({ ...privacySettings, showLocation: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Direct Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Let others send you direct messages.
                  </p>
                </div>
                <Switch
                  checked={privacySettings.allowMessaging}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({ ...privacySettings, allowMessaging: checked })
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => {
                  updatePrivacy(privacySettings)
                }}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Privacy Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize how DevConnect looks and feels.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <select
                  className="w-full rounded-md border p-2"
                  value={appearanceSettings.theme}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === "system" || value === "light" || value === "dark") {
                      setAppearanceSettings({
                        ...appearanceSettings,
                        theme: value,
                      })
                    }
                  }}
                >
                  <option value="system">System Default</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Font Size</Label>
                <select
                  className="w-full rounded-md border p-2"
                  value={appearanceSettings.fontSize}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === "small" || value === "medium" || value === "large") {
                      setAppearanceSettings({
                        ...appearanceSettings,
                        fontSize: value,
                      })
                    }
                  }}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reduced Motion</Label>
                  <p className="text-sm text-muted-foreground">
                    Minimize animations throughout the interface.
                  </p>
                </div>
                <Switch
                  checked={appearanceSettings.reducedMotion}
                  onCheckedChange={(checked) =>
                    setAppearanceSettings({ ...appearanceSettings, reducedMotion: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>High Contrast</Label>
                  <p className="text-sm text-muted-foreground">
                    Increase contrast for better visibility.
                  </p>
                </div>
                <Switch
                  checked={appearanceSettings.highContrast}
                  onCheckedChange={(checked) =>
                    setAppearanceSettings({ ...appearanceSettings, highContrast: checked })
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => {
                  updateAppearance(appearanceSettings)
                }}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Appearance Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Enhance your account security with additional features.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account.
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorEnabled}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({ ...securitySettings, twoFactorEnabled: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Login Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when someone logs into your account.
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.loginNotifications}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({ ...securitySettings, loginNotifications: checked })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Trusted Devices</Label>
                  <div className="rounded-md border p-4">
                    <p className="text-sm text-muted-foreground">
                      {securitySettings.trustedDevices.length === 0
                        ? "No trusted devices"
                        : `${securitySettings.trustedDevices.length} trusted devices`}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Recent Activity</Label>
                  <div className="rounded-md border p-4">
                    <p className="text-sm text-muted-foreground">
                      View and manage your recent account activity
                    </p>
                    <Button variant="link" className="p-0 text-sm">
                      View Activity Log
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => {
                    updateSecurity(securitySettings)
                  }}
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Security Settings
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Export Account Data</h3>
                      <p className="text-sm text-muted-foreground">
                        Download a copy of all your DevConnect data
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        await refetchUserData()
                        if (userData) {
                          // Create and download JSON file
                          const dataStr = JSON.stringify(userData, null, 2)
                          const dataBlob = new Blob([dataStr], { type: 'application/json' })
                          const url = window.URL.createObjectURL(dataBlob)
                          const a = document.createElement('a')
                          a.style.display = 'none'
                          a.href = url
                          a.download = 'devconnect-data.json'
                          document.body.appendChild(a)
                          a.click()
                          window.URL.revokeObjectURL(url)
                          document.body.removeChild(a)

                          toast({
                            title: "Data exported",
                            description: "Your data has been downloaded successfully.",
                          })
                        }
                      }}
                    >
                      Export Data
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-destructive">Delete Account</h3>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all your data
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      Delete Account
                    </Button>
                  </div>

                  {showDeleteConfirm && (
                    <div className="rounded-md border border-destructive p-4 space-y-4">
                      <div>
                        <h4 className="font-medium text-destructive mb-2">
                          Are you absolutely sure?
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          This action cannot be undone. This will permanently delete your account
                          and remove all your data from our servers.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="deletePassword">Confirm your password</Label>
                          <Input
                            id="deletePassword"
                            type="password"
                            value={deleteAccountData.password}
                            onChange={(e) =>
                              setDeleteAccountData({
                                ...deleteAccountData,
                                password: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="deleteReason">
                            Why are you deleting your account? (Optional)
                          </Label>
                          <Textarea
                            id="deleteReason"
                            value={deleteAccountData.reason}
                            onChange={(e) =>
                              setDeleteAccountData({
                                ...deleteAccountData,
                                reason: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            variant="destructive"
                            onClick={() => {
                              if (!deleteAccountData.password) {
                                toast({
                                  title: "Error",
                                  description: "Please enter your password to confirm deletion.",
                                  variant: "destructive",
                                })
                                return
                              }
                              deleteAccount(deleteAccountData)
                            }}
                          >
                            Confirm Delete
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowDeleteConfirm(false)
                              setDeleteAccountData({ password: "", reason: "" })
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 