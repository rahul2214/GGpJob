
"use client";

import { useUser } from "@/contexts/user-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
        // Allow access to the admin login page
        if (pathname === '/admin/login') return;

        if (!user) {
            router.push('/admin/login');
        } else if (user.role !== 'Admin' && user.role !== 'Super Admin') {
            router.push('/');
        }
    }
  }, [user, loading, router, pathname]);

  if (loading) return null;
  if (!user && pathname !== '/admin/login') return null;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
