'use client';
import { QEUERY_KEYS } from '@/lib/constants';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useProfile() {
  return useQuery({
    queryKey: [QEUERY_KEYS.USER_PROFILE],
    queryFn: async () => {
      const { data } = await axios.get('/api/dashboard/customar/profile');
      return data;
    },
  });
}

export interface FormData {
  name: string;
  username: string;
  email: string;
  phone?: string;
}

export interface UpdateProfileData {
  formData: FormData;
  imageFile: File | null;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    phone?: string;
    role: string;
    hasOnboarded: boolean;
    image: string;
    imageId?: string;
    emailVerified?: string | null;
    phoneVerified?: boolean;
    isActive?: boolean;
    points?: number;
    createdAt?: string;
    updatedAt?: string;
  };
}

async function updateProfileAPI({
  formData,
  imageFile,
}: UpdateProfileData): Promise<UpdateProfileResponse> {
  const formDataToSend = new FormData();
  formDataToSend.append('name', formData.name);
  formDataToSend.append('username', formData.username);
  formDataToSend.append('email', formData.email);
  if (formData.phone) {
    formDataToSend.append('phone', formData.phone);
  }
  if (imageFile) {
    formDataToSend.append('profileImage', imageFile, imageFile.name);
  }

  const { data } = await axios.put(
    '/api/dashboard/customar/profile',
    formDataToSend,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return data;
}

export interface UseUpdateProfileOptions {
  onSuccess?: (data: UpdateProfileResponse) => void;
  onError?: (error: Error) => void;
  redirectPath?: string;
  showSuccessMessage?: boolean;
  showErrorMessage?: boolean;
}

export function useUpdateProfile(options: UseUpdateProfileOptions = {}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { update } = useSession();

  const {
    onSuccess,
    onError,
    redirectPath = '/profile',
    showSuccessMessage = true,
    showErrorMessage = true,
  } = options;

  return useMutation<UpdateProfileResponse, Error, UpdateProfileData>({
    // ✅ CORRECT: Don't wrap with toast.promise
    mutationFn: async (payload) => {
      const loadingToast = toast.loading('Updating profile...');
      try {
        const result = await updateProfileAPI(payload);
        toast.success(result.message || 'Profile updated successfully!', {
          id: loadingToast,
        });
        return result;
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message ||
            error.message ||
            'Failed to update profile.',
          { id: loadingToast }
        );
        throw error;
      }
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: [QEUERY_KEYS.USER_PROFILE] });

      await update({
        name: data.user.name,
        email: data.user.email,
        image: data.user.image,
        username: data.user.username,
        role: data.user.role,
        hasOnboarded: data.user.hasOnboarded,
      });

      if (onSuccess) {
        onSuccess(data);
        console.log(data);
      } else if (redirectPath) {
        router.push(redirectPath);
      }
    },
    onError: (error) => {
      if (showErrorMessage) {
        toast.error(error.message || 'Failed to update profile.');
      }
      if (onError) {
        onError(error);
      }
    },
  });
}
