"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/user-context";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, LogOut, AlertTriangle, Loader2 } from "lucide-react";

interface AccountRestoreModalProps {
  open: boolean;
  onRestored: () => void;
}

export function AccountRestoreModal({ open, onRestored }: AccountRestoreModalProps) {
  const { user, logout } = useUser();
  const { toast } = useToast();
  const [restoring, setRestoring] = useState(false);

  if (!user || !open) return null;

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const res = await fetch("/api/account/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uuid }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to restore account");
      }

      toast({
        title: "Account Restored! 🎉",
        description: "Welcome back! All your features and access have been reactivated.",
      });

      onRestored();
    } catch (err: any) {
      console.error("Account restore error:", err);
      toast({
        title: "Restore Failed",
        description: err.message || "Failed to restore your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRestoring(false);
    }
  };

  const handleContinueDeletion = async () => {
    await logout();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[460px] rounded-3xl p-8 border-none shadow-2xl bg-white select-none">
        <DialogHeader className="text-center sm:text-center items-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mb-4 text-amber-600 border border-amber-200">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
            Your account is scheduled for deletion.
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-sm mt-2 font-medium">
            You can still restore your account. Restoring your account will reactivate all features and profile data instantly.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 flex flex-col gap-3">
          <Button
            onClick={handleRestore}
            disabled={restoring}
            className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-200"
          >
            {restoring ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Restoring Account...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Restore Account
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={handleContinueDeletion}
            disabled={restoring}
            className="w-full h-11 rounded-xl text-slate-500 hover:text-slate-900 font-semibold text-sm hover:bg-slate-100"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Continue Deletion
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
