// hooks/useOnboardingMutation.ts
"use client";

import { OnboardingFormValues } from "@/schemas";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

// Helper function to clean form data
function cleanFormData<T extends Record<string, any>>(data: T): Partial<T> {
  const cleanedData: Partial<T> = {};

  for (const key in data) {
    const value = data[key];

    if (typeof value === "string") {
      if (value.trim() !== "") {
        cleanedData[key] = value;
      }
    } else if ((value as any) instanceof File) {
      cleanedData[key] = value;
    } else if (typeof value === "object" && value !== null) {
      const nested = cleanFormData(value);
      if (Object.keys(nested).length > 0) {
        cleanedData[key] = nested as any;
      }
    } else if (value !== undefined && value !== null) {
      cleanedData[key] = value;
    }
  }

  return cleanedData;
}

// Function to handle file and non-file form data
function prepareFormData(data: OnboardingFormValues): FormData {
  const formData = new FormData();
  const cleanedData = cleanFormData(data);

  // Handle flat fields
  for (const [key, value] of Object.entries(cleanedData)) {
    if (key === "socialLinks" || value === undefined || value === null) {
      continue;
    }

    if (value instanceof File) {
      formData.append(key, value);
    } else if (typeof value === "object") {
      // Skip objects for now
    } else {
      formData.append(key, String(value));
    }
  }

  // Handle social links separately
  if (cleanedData.socialLinks) {
    for (const [platform, url] of Object.entries(cleanedData.socialLinks)) {
      if (url && typeof url === "string" && url.trim() !== "") {
        formData.append(`socialLinks[${platform}]`, url);
      }
    }
  }

  return formData;
}

// Function to submit onboarding data to the API
async function submitOnboardingData(data: OnboardingFormValues): Promise<any> {
  const formData = prepareFormData(data);

  const res = await fetch("/api/auth/onboarding", {
    method: "POST",
    body: formData,
  });

  const responseData = await res.json();

  if (!res.ok) {
    throw new Error(responseData.message || "Failed to submit form");
  }

  return responseData;
}

// Hook to use the onboarding mutation
export function useOnboardingMutation(options: {
  onSuccess?: (data: any) => Promise<void> | void;
  onError?: (error: Error) => void;
}) {
  return useMutation({
    mutationFn: submitOnboardingData,
    onSuccess: (data) => {
      toast.success("Profile completed successfully!");
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error: Error) => {
      console.error("Form submission error:", error);
      toast.error(error.message || "Failed to complete profile");
      if (options.onError) {
        options.onError(error);
      }
    },
  });
}
