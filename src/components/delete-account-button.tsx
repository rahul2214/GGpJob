"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
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
            const response = await fetch('/api/account/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.uuid }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to request account deletion');
            }

            toast({
                title: "Account Scheduled for Deletion",
                description: "Your account is deactivated. You have 30 days to restore it before permanent removal.",
            });

            // Sign out the user and redirect to home
            await logout();
            router.push('/');
        } catch (error: any) {
            console.error("Delete account error:", error);
            toast({
                title: "Deletion Failed",
                description: error.message || "An unexpected error occurred while processing your request.",
                variant: "destructive",
            });
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="p-5 bg-rose-50/80 border border-rose-100 rounded-2xl flex items-start gap-3.5">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                    <p className="font-bold text-rose-900">Deactivate & Delete Account</p>
                    <p className="text-rose-700/80 mt-1 leading-relaxed text-xs font-medium">
                        Your account will be deactivated immediately. You can restore your account anytime within 30 days. After 30 days, your personal data will be permanently removed.
                    </p>
                </div>
            </div>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button 
                        variant="destructive" 
                        className="w-full sm:w-auto h-11 px-6 rounded-xl font-bold transition-all hover:scale-[1.01] active:scale-95 shadow-md shadow-rose-200"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-3xl border-slate-100 shadow-2xl max-w-lg p-7">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-black text-slate-900">Delete your account?</AlertDialogTitle>
                        <div className="text-slate-600 text-sm mt-3 space-y-2.5">
                            <p className="font-semibold text-slate-700">Your account will be deactivated immediately.</p>
                            <ul className="space-y-2 text-xs font-medium text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-500 font-bold">•</span>
                                    <span>Your public profile will no longer be visible.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-500 font-bold">•</span>
                                    <span>Your active jobs/referrals will be closed.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-500 font-bold">•</span>
                                    <span>Your applications and payment history will remain for record purposes.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-500 font-bold">•</span>
                                    <span>You can restore your account within 30 days.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-500 font-bold">•</span>
                                    <span>After 30 days your personal information will be permanently removed.</span>
                                </li>
                            </ul>
                        </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
                        <AlertDialogCancel className="rounded-xl border-slate-200 font-bold h-11 px-5">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => {
                                e.preventDefault();
                                handleDeleteAccount();
                            }}
                            className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold h-11 px-6 shadow-lg shadow-rose-200"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "Delete Account"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
