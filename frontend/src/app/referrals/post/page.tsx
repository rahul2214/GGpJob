"use client"

import { ReferralForm } from "@/components/referral-form";

export default function PostReferralPage() {
    return (
        <div className="container mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center">
                <div className="w-full max-w-4xl">
                   <ReferralForm />
                </div>
            </div>
        </div>
    );
}
