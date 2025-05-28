'use client';

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Edit,
  Mail,
  Phone,
  Shield,
  Star,
  User,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { getInitials } from '@/lib/utils';
import { useProfile } from '@/services/customar/useProfile';

export default function Profile() {
  const { isPending, data, isError } = useProfile();

  if (isPending) {
    return <ProfileSkeleton />;
  }

  if (isError) {
    return <ErrorState />;
  }

  const profile = data;

  if (!profile) {
    return <ErrorState message="No profile data found" />;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'VENDOR':
        return 'default';
      case 'ADMIN':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
            <Avatar className="h-24 w-24 md:h-32 md:w-32">
              <AvatarImage
                src={profile.image || '/placeholder.svg'}
                alt={profile.name}
              />
              <AvatarFallback className="text-2xl">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <h1 className="text-3xl font-bold">{profile.name}</h1>
                  <div className="flex gap-2">
                    <Badge variant={getRoleBadgeVariant(profile.role)}>
                      {profile.role}
                    </Badge>
                    {profile.isActive ? (
                      <Badge
                        variant="outline"
                        className="border-green-600 text-green-600"
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-red-600 text-red-600"
                      >
                        <XCircle className="mr-1 h-3 w-3" />
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-muted-foreground text-lg">
                  @{profile.username}
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4" />
                  <span>{profile.points} points</span>
                </div>
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(profile.createdAt)}</span>
                </div>
              </div>
            </div>
            <Link href="/dashboard/profile/edit-profile ">
              <Button className="self-start">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="font-medium">{profile.email}</p>
                  <p className="text-muted-foreground text-sm">Email</p>
                </div>
              </div>
              {profile.emailVerified ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              )}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="font-medium">
                    {profile.phone || 'Not provided'}
                  </p>
                  <p className="text-muted-foreground text-sm">Phone</p>
                </div>
              </div>
              {profile.phone &&
                (profile.phoneVerified ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Onboarding Status</span>
              {profile.hasOnboarded ? (
                <Badge
                  variant="outline"
                  className="border-green-600 text-green-600"
                >
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Completed
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-yellow-600 text-yellow-600"
                >
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Pending
                </Badge>
              )}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="font-medium">Email Verification</span>
              {profile.emailVerified ? (
                <Badge
                  variant="outline"
                  className="border-green-600 text-green-600"
                >
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-yellow-600 text-yellow-600"
                >
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Unverified
                </Badge>
              )}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="font-medium">Phone Verification</span>
              {profile.phone ? (
                profile.phoneVerified ? (
                  <Badge
                    variant="outline"
                    className="border-green-600 text-green-600"
                  >
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-yellow-600 text-yellow-600"
                  >
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Unverified
                  </Badge>
                )
              ) : (
                <Badge
                  variant="outline"
                  className="border-gray-600 text-gray-600"
                >
                  Not provided
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Activity Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted/50 flex items-center gap-4 rounded-lg p-4">
                <div className="h-2 w-2 rounded-full bg-green-600" />
                <div className="flex-1">
                  <p className="font-medium">Account Created</p>
                  <p className="text-muted-foreground text-sm">
                    {formatDate(profile.createdAt)}
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 flex items-center gap-4 rounded-lg p-4">
                <div className="h-2 w-2 rounded-full bg-blue-600" />
                <div className="flex-1">
                  <p className="font-medium">Last Updated</p>
                  <p className="text-muted-foreground text-sm">
                    {formatDate(profile.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
            <Skeleton className="h-24 w-24 rounded-full md:h-32 md:w-32" />
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className={i === 2 ? 'md:col-span-2' : ''}>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ErrorState({
  message = 'Failed to load profile data',
}: {
  message?: string;
}) {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="text-xl font-semibold">Error Loading Profile</h2>
            <p className="text-muted-foreground">{message}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
