import {
  ArrowUpRight,
  BadgePercent,
  BarChart3,
  Box,
  CircleDollarSign,
  ClipboardList,
  Heart,
  MessageSquare,
  Package,
  ShoppingBag,
  Star,
  Ticket,
  Truck,
  Users,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { auth } from '@/features/auth/auth';

interface UserType {
  user: {
    name: string;
    role: string;
  };
}

// Admin Dashboard Component
function AdminDashboard() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <CircleDollarSign className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-muted-foreground text-xs">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  New Customers
                </CardTitle>
                <Users className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+2,350</div>
                <p className="text-muted-foreground text-xs">
                  +18.2% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Orders
                </CardTitle>
                <ShoppingBag className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-muted-foreground text-xs">
                  +201 pending fulfillment
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Inventory Status
                </CardTitle>
                <Package className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,234</div>
                <p className="text-muted-foreground text-xs">
                  54 products low in stock
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>
                  Monthly revenue breakdown for the current quarter
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="bg-muted/20 flex h-[300px] items-center justify-center rounded-md">
                  <BarChart3 className="text-muted h-16 w-16" />
                  <span className="text-muted ml-2">
                    Sales chart visualization
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>
                  Latest system activities and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {[
                    {
                      action: 'New product added',
                      user: 'Anna K.',
                      time: '2 hours ago',
                      icon: Package,
                    },
                    {
                      action: 'Order #35782 shipped',
                      user: 'System',
                      time: '5 hours ago',
                      icon: Truck,
                    },
                    {
                      action: 'New user registered',
                      user: 'James B.',
                      time: '6 hours ago',
                      icon: Users,
                    },
                    {
                      action: 'Inventory updated',
                      user: 'Sarah M.',
                      time: 'Yesterday',
                      icon: Box,
                    },
                    {
                      action: 'Monthly report generated',
                      user: 'System',
                      time: 'Yesterday',
                      icon: ClipboardList,
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center">
                      <div className="bg-primary/10 mr-3 flex h-9 w-9 items-center justify-center rounded-full">
                        <item.icon className="text-primary h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.action}</p>
                        <p className="text-muted-foreground text-xs">
                          {item.user} • {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Manager Dashboard Component
function ManagerDashboard({ user }: UserType) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Management Dashboard
        </h2>
        <p>{user.role}</p>
        <Button variant="outline">
          <ArrowUpRight className="mr-2 h-4 w-4" />
          View Reports
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Today</CardTitle>
            <CircleDollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,548.20</div>
            <p className="text-muted-foreground text-xs">
              +8.5% from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Team Performance
            </CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-muted-foreground text-xs">+3% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approvals
            </CardTitle>
            <ClipboardList className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-muted-foreground text-xs">
              12 vendors, 8 products, 4 returns
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Online</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18/22</div>
            <p className="text-muted-foreground text-xs">
              Customer service (8), Vendors (10)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Department Goals</CardTitle>
            <CardDescription>Monthly targets and achievements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">Sales Department</div>
                <div className="text-muted-foreground text-sm">86%</div>
              </div>
              <Progress value={86} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">Customer Service</div>
                <div className="text-muted-foreground text-sm">93%</div>
              </div>
              <Progress value={93} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">Inventory Management</div>
                <div className="text-muted-foreground text-sm">78%</div>
              </div>
              <Progress value={78} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">Marketing</div>
                <div className="text-muted-foreground text-sm">65%</div>
              </div>
              <Progress value={65} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Task Schedule</CardTitle>
            <CardDescription>Today&#39;s priority tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {[
                {
                  task: 'Weekly staff meeting',
                  time: '10:00 AM',
                  priority: 'High',
                },
                {
                  task: 'Review new product submissions',
                  time: '11:30 AM',
                  priority: 'Medium',
                },
                {
                  task: 'Approve Q2 marketing budget',
                  time: '1:00 PM',
                  priority: 'High',
                },
                {
                  task: 'Interview customer service candidates',
                  time: '3:00 PM',
                  priority: 'Medium',
                },
                {
                  task: 'Finalize monthly reports',
                  time: '4:30 PM',
                  priority: 'High',
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center">
                  <div className="bg-primary mr-3 h-14 w-1 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.task}</p>
                    <p className="text-muted-foreground text-xs">{item.time}</p>
                  </div>
                  <Badge
                    variant={
                      item.priority === 'High' ? 'destructive' : 'outline'
                    }
                  >
                    {item.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Vendor Dashboard Component
function VendorDashboard() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Vendor Portal</h2>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today&#39;s Revenue
            </CardTitle>
            <CircleDollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,851.50</div>
            <p className="text-muted-foreground text-xs">
              +11.2% from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-muted-foreground text-xs">8 pending approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Orders</CardTitle>
            <ShoppingBag className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34</div>
            <p className="text-muted-foreground text-xs">
              12 need to ship today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Alerts</CardTitle>
            <Package className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-muted-foreground text-xs">
              Products running low on inventory
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
            <CardDescription>
              Your product sales over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-[300px] items-center justify-center rounded-md">
              <BarChart3 className="text-muted-foreground h-16 w-16" />
              <span className="text-muted-foreground ml-2">
                Sales performance chart
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Orders to Fulfill</CardTitle>
            <CardDescription>
              Recent orders requiring your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  order: '#38562',
                  product: 'Premium Hoodie',
                  status: 'To Ship',
                  time: '2 hours ago',
                },
                {
                  order: '#38559',
                  product: 'Canvas Tote',
                  status: 'To Ship',
                  time: '3 hours ago',
                },
                {
                  order: '#38551',
                  product: 'Leather Wallet',
                  status: 'To Ship',
                  time: '5 hours ago',
                },
                {
                  order: '#38540',
                  product: 'Winter Jacket',
                  status: 'Processing',
                  time: '1 day ago',
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center">
                  <div className="bg-primary/10 mr-3 flex h-10 w-10 items-center justify-center rounded">
                    <ShoppingBag className="text-primary h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Order {item.order}: {item.product}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {item.status} • {item.time}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Process
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View All Orders
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

// Customer Service Dashboard Component
function CustomerServiceDashboard({ user }: UserType) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Customer Service Dashboard
        </h2>
        <p>{user.name}</p>
        <Button variant="outline">
          <Ticket className="mr-2 h-4 w-4" />
          Create New Ticket
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <Ticket className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">37</div>
            <p className="text-muted-foreground text-xs">12 high priority</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today&#39;s Resolved
            </CardTitle>
            <ClipboardList className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-muted-foreground text-xs">
              +8 compared to yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Response Time
            </CardTitle>
            <MessageSquare className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42 min</div>
            <p className="text-muted-foreground text-xs">
              -10 min from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Customer Satisfaction
            </CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-muted-foreground text-xs">
              Based on 120 ratings today
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Support Tickets</CardTitle>
            <CardDescription>
              Current tickets requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: '#T-2453',
                  issue: 'Order cancellation request',
                  priority: 'High',
                  time: '10 min ago',
                },
                {
                  id: '#T-2452',
                  issue: 'Product information inquiry',
                  priority: 'Medium',
                  time: '25 min ago',
                },
                {
                  id: '#T-2451',
                  issue: 'Shipping delay concern',
                  priority: 'High',
                  time: '45 min ago',
                },
                {
                  id: '#T-2450',
                  issue: 'Return processing question',
                  priority: 'Medium',
                  time: '1 hour ago',
                },
                {
                  id: '#T-2449',
                  issue: 'Account login problems',
                  priority: 'Low',
                  time: '2 hours ago',
                },
              ].map((ticket, i) => (
                <div key={i} className="flex items-center">
                  <div className="mr-3">
                    <Badge
                      variant={
                        ticket.priority === 'High'
                          ? 'destructive'
                          : ticket.priority === 'Medium'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {ticket.priority}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {ticket.id}: {ticket.issue}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Opened {ticket.time}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Respond
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View All Tickets
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
            <CardDescription>Support metrics for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Avatar className="mr-2 h-9 w-9">
                    <AvatarImage src="/placeholder-avatar-1.jpg" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Jane Davis</p>
                    <p className="text-muted-foreground text-xs">
                      14 tickets resolved
                    </p>
                  </div>
                </div>
                <Progress value={87} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Avatar className="mr-2 h-9 w-9">
                    <AvatarImage src="/placeholder-avatar-2.jpg" />
                    <AvatarFallback>MS</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Michael Smith</p>
                    <p className="text-muted-foreground text-xs">
                      10 tickets resolved
                    </p>
                  </div>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Avatar className="mr-2 h-9 w-9">
                    <AvatarImage src="/placeholder-avatar-3.jpg" />
                    <AvatarFallback>LT</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Lisa Thompson</p>
                    <p className="text-muted-foreground text-xs">
                      8 tickets resolved
                    </p>
                  </div>
                </div>
                <Progress value={68} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Customer Dashboard Component
function CustomerDashboard({ user }: UserType) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, {user.name || 'Customer'}
          </h2>
          <p className="text-muted-foreground">
            Here&#39;s what&#39;s happening with your account
          </p>
        </div>
        <Button>
          <ShoppingBag className="mr-2 h-4 w-4" />
          Continue Shopping
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Package className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-muted-foreground text-xs">1 out for delivery</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reward Points</CardTitle>
            <BadgePercent className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,840</div>
            <p className="text-muted-foreground text-xs">
            ৳28.40 redeemable value
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wishlist</CardTitle>
            <Heart className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-muted-foreground text-xs">3 items on sale now</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Reviews
            </CardTitle>
            <Star className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-muted-foreground text-xs">
              You&#39;ve left 4 product reviews
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>Track your recent purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {[
                {
                  id: '#OR-38562',
                  product: 'Summer Collection Bundle',
                  status: 'Out for Delivery',
                  eta: 'Today',
                  icon: Truck,
                },
                {
                  id: '#OR-38540',
                  product: 'Wireless Headphones',
                  status: 'Processing',
                  eta: 'Apr 30',
                  icon: Package,
                },
                {
                  id: '#OR-38521',
                  product: 'Smart Home Device',
                  status: 'Processing',
                  eta: 'May 2',
                  icon: Package,
                },
              ].map((order, i) => (
                <div key={i} className="flex items-center">
                  <div className="bg-primary/10 mr-3 flex h-10 w-10 items-center justify-center rounded">
                    <order.icon className="text-primary h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {order.id}: {order.product}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {order.status} • {order.eta}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Track
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View Order History
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
export default async function Dashboard() {
  const session = await auth();
  return (
    <div>
      {session?.user.role === 'ADMIN' ? (
        <AdminDashboard />
      ) : session?.user.role === 'MANAGER' ? (
        <ManagerDashboard user={session.user} />
      ) : session?.user.role === 'VENDOR' ? (
        <VendorDashboard />
      ) : session?.user.role === 'CUSTOMER_SERVICE' ? (
        <CustomerServiceDashboard user={session.user} />
      ) : (
        <CustomerDashboard user={session?.user} />
      )}
    </div>
  );
}
