"use client";

import { useUser } from "@/contexts/user-context";
import { RedemptionHub } from "@/components/rewards/redemption-hub";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function RedeemPage() {
    const { user, refreshUser } = useUser();
    const router = useRouter();

    if (!user) return null;

    return (
        <div className="bg-slate-50 min-h-screen">
            <main className="pt-16">
                <RedemptionHub user={user} refreshUser={refreshUser} isPage={true} />
            </main>
        </div>
    );
}
