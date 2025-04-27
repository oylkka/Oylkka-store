"use server";

import { auth } from "@/features/auth/auth";
import { db } from "@/lib/db";

export interface UsernameCheckResult {
  available: boolean;
  suggestions?: string[];
  message?: string;
  error?: string;
}

export async function checkUsername(
  username: string,
): Promise<UsernameCheckResult> {
  // Validate input
  if (!username) {
    return {
      available: false,
      error: "Username is required",
    };
  }

  if (username.length < 3) {
    return {
      available: false,
      message: "Username must be at least 3 characters",
    };
  }

  try {
    // Get current session
    const session = await auth();
    if (!session) {
      return {
        available: false,
        error: "Unauthorized",
      };
    }

    // Check if this is the user's current username
    const currentUser = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        username: true,
      },
    });

    // If the user is trying their current username, it's automatically available
    if (currentUser?.username === username) {
      return { available: true };
    }

    // Reserved usernames that can't be used
    const reservedUsernames = [
      "admin",
      "root",
      "system",
      "moderator",
      "support",
      "help",
      "info",
      "contact",
      "about",
      "login",
      "signup",
      "register",
      "account",
      "profile",
      "settings",
      "dashboard",
    ];

    const isReserved = reservedUsernames.includes(username.toLowerCase());

    // Check if username exists in database
    const existingUser = await db.user.findUnique({
      where: {
        username: username,
      },
    });

    if (existingUser || isReserved) {
      // Generate multiple suggestions for better user experience
      const suggestions = [];

      // Add variants with numbers
      for (let i = 0; i < 3; i++) {
        suggestions.push(`${username}${Math.floor(Math.random() * 1000)}`);
      }

      // Add a variant with year
      const currentYear = new Date().getFullYear();
      suggestions.push(`${username}${currentYear}`);

      return {
        available: false,
        suggestions: suggestions,
        message: isReserved
          ? "This username is reserved"
          : "This username is already taken",
      };
    }

    return { available: true };
  } catch (error) {
    console.error("Username check error:", error);
    return {
      available: false,
      error: "Failed to check username",
    };
  }
}
