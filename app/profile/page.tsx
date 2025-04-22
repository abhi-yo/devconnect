// app/profile/page.tsx
// Remove "use client" directive

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Adjust path if needed
import { redirect } from "next/navigation";

// Define SessionUser type for assertion (ensure username is included)
// Make sure this matches the user object structure in your session callback
interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  username?: string; // Ensure username is part of the session user type
}

// Make the component async for getServerSession
export default async function ProfileRedirectPage() {
  const session = await getServerSession(authOptions);
  // Assert the type when accessing session.user
  const user = session?.user as SessionUser | undefined;

  if (user?.username) {
    // If logged in and username exists, redirect to their profile
    redirect(`/profile/${user.username}`);
  } else {
    // If not logged in or username missing, redirect to sign-in
    // Redirect back to /profile after login, which will then redirect to the user's page
    redirect("/auth/signin?callbackUrl=/profile");
  }

  // This part is technically unreachable due to the redirects above,
  // but returning null satisfies the component signature.
  return null;
}