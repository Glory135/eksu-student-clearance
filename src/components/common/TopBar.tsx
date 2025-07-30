import React from 'react'
import { Button } from '../ui/button'
import { UserInterface } from '@/lib/types';
import { Bell, User } from 'lucide-react';
import { Logo } from './Logo';
import { getRoleIcon } from '@/lib/commonFunctions';
import { getRoleLabel } from '@/lib/commonFunctions';
import { Badge } from '../ui/badge';
import MaxWidthWrapper from './MaxWidthWrapper';
import { cn } from '@/lib/utils';
import { SidebarTrigger } from '../ui/sidebar';

const TopBar = (
  {
    user,
    notifications,
    className,
  }: {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    user?: UserInterface;
    notifications: number;
    className?: string;
  }
) => {
  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <MaxWidthWrapper className="container flex h-16 items-center">
        <div className="flex items-center space-x-4">
          <SidebarTrigger className="md:hidden" />
          <div className="flex gap-2 items-center">
            <Logo />
            <div>
              <h2 className="text-lg font-semibold">EKSU Clearance</h2>
              <p className="text-xs text-muted-foreground">{getRoleLabel(user?.role)} Portal</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-end space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {notifications > 9 ? '9+' : notifications}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground flex items-center justify-end">
                {getRoleIcon(user?.role)}
                <span className="ml-1">
                  {getRoleLabel(user?.role)}
                  {user?.department && ` • ${user.department}`}
                </span>
              </p>
            </div>

            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground">
              <User className="h-4 w-4" />
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </header>
  )
}

export default TopBar