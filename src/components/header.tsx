
"use client"

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  Settings,
  User,
  LogOut,
  LogIn,
  UserPlus,
  LayoutGrid,
  Menu,
  SlidersHorizontal,
  MessageSquareQuote,
  ArrowLeft,
  Share2,
  Building,
  Layers,
  UserCog,
  BarChart3,
  Award,
  Network,
  MapPin,
  X,
  Search,
  Star,
  PlusCircle,
  Bell,
  Bookmark,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useUser } from "@/contexts/user-context";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "./ui/separator";
import { JobFilters } from "./job-filters";
import { useEffect, useState, Suspense, useMemo } from "react";
import { ShareButton } from "./share-button";
import { useIsMobile } from "@/hooks/use-mobile";
import HeaderSearch from "./header-search";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/use-jobs";

export default function Header() {
  const { user, logout, loading: userLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const isMobile = useIsMobile();

  const { notifications } = useNotifications(user?.id);
  
  const notificationCount = useMemo(() => {
    if (!notifications || !user) return 0;
    if (!user.notificationLastViewedAt) return notifications.length;
    
    const lastViewedTime = new Date(user.notificationLastViewedAt).getTime();
    return notifications.filter(n => new Date(n.timestamp).getTime() > lastViewedTime).length;
  }, [notifications, user]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isJobSearchPage = pathname === '/jobs';
  const isNotificationsPage = pathname === '/notifications';
  const isJobDetailsPage = /^\/jobs\/[^/]+$/.test(pathname) && !pathname.includes('/applications');
  const isProfileSectionEditPage = /^\/profile\/(education|employment|projects|languages|skills)\/(add|edit\/[^/]+)$/.test(pathname);
  const isJobApplicationsPage = /^\/jobs\/[^/]+\/applications$/.test(pathname);
  const isPublicProfilePage = /^\/profile\/[^/]+$/.test(pathname);
  const isAdminAddPage = /^\/admin\/(users|domains|locations)\/add$/.test(pathname);
  const isAdminEditPage = /^\/admin\/(domains|locations)\/edit\/[^/]+$/.test(pathname);
  
  const getProfileSectionTitle = () => {
    if (!isProfileSectionEditPage) return '';
    const parts = pathname.split('/');
    const action = parts.includes('edit') ? 'Edit' : 'Add';
    const section = parts[2].charAt(0).toUpperCase() + parts[2].slice(1);
    const sectionName = section.endsWith('s') ? section.slice(0,-1) : section;

    return `${action} ${sectionName}`;
  }


  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };
  
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }
    return `${name.charAt(0)}`.toUpperCase();
  }

  const adminNavItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/admin/users", label: "Manage Users", icon: UserCog },
    { href: "/admin/jobs", label: "Manage Jobs", icon: BriefcaseBusiness },
    { href: "/admin/domains", label: "Manage Domains", icon: Layers },
    { href: "/admin/locations", label: "Manage Locations", icon: MapPin },
    { href: "/admin/employment-types", label: "Employment Types", icon: Network },
    { href: "/admin/workplace-types", label: "Workplace Types", icon: Building },
    { href: "/admin/experience-levels", label: "Experience Levels", icon: Award },
  ];

  if (user?.role === 'Super Admin') {
    adminNavItems.push({ href: "/admin/feedback", label: "Platform Feedback", icon: MessageSquareQuote });
  }
  
  const getMobileHeaderTitle = () => {
    if (isNotificationsPage) return 'Notifications';
    if (isProfileSectionEditPage) return getProfileSectionTitle();
    if (isAdminAddPage) {
      if (pathname.includes('/users')) return 'Create New Admin';
      if (pathname.includes('/domains')) return 'Add New Domain';
      if (pathname.includes('/locations')) return 'Add New Location';
    }
    if (isAdminEditPage) {
        if(pathname.includes('/domains')) return 'Edit Domain';
        if(pathname.includes('/locations')) return 'Edit Location';
    }
    return '';
  }

  const renderMobileLeftButton = () => {
    const isRecruiterOrEmployee = user?.role === 'Recruiter' || user?.role === 'Employee';
    const showRecruiterBack = isRecruiterOrEmployee && (isJobApplicationsPage || isPublicProfilePage);

    const showBackButton = (isJobDetailsPage && user?.role === 'Job Seeker') || 
                          isProfileSectionEditPage || 
                          showRecruiterBack || 
                          (isMobile && (isAdminAddPage || isAdminEditPage)) ||
                          isNotificationsPage;

    if (isClient && showBackButton) {
      return (
        <Button variant="ghost" size="icon" className="shrink-0 md:hidden" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
        </Button>
      );
    }
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0 md:hidden p-0">
                    <Menu className="h-10 w-10" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
                 <SheetHeader className="p-4">
                    <SheetTitle asChild>
                        <SheetClose asChild>
                            <Link href="/" className="flex items-center gap-2 font-bold">
                                <BriefcaseBusiness className="h-6 w-6 text-primary" />
                                <span className="text-xl">Job Portal</span>
                            </Link>
                        </SheetClose>
                    </SheetTitle>
                </SheetHeader>
               <ScrollArea className="flex-1">
                <div className="p-6 pt-0">
                    <nav className="grid gap-3 text-lg font-medium mt-6">
                        {isClient && !userLoading && user && (user.role === 'Admin' || user.role === 'Super Admin') ? (
                           <>
                            {adminNavItems.map(item => (
                               <SheetClose asChild key={item.href}>
                                 <Link href={item.href} className="flex items-center gap-3 text-muted-foreground hover:text-foreground">
                                    <item.icon className="h-5 w-5" />
                                    {item.label}
                                  </Link>
                               </SheetClose>
                            ))}
                           </>
                        ) : (
                          <>
                            {isClient && !userLoading && user && (
                              <SheetClose asChild>
                                  <Link href="/" className="flex items-center gap-3 text-muted-foreground hover:text-foreground">
                                      <LayoutGrid className="h-5 w-5" />
                                      Dashboard
                                  </Link>
                              </SheetClose>
                            )}
                             {isClient && !userLoading && user?.role === 'Job Seeker' && (
                               <>
                                <SheetClose asChild>
                                    <Link href="/jobs" className="flex items-center gap-3 text-muted-foreground hover:text-foreground">
                                        <Search className="h-5 w-5" />
                                        Jobs
                                    </Link>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Link href="/saved-jobs" className="flex items-center gap-3 text-muted-foreground hover:text-foreground">
                                        <Bookmark className="h-5 w-5" />
                                        Saved Jobs
                                    </Link>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Link href="/notifications" className="flex items-center gap-3 text-muted-foreground hover:text-foreground">
                                        <div className="relative">
                                          <Bell className="h-5 w-5" />
                                          {notificationCount > 0 && (
                                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                                              {notificationCount > 9 ? '9+' : notificationCount}
                                            </span>
                                          )}
                                        </div>
                                        Notifications
                                    </Link>
                                </SheetClose>
                                {user.domainId && (
                                    <SheetClose asChild>
                                       <Link href={`/jobs?domain=${user.domainId}`} className="flex items-center gap-3 text-muted-foreground hover:text-foreground">
                                            <Star className="h-5 w-5" />
                                            Recommended Jobs
                                       </Link>
                                    </SheetClose>
                                )}
                                <SheetClose asChild>
                                    <Link href="#" className="flex items-center gap-3 text-muted-foreground hover:text-foreground">
                                        <Award className="h-5 w-5" />
                                        Training
                                    </Link>
                                </SheetClose>
                               </>
                            )}
                             {isClient && !userLoading && user && (user.role === 'Recruiter' || user.role === 'Employee') && (
                                 <SheetClose asChild>
                                    <Link href={user.role === 'Recruiter' ? '/jobs/post' : '/referrals/post'} className="flex items-center gap-3 text-muted-foreground hover:text-foreground">
                                        <PlusCircle className="h-5 w-5" />
                                        Post Job
                                    </Link>
                                </SheetClose>
                            )}
                          </>
                        )}
                    </nav>
                    {isClient && !userLoading && user && (
                        <>
                            <Separator className="my-4" />
                            <nav className="grid gap-3 text-lg font-medium">
                               <div className="text-sm font-semibold text-muted-foreground px-1">My Account</div>
                                <SheetClose asChild>
                                    <Link href="/profile" className="flex items-center gap-3 text-muted-foreground hover:text-foreground">
                                        <User className="h-5 w-5" />
                                        Profile
                                    </Link>
                                </SheetClose>
                                {user.role === 'Job Seeker' && (
                                    <>
                                        <SheetClose asChild>
                                            <Link href="/applications" className="flex items-center gap-3 text-muted-foreground hover:text-foreground">
                                                <LayoutGrid className="h-5 w-5" />
                                                My Applications
                                            </Link>
                                        </SheetClose>
                                    </>
                                )}
                                 {['Job Seeker', 'Recruiter', 'Employee'].includes(user.role) && (
                                    <SheetClose asChild>
                                        <Link href="/feedback" className="flex items-center gap-3 text-muted-foreground hover:text-foreground">
                                            <MessageSquareQuote className="h-5 w-5" />
                                            Feedback
                                        </Link>
                                    </SheetClose>
                                )}
                                 <SheetClose asChild>
                                    <Link href="#" className="flex items-center gap-3 text-muted-foreground hover:text-foreground">
                                        <Settings className="h-5 w-5" />
                                        Settings
                                    </Link>
                                </SheetClose>
                            </nav>
                        </>
                    )}
                </div>
                </ScrollArea>

                <div className="mt-auto p-6 border-t">
                     {isClient && !userLoading && user && (
                        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-lg text-muted-foreground">
                            <LogOut className="mr-3 h-5 w-5" />
                            Logout
                        </Button>
                     )}
                     {isClient && !userLoading && !user && (
                      <div className="flex flex-col gap-2">
                         <SheetClose asChild>
                         <Button asChild variant="ghost">
                            <Link href="/login">
                              Login
                            </Link>
                          </Button>
                          </SheetClose>
                           <SheetClose asChild>
                           <Button asChild>
                            <Link href="/company/login">
                                Post a Job
                            </Link>
                          </Button>
                          </SheetClose>
                      </div>
                     )}
                </div>
            </SheetContent>
        </Sheet>
    );
  }

  const renderMobileRightButton = () => {
    if (isClient && isJobDetailsPage && user?.role === 'Job Seeker') {
        const jobId = pathname.split('/')[2];
        return (
            <div className="md:hidden">
                <ShareButton jobId={jobId} jobTitle={""} />
            </div>
        );
    }
     if (isClient && !userLoading && isJobSearchPage) {
        return (
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <SlidersHorizontal className="h-6 w-6" />
                    <span className="sr-only">Open filters</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80%] rounded-t-lg">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <JobFilters isSheet={true} />
                </SheetContent>
              </Sheet>
            </div>
        )
     }
     return null;
  }

  return (
    <header className={cn("sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-2 sm:px-6", isJobDetailsPage && "hidden md:flex")}>
       <div className="flex items-center gap-2">
        {renderMobileLeftButton()}
        <Link href="/" className="hidden md:flex items-center gap-2 font-bold whitespace-nowrap">
            <BriefcaseBusiness className="h-6 w-6 text-primary" />
            <span className="text-xl">Job Portal</span>
        </Link>
        {isClient && (isNotificationsPage || isProfileSectionEditPage || (isMobile && (isAdminAddPage || isAdminEditPage))) && (
          <div className="md:hidden text-lg font-semibold whitespace-nowrap">
            {getMobileHeaderTitle()}
          </div>
        )}
      </div>


      <nav className="ml-6 hidden md:flex items-center gap-6 text-sm font-medium">
        {isClient && !userLoading && user && (user.role === 'Admin' || user.role === 'Super Admin') ? (
          <>
            {adminNavItems.map(item => (
              <Link key={item.href} href={item.href} className={`transition-colors hover:text-foreground ${pathname === item.href ? "text-foreground" : "text-foreground/60"}`}>
                {item.label}
              </Link>
            ))}
          </>
        ) : (
          <>
            {isClient && !userLoading && user && (
              <Link href="/" className={`transition-colors hover:text-foreground ${pathname === "/" ? "text-foreground" : "text-foreground/60"}`}>
                Dashboard
              </Link>
            )}
            {isClient && !userLoading && user?.role === 'Job Seeker' && (
                <Suspense>
                    <Link href="/jobs" className={`transition-colors hover:text-foreground ${pathname === "/jobs" ? "text-foreground" : "text-foreground/60"}`}>
                        Jobs
                    </Link>
                    <Link href="/saved-jobs" className={`transition-colors hover:text-foreground ${pathname === "/saved-jobs" ? "text-foreground" : "text-foreground/60"}`}>
                        Saved Jobs
                    </Link>
                    {user.domainId && (
                         <Link href={`/jobs?domain=${user.domainId}`} className={`transition-colors hover:text-foreground ${pathname.startsWith("/jobs?domain") ? "text-foreground" : "text-foreground/60"}`}>
                            Recommended Jobs
                        </Link>
                    )}
                    <Link href="#" className={`transition-colors hover:text-foreground ${pathname === "/training" ? "text-foreground" : "text-foreground/60"}`}>
                        Training
                    </Link>
                </Suspense>
            )}
          </>
        )}
      </nav>

      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <Suspense fallback={null}>
            <HeaderSearch />
        </Suspense>
        <div className="ml-auto flex items-center gap-2">
           {renderMobileRightButton()}
           {isClient && !userLoading && user ? (
            <div className="flex items-center gap-4">
                {user.role === 'Job Seeker' && pathname === '/' && (
                    <>
                        <Button asChild variant="ghost" size="icon" className="md:hidden">
                            <Link href="/notifications">
                                <div className="relative">
                                  <Bell className="h-5 w-5" />
                                  {notificationCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                                      {notificationCount > 9 ? '9+' : notificationCount}
                                    </span>
                                  )}
                                </div>
                                <span className="sr-only">Notifications</span>
                            </Link>
                        </Button>
                        <Button asChild variant="ghost" size="icon" className="hidden md:flex">
                             <Link href="/notifications">
                                <div className="relative">
                                  <Bell className="h-5 w-5" />
                                  {notificationCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                                      {notificationCount > 9 ? '9+' : notificationCount}
                                    </span>
                                  )}
                                </div>
                                <span className="sr-only">Notifications</span>
                            </Link>
                        </Button>
                    </>
                )}
                 <div className="hidden md:flex">
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar>
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                        <Link href="/profile">
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </Link>
                        </DropdownMenuItem>
                        {user.role === 'Job Seeker' && (
                        <>
                            <DropdownMenuItem asChild>
                                <Link href="/applications">
                                <LayoutGrid className="mr-2 h-4 w-4" />
                                <span>My Applications</span>
                                </Link>
                            </DropdownMenuItem>
                             <DropdownMenuItem asChild>
                                <Link href="/saved-jobs">
                                <Bookmark className="mr-2 h-4 w-4" />
                                <span>Saved Jobs</span>
                                </Link>
                            </DropdownMenuItem>
                        </>
                        )}
                        {['Job Seeker', 'Recruiter', 'Employee'].includes(user.role) && (
                            <DropdownMenuItem asChild>
                                <Link href="/feedback">
                                    <MessageSquareQuote className="mr-2 h-4 w-4" />
                                    <span>Feedback</span>
                                </Link>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
          ) : (
             isClient && !userLoading && (
                <div className="hidden md:flex items-center gap-2">
                <Button asChild variant="ghost">
                    <Link href="/login">
                        Login
                    </Link>
                </Button>
                <Button asChild>
                    <Link href="/company/login">
                        Post a Job
                    </Link>
                </Button>
                </div>
             )
          )}
        </div>
      </div>
    </header>
  );
}
