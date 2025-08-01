import React from 'react';
import { Button } from '../ui/button';
import {
  User,
  LogOut,
  Home,
  FileText,
  Settings,
  BarChart3,
  Shield,
  GraduationCap,
  Building,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { USER_ROLES } from '@/lib/constatnts';
import TopBar from '../common/TopBar';
import { getRoleIcon, getRoleLabel } from '@/lib/commonFunctions';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarInset
} from '../ui/sidebar';
import { usePathname } from 'next/navigation';
import MaxWidthWrapper from '../common/MaxWidthWrapper';
import { useAuth } from '@/hooks/useAuth';
import { UserType } from '@/hooks/use-get-user';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: UserType;
  title: string;
  subtitle?: string;
  onLogout?: () => void;
  notifications?: number;
  className?: string;
}

export function DashboardLayout({
  children,
  user,
  title,
  subtitle,
  onLogout,
  notifications = 0,
  className = ''
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getNavigationItems = (role: string) => {
    switch (role) {
      case USER_ROLES.student:
        return [
          { name: 'Overview', href: '/dashboard/student', icon: <Home className="h-4 w-4" /> },
          { name: 'Documents', href: '/dashboard/student/documents', icon: <FileText className="h-4 w-4" /> },
          { name: 'Profile', href: '/dashboard/student/profile', icon: <User className="h-4 w-4" /> },
        ];
      case USER_ROLES.officer:
        return [
          { name: 'Pending Reviews', href: '/dashboard/officer', icon: <FileText className="h-4 w-4" /> },
          { name: 'Approved', href: '/dashboard/officer/approved', icon: <Shield className="h-4 w-4" /> },
          { name: 'Settings', href: '/dashboard/officer/settings', icon: <Settings className="h-4 w-4" /> },
        ];
      case USER_ROLES.admin:
        return [
          { name: 'Overview', href: '/dashboard/admin', icon: <BarChart3 className="h-4 w-4" /> },
          { name: 'Students', href: '/dashboard/admin/students', icon: <GraduationCap className="h-4 w-4" /> },
          { name: 'Officers', href: '/dashboard/admin/officers', icon: <Shield className="h-4 w-4" /> },
          { name: 'Departments', href: '/dashboard/admin/departments', icon: <Building className="h-4 w-4" /> },
          { name: 'Settings', href: '/dashboard/admin/settings', icon: <Settings className="h-4 w-4" /> },
        ];
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems(user?.role || '');

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="w-full bg-background flex border">
        {/* Sidebar */}
        <Sidebar>
          <SidebarHeader className="border-b p-4">
            <div className="flex gap-2 items-center">
              <Logo />
              <div>
                <h2 className="text-lg font-semibold">EKSU Clearance</h2>
                <p className="text-xs text-muted-foreground">{getRoleLabel(user?.role)} Portal</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            {/* User Info */}
            <div className="p-3 bg-muted rounded-lg mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground">
                  {getRoleIcon(user?.role)}
                </div>
                <div>
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {getRoleLabel(user?.role)}
                  </p>
                </div>
              </div>
            </div>
            {/* Navigation */}
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    onClick={() => router.push(item.href)}
                    isActive={pathname === item.href}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="pt-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span className="ml-3">Logout</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <SidebarInset>
          <TopBar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            user={user}
            notifications={notifications}
            className='flex md:hidden'
          />
          <MaxWidthWrapper className="container py-6">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                  {subtitle && (
                    <p className="text-muted-foreground mt-2">{subtitle}</p>
                  )}
                </div>
                {/* Breadcrumb */}
                <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>Dashboard</span>
                  <span>/</span>
                  <span className="capitalize">{user?.role}</span>
                </div>
              </div>
            </div>
            {/* Content */}
            <div className={cn(className)}>
              {children}
            </div>
          </MaxWidthWrapper>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
} 