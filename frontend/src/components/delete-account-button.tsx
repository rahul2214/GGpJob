
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle, 
    AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/user-context";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";

export function DeleteAccountButton() {
    const { user, logout } = useUser();
    const { toast } = useToast();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteAccount = async () => {
        if (!user?.uuid) {
            toast({
                title: "Error",
                description: "User information not found. Please try logging in again.",
                variant: "destructive",
            });
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/users/${user.uuid}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete account');
            }

            toast({
                title: "Account Deleted",
                description: "Your account and all associated data have been permanently removed.",
            });

            // Sign out the user and redirect to home
            await logout();
            router.push('/');
        } catch (error: any) {
            console.error("Delete account error:", error);
            toast({
                title: "Deletion Failed",
                description: error.message || "An unexpected error occurred while deleting your account.",
                variant: "destructive",
            });
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                    <p className="font-bold text-rose-800">Warning: Permanent Action</p>
                    <p className="text-rose-600/80 mt-1 leading-relaxed">
                        Deleting your account will permanently remove your profile, applications, and all other data. 
                        This action cannot be undone.
                    </p>
                </div>
            </div>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button 
                        variant="destructive" 
                        className="w-full sm:w-auto h-12 px-8 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-rose-200"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Permanently Delete My Account
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-3xl border-slate-100 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-bold text-slate-800">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500 text-base">
                            This action cannot be undone. This will permanently delete your
                            account and remove your data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel className="rounded-xl border-slate-200 font-bold h-12">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => {
                                e.preventDefault();
                                handleDeleteAccount();
                            }}
                            className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold h-12 px-6"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting Account...
                                </>
                            ) : (
                                "Yes, Delete Everything"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
