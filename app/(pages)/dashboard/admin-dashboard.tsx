'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  ActivityIcon,
  BarChart3,
  Package,
  ShoppingCart,
  Star,
  Store,
  Users,
} from 'lucide-react';
import type React from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type {
  Activity,
  ActivityType,
  OrderActivity,
  PaymentStatus,
  ProductActivity,
  ReviewActivity,
  UserActivity,
} from '@/lib/types/admin';
import { getInitials } from '@/lib/utils';
import { useAdminStats } from '@/services';

interface ActivityDescriptionParams {
  activity: Activity;
}

export default function AdminDashboard() {
  const { isPending, data, isError } = useAdminStats();

  const formatRelativeDate = (dateString: string): string => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const getActivityIcon = (type: ActivityType): React.ReactElement => {
    const iconMap: Record<
      ActivityType,
      React.ComponentType<{ className?: string }>
    > = {
      ORDER: ShoppingCart,
      PRODUCT: Package,
      USER: Users,
      REVIEW: Star,
    };

    const IconComponent = iconMap[type] || ActivityIcon;
    return <IconComponent className="h-4 w-4" />;
  };

  const getActivityColor = (
    type: ActivityType,
    status?: PaymentStatus
  ): string => {
    switch (type) {
      case 'ORDER':
        return status === 'PAID'
          ? 'bg-green-100 text-green-700'
          : 'bg-amber-100 text-amber-700';
      case 'PRODUCT':
        return 'bg-purple-100 text-purple-700';
      case 'USER':
        return 'bg-sky-100 text-sky-700';
      case 'REVIEW':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getActivityDescription = ({
    activity,
  }: ActivityDescriptionParams): string => {
    switch (activity.type) {
      case 'ORDER': {
        const orderActivity = activity as OrderActivity;
        return `Order ${orderActivity.paymentStatus === 'PAID' ? 'paid' : 'created'} for $${orderActivity.total}`;
      }
      case 'PRODUCT': {
        const productActivity = activity as ProductActivity;
        return `Product added: ${productActivity.productName}`;
      }
      case 'USER': {
        const userActivity = activity as UserActivity;
        return `New ${userActivity.role?.toLowerCase()} registered: ${userActivity.name || userActivity.username}`;
      }
      case 'REVIEW': {
        const reviewActivity = activity as ReviewActivity;
        const content = reviewActivity.content;
        return `New review: ${content?.substring(0, 30)}${content?.length > 30 ? '...' : ''}`;
      }
      default:
        return 'Activity recorded';
    }
  };

  const isOrderActivity = (activity: Activity): activity is OrderActivity => {
    return activity.type === 'ORDER';
  };

  const isReviewActivity = (activity: Activity): activity is ReviewActivity => {
    return activity.type === 'REVIEW';
  };

  const isUserActivity = (activity: Activity): activity is UserActivity => {
    return activity.type === 'USER';
  };

  const renderStarRating = (rating: number): React.ReactElement[] => {
    const stars: React.ReactElement[] = [];

    // Filled stars
    for (let i = 0; i < rating; i++) {
      stars.push(
        <Star
          key={`filled-${i}`}
          className="h-4 w-4 fill-amber-400 text-amber-400"
        />
      );
    }

    // Empty stars
    for (let i = rating; i < 5; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="text-muted-foreground/30 h-4 w-4" />
      );
    }

    return stars;
  };

  if (isPending) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Error loading dashboard
          </h3>
          <p className="mt-1 text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }

  const orderActivities = data.recentActivity.filter(isOrderActivity);
  const reviewActivities = data.recentActivity.filter(isReviewActivity);

  return (
    <main className="flex flex-1 flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden p-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-violet-500 to-violet-600 p-6 pb-2 text-white">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-5 w-5 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.stats.orders}</div>
            <p className="text-muted-foreground text-xs">Total orders placed</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden p-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-pink-500 to-pink-600 p-6 pb-2 text-white">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-5 w-5 text-white" />
          </CardHeader>
          <CardContent className="p-6 pt-4">
            <div className="text-3xl font-bold">{data.stats.products}</div>
            <p className="text-muted-foreground text-xs">Products in catalog</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden p-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-amber-500 to-amber-600 p-6 pb-2 text-white">
            <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
            <Store className="h-5 w-5 text-white" />
          </CardHeader>
          <CardContent className="p-6 pt-4">
            <div className="text-3xl font-bold">{data.stats.shops}</div>
            <p className="text-muted-foreground text-xs">Active shops</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden p-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-cyan-500 to-cyan-600 p-6 pb-2 text-white">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-5 w-5 text-white" />
          </CardHeader>
          <CardContent className="p-6 pt-4">
            <div className="text-3xl font-bold">{data.stats.users}</div>
            <p className="text-muted-foreground text-xs">Registered users</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 overflow-hidden pt-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-violet-600 to-violet-500 p-6 text-white">
            <div className="grid gap-2">
              <CardTitle>Recent Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {data.recentActivity.map((activity: Activity) => (
                <div key={activity.id} className="flex items-center">
                  <Avatar className="h-9 w-9 border">
                    <AvatarFallback
                      className={getActivityColor(
                        activity.type,
                        isOrderActivity(activity)
                          ? activity.paymentStatus
                          : undefined
                      )}
                    >
                      {getActivityIcon(activity.type)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm leading-none font-medium">
                      {activity.user?.name ||
                        (isUserActivity(activity) ? activity.name : null) ||
                        'User'}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {getActivityDescription({ activity })}
                    </p>
                  </div>
                  <div className="text-muted-foreground ml-auto text-xs">
                    {formatRelativeDate(activity.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 overflow-hidden pt-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-pink-500 to-pink-600 p-6 text-white">
            <CardTitle>Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {reviewActivities.map((review: ReviewActivity) => (
                <div key={review.id} className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarFallback className="bg-pink-100 text-pink-700">
                      {getInitials(review.user?.name || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{review.user?.name}</h4>
                      <div className="flex">
                        {renderStarRating(review.rating)}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {review.content}
                    </p>
                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                      <span>{formatRelativeDate(review.createdAt)}</span>
                      <span>•</span>
                      <span>{review.product?.productName}</span>
                    </div>
                  </div>
                </div>
              ))}
              {reviewActivities.length === 0 && (
                <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                  <div className="text-center">
                    <Star className="text-muted-foreground/50 mx-auto h-6 w-6" />
                    <h3 className="mt-2 text-sm font-medium">No reviews yet</h3>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Reviews will appear here when customers leave feedback.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2 overflow-hidden pt-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-orange-600 to-orange-500 p-6 text-white">
            <div>
              <CardTitle>Recent Orders</CardTitle>
            </div>
            <BarChart3 className="ml-auto h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orderActivities.slice(0, 5).map((order: OrderActivity) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-violet-100 p-2">
                      <ShoppingCart className="h-4 w-4 text-violet-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{order.user?.name}</p>
                      <p className="text-muted-foreground text-xs">
                        Order #{order.id.substring(0, 8)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">${order.total}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatRelativeDate(order.createdAt)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        order.paymentStatus === 'PAID' ? 'default' : 'outline'
                      }
                    >
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden p-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-cyan-500 to-cyan-600 p-6 text-white">
            <CardTitle>User Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-sky-100 p-2">
                    <Users className="h-4 w-4 text-sky-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Users</p>
                    <p className="text-muted-foreground text-xs">
                      All registered accounts
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-bold">{data.stats.users}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-amber-100 p-2">
                    <Store className="h-4 w-4 text-amber-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Vendors</p>
                    <p className="text-muted-foreground text-xs">
                      Registered sellers
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-bold">{data.stats.shops}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-pink-100 p-2">
                    <Star className="h-4 w-4 text-pink-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Average Rating</p>
                    <p className="text-muted-foreground text-xs">
                      Based on {data.stats.reviews.count} reviews
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">
                    {data.stats.reviews.averageRating}.0
                  </p>
                  <Star className="ml-1 h-5 w-5 fill-amber-400 text-amber-400" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
