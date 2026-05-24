
"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import type { Job, User, Domain, PortalFeedback, Application } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { UserCog, Briefcase, PlusCircle, Edit, Trash2, MoreHorizontal, Layers, ShieldCheck, Star, Building, Eye, CheckCircle, XCircle, Info, CheckSquare, Square } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { DomainForm } from "../domain-form";
import { AdminCreationForm } from "../admin-creation-form";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/user-context";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";

type ActiveView = 'users' | 'jobs' | 'domains' | 'portal-feedback' | 'verifications';

export default function AdminDashboard() {
  const { user } = useUser();
  const [activeView, setActiveView] = useState<ActiveView>('users');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [portalFeedback, setPortalFeedback] = useState<PortalFeedback[]>([]);
  const [disputedApps, setDisputedApps] = useState<Application[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState<Application[]>([]);
  const [verifTab, setVerifTab] = useState<'pending' | 'disputed'>('pending');
  const [loading, setLoading] = useState(true);
  const [isDomainFormOpen, setIsDomainFormOpen] = useState(false);
  const [isAdminFormOpen, setIsAdminFormOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<Application | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [selectedVerifIds, setSelectedVerifIds] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };
  
  const fetchDomains = async () => {
    try {
      const res = await fetch('/api/domains');
      const data = await res.json();
      setDomains(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch domains", error);
    }
  };
  
  const fetchJobs = async () => {
     try {
        const res = await fetch('/api/jobs');
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch jobs", error);
      }
  }

  const fetchPortalFeedback = async () => {
    try {
      const res = await fetch('/api/feedback');
      const data = await res.json();
      setPortalFeedback(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch portal feedback", error);
    }
  };
  
  const fetchVerifications = async () => {
    try {
      const [disputedRes, pendingRes] = await Promise.all([
        fetch('/api/applications?verificationStatus=disputed'),
        fetch('/api/applications?verificationStatus=pending')
      ]);

      if (disputedRes.ok) {
        const data = await disputedRes.json();
        setDisputedApps(Array.isArray(data) ? data : []);
      }
      if (pendingRes.ok) {
        const data = await pendingRes.json();
        setPendingVerifications(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch verifications", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchPromises = [fetchUsers(), fetchJobs(), fetchDomains(), fetchVerifications()];
        if (user?.role === 'Super Admin') {
          fetchPromises.push(fetchPortalFeedback());
        }
        await Promise.all(fetchPromises);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const displayedUsers = useMemo(() => {
    if (user?.role === 'Admin') {
      return users.filter(u => u.role !== 'Super Admin' && u.role !== 'Admin');
    }
    return users;
  }, [users, user]);

  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'Super Admin': return <Badge className="bg-purple-100 text-purple-800">{role}</Badge>;
      case 'Admin': return <Badge className="bg-red-100 text-red-800">{role}</Badge>;
      case 'Recruiter': return <Badge className="bg-blue-100 text-blue-800">{role}</Badge>;
      case 'Employee': return <Badge className="bg-yellow-100 text-yellow-800">{role}</Badge>;
      default: return <Badge variant="secondary">{role}</Badge>;
    }
  };
  
  const handleEditDomain = (domain: Domain) => {
    setSelectedDomain(domain);
    setIsDomainFormOpen(true);
  };

  const handleAddDomain = () => {
    setSelectedDomain(null);
    setIsDomainFormOpen(true);
  };
  
  const handleDeleteDomain = async (domainId: string) => {
    try {
      const response = await fetch(`/api/domains/${domainId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete domain');
      }
      toast({ title: 'Success', description: 'Domain deleted successfully.' });
      await fetchDomains();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete domain.', variant: 'destructive' });
      console.error(error);
    }
  };
  
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
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

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    try {
      const response = await fetch(`/api/jobs/${jobToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete job');
      }
      toast({ title: 'Success', description: 'Job deleted successfully.' });
      await fetchJobs();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete job.', variant: 'destructive' });
      console.error(error);
    } finally {
      setJobToDelete(null);
    }
  };

  const handleResolveDispute = async (appId: string, action: 'verify' | 'reject') => {
    try {
      const response = await fetch(`/api/applications/${appId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: action === 'verify' ? 'approve' : 'reject' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to resolve dispute');
      }

      toast({ 
        title: 'Dispute Resolved', 
        description: action === 'verify' ? 'Hire confirmed and rewards released.' : 'Hire rejected and penalty applied.' 
      });
      
      // Refresh list
      await fetchVerifications();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      console.error(error);
    }
  };

  const handleBulkResolve = async (action: 'verify' | 'reject') => {
    if (selectedVerifIds.length === 0) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/applications/bulk-resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedVerifIds, action: action === 'verify' ? 'approve' : 'reject' }),
      });

      if (!response.ok) throw new Error('Failed to resolve bulk items');

      toast({ 
        title: 'Bulk Action Complete', 
        description: `Processed ${selectedVerifIds.length} verifications successfully.` 
      });
      
      setSelectedVerifIds([]);
      await fetchVerifications();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };


  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <div className="border rounded-lg p-4">
            <Skeleton className="h-40 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const navItems = [
    { id: 'users', label: 'Manage Users', icon: UserCog },
    { id: 'jobs', label: 'Manage Jobs', icon: Briefcase },
    { id: 'domains', label: 'Manage Domains', icon: Layers },
    { id: 'verifications', label: 'Referral Verifications', icon: ShieldCheck },
    ...(user?.role === 'Super Admin'
      ? [{ id: 'portal-feedback', label: 'Platform Feedback', icon: Building }]
      : []),
  ];

  return (
    <>
      <Dialog open={isDomainFormOpen} onOpenChange={setIsDomainFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedDomain ? "Edit Domain" : "Add New Domain"}</DialogTitle>
             <DialogDescription>
              {selectedDomain ? "Update the details of the job domain." : "Enter the name for the new job domain."}
            </DialogDescription>
          </DialogHeader>
          <DomainForm
            domain={selectedDomain}
            onSuccess={() => {
              setIsDomainFormOpen(false);
              fetchDomains();
            }}
          />
        </DialogContent>
      </Dialog>
      
       <Dialog open={isAdminFormOpen} onOpenChange={setIsAdminFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Admin</DialogTitle>
             <DialogDescription>
              Enter the details for the new Admin user.
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

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account for {userToDelete?.name} and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       <AlertDialog open={!!jobToDelete} onOpenChange={(open) => !open && setJobToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job posting for &quot;{jobToDelete?.title}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setJobToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteJob}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <CardTitle>Admin Control Panel</CardTitle>
          <CardDescription>Manage platform users, job postings, and domains.</CardDescription>
        </CardHeader>
              <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
                <nav className="flex flex-col space-y-2">
                    {navItems.map((item) => (
                        <Button
                            key={item.id}
                            variant={activeView === item.id ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setActiveView(item.id as ActiveView)}
                        >
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.label}
                        </Button>
                    ))}
                </nav>
                <div className="overflow-x-auto">
                    {activeView === 'users' && (
                        <div>
                            {user?.role === 'Super Admin' && (
                                <div className="flex justify-end mb-4">
                                <Button onClick={() => setIsAdminFormOpen(true)}>
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    Create Admin
                                </Button>
                                </div>
                            )}
                            <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {displayedUsers.map((u) => (
                                    <TableRow key={u.id}>
                                    <TableCell className="font-medium flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                        <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        {u.name}
                                    </TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell>{getRoleBadge(u.role)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" disabled={u.id === user?.id}>
                                            <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setUserToDelete(u)} className="text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {activeView === 'jobs' && (
                         <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>Job Title</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Date Posted</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {jobs.map((job) => (
                                <TableRow key={job.id}>
                                <TableCell className="font-medium">{job.title}</TableCell>
                                <TableCell>{job.companyName}</TableCell>
                                <TableCell>
                                    <Badge variant={job.isReferral ? "outline" : "default"}>
                                    {job.isReferral ? "Referral" : "Direct"}
                                    </Badge>
                                </TableCell>
                                <TableCell>{format(new Date(job.postedAt), "PPP")}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setJobToDelete(job)} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                    )}

                    {activeView === 'domains' && (
                        <div>
                            <div className="flex justify-end mb-4">
                                <Button onClick={handleAddDomain}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Domain
                                </Button>
                            </div>
                            <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead>Domain Name</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {domains.map((domain) => (
                                    <TableRow key={domain.id}>
                                    <TableCell className="font-medium">{domain.name}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEditDomain(domain)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDeleteDomain(String(domain.id))} className="text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {activeView === 'verifications' && (
                        <div>
                            <div className="flex gap-2 mb-6 bg-slate-50 p-1.5 rounded-xl border border-slate-100 w-fit">
                                <Button 
                                    size="sm" 
                                    variant={verifTab === 'pending' ? 'secondary' : 'ghost'}
                                    className={cn("rounded-lg font-bold", verifTab === 'pending' && "bg-white shadow-sm")}
                                    onClick={() => setVerifTab('pending')}
                                >
                                    Pending Approval ({pendingVerifications.length})
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant={verifTab === 'disputed' ? 'secondary' : 'ghost'}
                                    className={cn("rounded-lg font-bold", verifTab === 'disputed' && "bg-white shadow-sm")}
                                    onClick={() => setVerifTab('disputed')}
                                >
                                    Flagged / Disputes ({disputedApps.length})
                                </Button>
                            </div>

                            {selectedVerifIds.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 p-4 bg-indigo-600 rounded-xl flex items-center justify-between shadow-lg shadow-indigo-200"
                                >
                                    <div className="flex items-center gap-3 text-white">
                                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                                            {selectedVerifIds.length}
                                        </div>
                                        <span className="font-bold tracking-tight">Referrals Selected</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            size="sm" 
                                            variant="secondary" 
                                            className="font-bold bg-white text-indigo-600 hover:bg-slate-50"
                                            onClick={() => handleBulkResolve('verify')}
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" /> Approve All
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            className="font-bold bg-rose-500 hover:bg-rose-600 border-none"
                                            onClick={() => handleBulkResolve('reject')}
                                        >
                                            <XCircle className="w-4 h-4 mr-2" /> Reject All
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            className="text-white hover:bg-white/10 font-medium"
                                            onClick={() => setSelectedVerifIds([])}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <Checkbox 
                                            checked={
                                                (verifTab === 'pending' ? pendingVerifications : disputedApps).length > 0 &&
                                                selectedVerifIds.length === (verifTab === 'pending' ? pendingVerifications : disputedApps).length
                                            }
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    const allIds = (verifTab === 'pending' ? pendingVerifications : disputedApps).map(a => String(a.id));
                                                    setSelectedVerifIds(allIds);
                                                } else {
                                                    setSelectedVerifIds([]);
                                                }
                                            }}
                                        />
                                    </TableHead>
                                    <TableHead>Applicant/Referrer</TableHead>
                                    <TableHead>Job/Company</TableHead>
                                    <TableHead>Proof</TableHead>
                                    <TableHead>{verifTab === 'disputed' ? 'Reason' : 'Internal Ref ID'}</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                 {(verifTab === 'pending' ? pendingVerifications : disputedApps).map((app) => (
                                    <TableRow key={app.id} className={cn(selectedVerifIds.includes(String(app.id)) && "bg-indigo-50/40")}>
                                    <TableCell>
                                        <Checkbox 
                                            checked={selectedVerifIds.includes(String(app.id))}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedVerifIds(prev => [...prev, String(app.id)]);
                                                } else {
                                                    setSelectedVerifIds(prev => prev.filter(id => id !== String(app.id)));
                                                }
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium whitespace-nowrap">
                                        <div>{app.applicantName}</div>
                                        <div className="text-[10px] items-center flex gap-1 font-bold uppercase tracking-tighter text-indigo-600">
                                            <Star className="w-3 h-3" /> By: {app.posterName || 'Employee'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-bold text-slate-900">{app.jobTitle}</div>
                                        <div className="text-slate-500 text-xs">{app.companyName}</div>
                                    </TableCell>
                                    <TableCell>
                                        {app.proofUrl ? (
                                        <Button variant="outline" size="sm" asChild className="h-8 rounded-lg border-slate-200">
                                            <a 
                                            href={app.proofUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            >
                                            <Eye className="mr-2 h-3.5 w-3.5" />
                                            Proof
                                            </a>
                                        </Button>
                                        ) : (
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-400 font-medium">None</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">
                                        {verifTab === 'disputed' ? (
                                            <span className="text-rose-600 font-bold text-xs italic">{app.disputeReason || 'No reason provided.'}</span>
                                        ) : (
                                            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-mono">{app.internalReferralId || 'N/A'}</code>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2 whitespace-nowrap">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-blue-600" 
                                            onClick={() => setSelectedDispute(app)}
                                            title="View Full Context"
                                        >
                                            <Info className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            className="bg-emerald-600 hover:bg-emerald-700 h-8 rounded-lg px-4" 
                                            onClick={() => handleResolveDispute(String(app.id), 'verify')}
                                        >
                                            {verifTab === 'pending' ? 'Approve' : 'Accept Claim'}
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="destructive" 
                                            className="h-8 rounded-lg" 
                                            onClick={() => handleResolveDispute(String(app.id), 'reject')}
                                        >
                                            {verifTab === 'pending' ? 'Reject Proof' : 'Reject Claim'}
                                        </Button>
                                    </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                            {(verifTab === 'pending' ? pendingVerifications : disputedApps).length === 0 && (
                                <div className="text-center py-20 bg-slate-50/50 border border-dashed rounded-2xl">
                                    <ShieldCheck className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                    <p className="text-slate-400 font-medium tracking-tight">No {verifTab} verifications to review.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeView === 'portal-feedback' && user?.role === 'Super Admin' && (
                        <div>
                             <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Submitted On</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Feedback</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {portalFeedback.map((fb) => (
                                    <TableRow key={fb.id}>
                                    <TableCell className="font-medium">{fb.userName || 'Anonymous'}</TableCell>
                                    <TableCell>{format(new Date(fb.submittedAt), "PPP")}</TableCell>
                                    <TableCell>{renderStars(fb.rating)}</TableCell>
                                    <TableCell>{fb.feedback || 'No comment provided.'}</TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                            {portalFeedback.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">No platform feedback has been submitted yet.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </CardContent>
      </Card>
      <Dialog open={!!selectedDispute} onOpenChange={(open) => !open && setSelectedDispute(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Dispute Investigation</DialogTitle>
                <DialogDescription>
                    Comparing details from candidate and employer sources.
                </DialogDescription>
            </DialogHeader>
            {selectedDispute && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Candidate Side */}
                        <div className="bg-slate-50 p-4 rounded-lg border">
                            <h3 className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                <Star className="w-4 h-4" /> Candidate Profile
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-lg font-bold">{selectedDispute.applicantName}</div>
                                    <div className="text-sm text-muted-foreground">{selectedDispute.applicantEmail}</div>
                                    <div className="text-sm italic text-primary">{selectedDispute.applicantHeadline}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-white p-2 border rounded">
                                        <span className="block text-muted-foreground">Location</span>
                                        <span className="font-medium">{selectedDispute.applicantLocation || 'N/A'}</span>
                                    </div>
                                    <div className="bg-white p-2 border rounded">
                                        <span className="block text-muted-foreground">Exp</span>
                                        <span className="font-medium">{selectedDispute.applicantExperience}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block mb-1">Key Skills</span>
                                    <div className="flex flex-wrap gap-1">
                                        {selectedDispute.applicantSkills?.split(',').map(s => (
                                            <Badge key={s} variant="secondary" className="text-[10px]">{s.trim()}</Badge>
                                        )) || <span className="text-xs italic">No skills listed</span>}
                                    </div>
                                </div>
                                {selectedDispute.applicantSummary && (
                                    <div className="text-xs text-muted-foreground border-t pt-2">
                                        {selectedDispute.applicantSummary.substring(0, 200)}...
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Job/Employer Side */}
                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                             <h3 className="text-sm font-bold text-indigo-500 uppercase mb-3 flex items-center gap-2">
                                <Building className="w-4 h-4" /> Job & Company
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-lg font-bold text-indigo-900">{selectedDispute.jobTitle}</div>
                                    <div className="text-sm font-semibold">{selectedDispute.companyName}</div>
                                    <Badge variant="outline" className="mt-1 border-indigo-200 text-indigo-700">
                                        {selectedDispute.jobType}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-white p-2 border rounded border-indigo-50">
                                        <span className="block text-muted-foreground">Salary Range</span>
                                        <span className="font-medium">
                                            {selectedDispute.jobSalaryMin ? `₹${selectedDispute.jobSalaryMin} - ₹${selectedDispute.jobSalaryMax}` : 'Negotiable'}
                                        </span>
                                    </div>
                                    <div className="bg-white p-2 border rounded border-indigo-50">
                                        <span className="block text-muted-foreground">Job Location</span>
                                        <span className="font-medium">{selectedDispute.jobLocation || 'Hybrid'}</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-white/50 border border-indigo-100 rounded text-xs italic">
                                    <div className="font-semibold text-rose-600 mb-1">Employee Dispute Reason:</div>
                                    &quot;{selectedDispute.disputeReason || 'No reason provided.'}&quot;
                                </div>
                                {selectedDispute.jobIsReferral && (
                                    <div className="flex items-center gap-3 p-2 bg-emerald-50 border border-emerald-100 rounded">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-[10px]">
                                                {selectedDispute.posterName?.charAt(0) || 'E'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="text-[10px]">
                                            <div className="font-bold text-emerald-900">Posted By: {selectedDispute.posterName || 'Unknown Employee'}</div>
                                            <div className="text-emerald-700">{selectedDispute.posterEmail || 'Email unavailable'}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center bg-slate-100 p-4 rounded-lg border-dashed border-2">
                         <div className="text-sm">
                            <span className="font-bold flex items-center gap-2 mb-1">
                                <ShieldCheck className="w-4 h-4 text-primary" /> Verification Proof
                            </span>
                            <span className="text-xs text-muted-foreground">Upload reference document or hire confirmation</span>
                        </div>
                        {selectedDispute.proofUrl ? (
                            <Button variant="default" asChild>
                                <a 
                                    href={selectedDispute.proofUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Review Proof Document
                                </a>
                            </Button>
                        ) : (
                            <Badge variant="destructive">No Proof Uploaded</Badge>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={() => setSelectedDispute(null)}>Close</Button>
                        <Button 
                            variant="destructive" 
                            className="bg-rose-600 hover:bg-rose-700"
                            onClick={() => {
                                handleResolveDispute(String(selectedDispute.id), 'reject');
                                setSelectedDispute(null);
                            }}
                        >
                            <XCircle className="mr-2 h-4 w-4" /> Reject Claim
                        </Button>
                        <Button 
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => {
                                handleResolveDispute(String(selectedDispute.id), 'verify');
                                setSelectedDispute(null);
                            }}
                        >
                            <CheckCircle className="mr-2 h-4 w-4" /> Confirm Hire
                        </Button>
                    </div>
                </div>
            )}
        </DialogContent>
      </Dialog>
    </>
  );
}

    
