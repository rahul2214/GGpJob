"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Trash2, ShieldCheck, Search, MoreHorizontal, User as UserIcon, 
  Eye, Building2, Phone, Calendar, Coins, Star, Award, CheckCircle, ExternalLink, Briefcase
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { AdminCreationForm } from "@/components/admin-creation-form";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/user-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { format } from "date-fns";

export default function ManageUsersPage() {
  const { user } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdminFormOpen, setIsAdminFormOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("All");
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleAddAdminClick = () => {
    if (isMobile) {
      router.push('/admin/users/add');
    } else {
      setIsAdminFormOpen(true);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast({ title: 'Error', description: 'Failed to fetch users.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const displayedUsers = useMemo(() => {
    let filteredUsers = users;
    if (user?.role === 'Admin') {
      filteredUsers = users.filter(u => u.role !== 'Super Admin' && u.role !== 'Admin');
    }

    if (selectedRoleFilter !== "All") {
      filteredUsers = filteredUsers.filter(u => u.role === selectedRoleFilter);
    }

    if (searchTerm) {
        const query = searchTerm.toLowerCase();
        filteredUsers = filteredUsers.filter(u => 
            u.name.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query) ||
            (u.companyName && u.companyName.toLowerCase().includes(query)) ||
            (u.phone && u.phone.includes(query))
        );
    }

    return filteredUsers;
  }, [users, user, searchTerm, selectedRoleFilter]);

  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'Super Admin': return <Badge className="bg-purple-100 text-purple-800 border border-purple-200 font-bold px-3 py-1 shadow-sm">{role}</Badge>;
      case 'Admin': return <Badge className="bg-rose-100 text-rose-800 border border-rose-200 font-bold px-3 py-1 shadow-sm">{role}</Badge>;
      case 'Recruiter': return <Badge className="bg-blue-100 text-blue-800 border border-blue-200 font-bold px-3 py-1 shadow-sm">{role}</Badge>;
      case 'Employee': return <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold px-3 py-1 shadow-sm">{role}</Badge>;
      default: return <Badge className="bg-slate-100 text-slate-700 border border-slate-200 font-bold px-3 py-1 shadow-sm">{role}</Badge>;
    }
  };
  
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const response = await fetch(`/api/users/${userToDelete.uuid}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      toast({ title: 'Success', description: 'User deleted successfully.' });
      await fetchUsers();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete user.', variant: 'destructive' });
      console.error(error);
    } finally {
      setUserToDelete(null);
    }
  };

  const renderRoleDetails = (u: any) => {
    if (u.role === 'Job Seeker') {
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span>{u.credits ?? 0} Account Credits</span>
          </div>
          {u.phone && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Phone className="w-3.5 h-3.5" />
              <span>{u.phone}</span>
            </div>
          )}
        </div>
      );
    }
    if (u.role === 'Recruiter') {
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
            <span className="truncate max-w-[180px]">{u.companyName || 'Corporate Recruiter'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Briefcase className="w-3.5 h-3.5" />
            <span className="truncate max-w-[180px]">{u.designation || 'HR / Recruitment'}</span>
          </div>
        </div>
      );
    }
    if (u.role === 'Employee') {
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="truncate max-w-[180px]">{u.companyName || 'Insider Employee'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Trust Score: {u.trustScore ?? 100}/100</span>
          </div>
        </div>
      );
    }
    if (u.role === 'Admin' || u.role === 'Super Admin') {
      return (
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg w-max border border-indigo-100">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Platform Administrator</span>
        </div>
      );
    }
    return <span className="text-xs text-slate-400">Standard User</span>;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 bg-slate-50/50">
              <TableHead>User Identity</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Role Data & Quotas</TableHead>
              <TableHead>Joined / Plan</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-12 w-48 rounded-xl" /></TableCell>
                <TableCell><Skeleton className="h-7 w-24 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-10 w-40 rounded-xl" /></TableCell>
                <TableCell><Skeleton className="h-8 w-28 rounded-xl" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-9 w-9 ml-auto rounded-xl" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }

    if (displayedUsers.length === 0) {
      return (
        <div className="text-center py-16 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 my-6">
          <UserIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No Users Found</h3>
          <p className="text-slate-400 text-sm mt-1">No profiles matched your search or role filter.</p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow className="border-slate-100 bg-slate-50/50">
            <TableHead className="font-bold text-slate-700">User Identity</TableHead>
            <TableHead className="font-bold text-slate-700">Role</TableHead>
            <TableHead className="font-bold text-slate-700">Role Data & Quotas</TableHead>
            <TableHead className="font-bold text-slate-700">Joined / Plan</TableHead>
            <TableHead className="text-right font-bold text-slate-700">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedUsers.map((u: any) => (
            <TableRow key={u.uuid} className="hover:bg-slate-50/80 transition-colors cursor-pointer group" onClick={() => setSelectedUserDetail(u)}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3.5">
                  <Avatar className="h-10 w-10 border border-slate-200 shadow-sm group-hover:scale-105 transition-transform">
                    <AvatarFallback className="bg-indigo-50 text-indigo-700 font-bold">
                      {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                      {u.name || 'Unnamed User'}
                      {u.isPaid && <Badge className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.2 border border-amber-200 font-black">PRO</Badge>}
                    </div>
                    <div className="text-xs text-slate-400 font-medium">{u.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>{getRoleBadge(u.role)}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>{renderRoleDetails(u)}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : 'Recently'}</span>
                  </div>
                  {u.planType && u.planType !== 'none' && (
                    <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 inline-block">
                      {u.planType}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100" disabled={u.uuid === user?.uuid}>
                      <MoreHorizontal className="h-4 w-4 text-slate-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[160px] shadow-xl">
                    <DropdownMenuItem onClick={() => setSelectedUserDetail(u)} className="rounded-xl font-bold text-slate-700 cursor-pointer py-2">
                      <Eye className="mr-2 h-4 w-4 text-indigo-600" />
                      Quick View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl font-bold text-slate-700 cursor-pointer py-2">
                       <Link href={`/profile/${u.uuid}`}>
                          <ExternalLink className="mr-2 h-4 w-4 text-emerald-600" />
                          Public Profile
                       </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-100 my-1" />
                    <DropdownMenuItem onClick={() => setUserToDelete(u)} className="text-red-600 font-bold rounded-xl cursor-pointer py-2 focus:bg-red-50">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Dialog open={isAdminFormOpen} onOpenChange={setIsAdminFormOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Create Platform Admin</DialogTitle>
            <DialogDescription className="text-slate-500 pt-1">
              Grant administrator credentials to a trusted team member.
            </DialogDescription>
          </DialogHeader>
          <AdminCreationForm
            onSuccess={() => {
              setIsAdminFormOpen(false);
              fetchUsers();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* User Quick View Dialog */}
      <Dialog open={!!selectedUserDetail} onOpenChange={(open) => !open && setSelectedUserDetail(null)}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-8 sm:p-10 border-none shadow-2xl bg-gradient-to-br from-white via-indigo-50/20 to-white">
          {selectedUserDetail && (
            <div className="space-y-6">
              <div className="flex items-center gap-5 border-b border-slate-100 pb-6">
                <Avatar className="h-16 w-16 border-2 border-indigo-200 shadow-lg">
                  <AvatarFallback className="bg-indigo-600 text-white text-2xl font-black">
                    {selectedUserDetail.name ? selectedUserDetail.name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedUserDetail.name || 'Unnamed User'}</h3>
                    {getRoleBadge(selectedUserDetail.role)}
                  </div>
                  <p className="text-sm font-semibold text-slate-500 mt-1">{selectedUserDetail.email}</p>
                  {(selectedUserDetail as any).phone && (
                    <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mt-1">
                      <Phone className="w-3.5 h-3.5 text-indigo-500" /> {(selectedUserDetail as any).phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Role Specific Comprehensive Data */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Account Details & Quotas</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/80">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Account Status</span>
                    <p className="text-base font-black text-slate-900 mt-1 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" /> Active Member
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/80">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Joined Date</span>
                    <p className="text-base font-black text-slate-900 mt-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-500" /> 
                      {(selectedUserDetail as any).createdAt ? format(new Date((selectedUserDetail as any).createdAt), 'MMM d, yyyy') : 'N/A'}
                    </p>
                  </div>

                  {selectedUserDetail.role === 'Job Seeker' && (
                    <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 sm:col-span-2">
                      <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">Available Credits</span>
                      <p className="text-2xl font-black text-amber-950 mt-1 flex items-center gap-2">
                        <Coins className="w-6 h-6 text-amber-500" /> {(selectedUserDetail as any).credits ?? 0} Credits
                      </p>
                    </div>
                  )}

                  {selectedUserDetail.role === 'Recruiter' && (
                    <>
                      <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200/80 sm:col-span-2">
                        <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wide">Company Info</span>
                        <p className="text-xl font-black text-blue-950 mt-1 flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-blue-600" /> {(selectedUserDetail as any).companyName || 'Corporate Employer'}
                        </p>
                        <p className="text-xs font-semibold text-blue-800 mt-1">Designation: {(selectedUserDetail as any).designation || 'Recruitment / HR'}</p>
                      </div>
                    </>
                  )}

                  {selectedUserDetail.role === 'Employee' && (
                    <>
                      <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 sm:col-span-2">
                        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">Company & Department</span>
                        <p className="text-xl font-black text-emerald-950 mt-1 flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-emerald-600" /> {(selectedUserDetail as any).companyName || 'Insider Organization'}
                        </p>
                        <p className="text-xs font-semibold text-emerald-800 mt-1">Department: {(selectedUserDetail as any).department || 'General'} | Title: {(selectedUserDetail as any).designation || 'Insider'}</p>
                      </div>

                      <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-200/80">
                        <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wide">Monthly Quota</span>
                        <p className="text-lg font-black text-indigo-950 mt-1">
                          {(selectedUserDetail as any).jobsPostedThisMonth ?? 0} / {(selectedUserDetail as any).jobPostLimit ?? 5} Posted
                        </p>
                      </div>

                      <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80">
                        <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">Trust Score</span>
                        <p className="text-lg font-black text-amber-950 mt-1 flex items-center gap-1.5">
                          <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> {(selectedUserDetail as any).trustScore ?? 100} / 100
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <Button variant="outline" className="rounded-xl font-bold" onClick={() => setSelectedUserDetail(null)}>
                  Close Modal
                </Button>
                <Link href={`/profile/${selectedUserDetail.uuid}`}>
                  <Button className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 flex items-center gap-2">
                    View Full Profile <ExternalLink className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent className="rounded-[2rem] p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 pt-1">
              This action cannot be undone. This will permanently delete the user account for <strong className="text-slate-900">{userToDelete?.name}</strong> and all associated database records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-xl font-bold" onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white" onClick={handleDeleteUser}>Confirm Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="border border-slate-100/80 shadow-xl rounded-3xl bg-white/90 backdrop-blur-md overflow-hidden">
        <CardHeader className="border-b border-slate-100/80 p-6 sm:p-8 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">Platform User Management</CardTitle>
              <CardDescription className="text-slate-500 text-sm font-medium mt-1.5">
                Oversee job seekers, corporate recruiters, employee referrers, and system administrators.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                        type="search"
                        placeholder="Search name, email, company..."
                        className="pl-10 h-11 rounded-xl bg-white border-slate-200 sm:w-[240px] lg:w-[300px] text-sm shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {user?.role === 'Super Admin' && (
                  <Button onClick={handleAddAdminClick} className="h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black px-5 shadow-lg shadow-indigo-600/20 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" /> Create Admin
                  </Button>
                )}
            </div>
          </div>

          {/* Role Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-6">
            {["All", "Job Seeker", "Recruiter", "Employee", "Admin", "Super Admin"].map((role) => (
              <Button
                key={role}
                variant={selectedRoleFilter === role ? "default" : "outline"}
                onClick={() => setSelectedRoleFilter(role)}
                className={`rounded-xl h-9 px-4 text-xs font-black transition-all ${selectedRoleFilter === role ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}
              >
                {role === "All" ? "All Users" : `${role}s`}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
