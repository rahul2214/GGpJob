"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/user-context";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserX, RefreshCw, Trash2, Calendar, Search, ShieldAlert, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase-client";

interface DeletedUser {
  id: number;
  uuid: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  companyName?: string;
  deletedAt?: string;
  scheduledDeleteAt?: string;
  createdAt?: string;
}

export default function AdminDeletedUsersPage() {
  const { user } = useUser();
  const [deletedUsers, setDeletedUsers] = useState<DeletedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userToRestore, setUserToRestore] = useState<DeletedUser | null>(null);
  const [userToPermDelete, setUserToPermDelete] = useState<DeletedUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  const fetchDeletedUsers = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const userIdVal = user?.uuid || user?.id;
      if (userIdVal) headers['x-user-id'] = String(userIdVal);

      const url = userIdVal ? `/api/admin/deleted-users?userId=${encodeURIComponent(String(userIdVal))}` : '/api/admin/deleted-users';

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setDeletedUsers(Array.isArray(data) ? data : []);
      } else {
        setDeletedUsers([]);
      }
    } catch (error) {
      console.error("Failed to fetch deleted users", error);
      toast({ title: "Error", description: "Failed to fetch deleted accounts.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedUsers();
  }, [user]);

  const handleRestoreAccount = async () => {
    if (!userToRestore) return;
    setActionLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const userIdVal = user?.uuid || user?.id;
      if (userIdVal) headers['x-user-id'] = String(userIdVal);

      const res = await fetch("/api/account/restore", {
        method: "POST",
        headers,
        body: JSON.stringify({ userId: userToRestore.uuid }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to restore account");
      }

      toast({
        title: "Account Restored",
        description: `Successfully restored ${userToRestore.name}'s account.`,
      });
      await fetchDeletedUsers();
    } catch (error: any) {
      toast({ title: "Restore Failed", description: error.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
      setUserToRestore(null);
    }
  };

  const handlePermanentDelete = async () => {
    if (!userToPermDelete) return;
    setActionLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const userIdVal = user?.uuid || user?.id;
      if (userIdVal) headers['x-user-id'] = String(userIdVal);

      const url = userIdVal ? `/api/admin/delete-permanently?userId=${encodeURIComponent(String(userIdVal))}` : '/api/admin/delete-permanently';

      const res = await fetch(url, {
        method: "DELETE",
        headers,
        body: JSON.stringify({ userId: userToPermDelete.uuid }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to permanently delete account");
      }

      toast({
        title: "Permanently Deleted",
        description: `Account data for ${userToPermDelete.name} has been anonymized and removed.`,
      });
      await fetchDeletedUsers();
    } catch (error: any) {
      toast({ title: "Permanent Delete Failed", description: error.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
      setUserToPermDelete(null);
    }
  };

  const filteredUsers = deletedUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.companyName && u.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Recruiter":
        return <Badge className="bg-blue-100 text-blue-800 border-none font-bold">Recruiter</Badge>;
      case "Employee":
        return <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold">Employee</Badge>;
      case "Admin":
      case "Super Admin":
        return <Badge className="bg-rose-100 text-rose-800 border-none font-bold">{role}</Badge>;
      default:
        return <Badge className="bg-indigo-100 text-indigo-800 border-none font-bold">Job Seeker</Badge>;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Restore Confirmation Alert */}
      <AlertDialog open={!!userToRestore} onOpenChange={(open) => !open && setUserToRestore(null)}>
        <AlertDialogContent className="rounded-3xl p-7">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black">Restore User Account?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 pt-1 text-sm">
              Reactivating <strong className="text-slate-900">{userToRestore?.name}</strong> will restore full access, profile listings, and features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-xl font-bold" onClick={() => setUserToRestore(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleRestoreAccount}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Restore Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permanent Delete Confirmation Alert */}
      <AlertDialog open={!!userToPermDelete} onOpenChange={(open) => !open && setUserToPermDelete(null)}>
        <AlertDialogContent className="rounded-3xl p-7">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-rose-700">Permanently Delete Immediately?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 pt-1 text-sm">
              This action cannot be undone. All personal information for <strong className="text-slate-900">{userToPermDelete?.name}</strong> will be anonymized and credentials will be deleted immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-xl font-bold" onClick={() => setUserToPermDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white"
              onClick={handlePermanentDelete}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Permanently Delete Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Card Header & Controls */}
      <Card className="border border-slate-100 shadow-xl rounded-3xl bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-100 p-6 sm:p-8 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <CardTitle className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <UserX className="w-5 h-5" />
                </div>
                Deleted User Accounts
              </CardTitle>
              <CardDescription className="text-slate-500 text-sm font-medium mt-1.5">
                Manage soft-deleted accounts in the 30-day grace period. Restore accounts or trigger immediate permanent deletion.
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search name, email, role..."
                className="pl-10 h-11 rounded-xl bg-white border-slate-200 sm:w-[260px] text-sm shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead>User Identity</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Deleted Date</TableHead>
                  <TableHead>Permanent Delete Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(4)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-40 rounded-xl" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-28 rounded-xl" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-28 rounded-xl" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-9 w-24 ml-auto rounded-xl" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-20 bg-slate-50/40 rounded-3xl border border-dashed border-slate-200 my-6 mx-6">
              <UserX className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-700">No Deleted Accounts Found</h3>
              <p className="text-slate-400 text-sm mt-1">There are currently no soft-deleted user accounts.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 border-slate-100">
                  <TableHead className="font-bold text-slate-700">User Identity</TableHead>
                  <TableHead className="font-bold text-slate-700">Role</TableHead>
                  <TableHead className="font-bold text-slate-700">Deleted Date</TableHead>
                  <TableHead className="font-bold text-slate-700">Scheduled Permanent Delete</TableHead>
                  <TableHead className="text-right font-bold text-slate-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.uuid} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-slate-200">
                          <AvatarFallback className="bg-rose-50 text-rose-700 font-bold">
                            {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            {u.name}
                          </div>
                          <div className="text-xs text-slate-400 font-medium">{u.email}</div>
                          {u.companyName && <div className="text-[11px] text-slate-500 font-semibold">{u.companyName}</div>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(u.role)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {u.deletedAt ? format(new Date(u.deletedAt), "MMM d, yyyy") : "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg w-max border border-amber-200">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        {u.scheduledDeleteAt ? format(new Date(u.scheduledDeleteAt), "MMM d, yyyy") : "In 30 days"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setUserToRestore(u)}
                          className="h-9 px-3 rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold text-xs"
                        >
                          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                          Restore
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setUserToPermDelete(u)}
                          className="h-9 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                          Delete Now
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
