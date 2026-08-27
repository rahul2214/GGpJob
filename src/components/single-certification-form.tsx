"use client";

import { useState, useEffect } from "react";
import { User } from "@/lib/types";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, CheckCircle2, Medal, Calendar, LinkIcon, Hash } from "lucide-react";

interface SingleCertificationFormProps {
    user: User;
    itemIndex?: string | number;
    onSuccess?: () => void;
}

export function SingleCertificationForm({ user, itemIndex, onSuccess }: SingleCertificationFormProps) {
    const { setUser } = useUser();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        name: "",
        issuingOrganization: "",
        issueDate: "",
        expirationDate: "",
        credentialId: "",
        credentialUrl: "",
    });

    useEffect(() => {
        if (user && Array.isArray(user.certifications) && itemIndex !== undefined && itemIndex !== null && itemIndex !== "") {
            const idx = Number(itemIndex);
            const item = user.certifications[idx];
            if (item) {
                setForm({
                    name: typeof item === "string" ? item : ((item as any).name || (item as any).title || ""),
                    issuingOrganization: typeof item === "string" ? "" : ((item as any).issuingOrganization || (item as any).issuer || ""),
                    issueDate: typeof item === "string" ? "" : (item.issueDate ? item.issueDate.split("T")[0] : ""),
                    expirationDate: typeof item === "string" ? "" : (item.expirationDate ? item.expirationDate.split("T")[0] : ""),
                    credentialId: typeof item === "string" ? "" : (item.credentialId || ""),
                    credentialUrl: typeof item === "string" ? "" : (item.credentialUrl || ""),
                });
            }
        }
    }, [user, itemIndex]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) {
            toast({
                title: "Validation Error",
                description: "Certification Name is required.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const currentCerts = Array.isArray(user.certifications) ? [...user.certifications] : [];
            const newCertObj = {
                name: form.name.trim(),
                issuingOrganization: form.issuingOrganization.trim(),
                issueDate: form.issueDate,
                expirationDate: form.expirationDate,
                credentialId: form.credentialId.trim(),
                credentialUrl: form.credentialUrl.trim(),
            };

            let updatedCerts: any[];
            if (itemIndex !== undefined && itemIndex !== null && itemIndex !== "" && !isNaN(Number(itemIndex))) {
                const idx = Number(itemIndex);
                updatedCerts = currentCerts.map((item, i) => (i === idx ? newCertObj : item));
            } else {
                updatedCerts = [...currentCerts, newCertObj];
            }

            const targetId = user.uuid || user.id;
            const res = await fetch(`/api/users/${targetId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    certifications: updatedCerts,
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to save certification");
            }

            const updatedUser = await res.json();
            setUser({
                ...user,
                ...updatedUser,
                certifications: updatedUser.certifications || updatedCerts,
            });

            toast({
                title: itemIndex !== undefined && itemIndex !== "" ? "Certification Updated! ✨" : "Certification Added! ✨",
                description: "Your certification details have been updated successfully.",
            });

            if (onSuccess) onSuccess();
        } catch (err: any) {
            console.error("Save error:", err);
            toast({
                title: "Save Failed",
                description: err.message || "An error occurred while saving your certification.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Certification Name <span className="text-rose-500">*</span>
                </label>
                <Input
                    placeholder="e.g. AWS Certified Solutions Architect"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="h-11 rounded-xl border-slate-200 dark:border-slate-700 text-sm font-medium"
                    required
                />
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Issuing Organization
                </label>
                <Input
                    placeholder="e.g. Amazon Web Services / Google"
                    value={form.issuingOrganization}
                    onChange={(e) => setForm((prev) => ({ ...prev, issuingOrganization: e.target.value }))}
                    className="h-11 rounded-xl border-slate-200 dark:border-slate-700 text-sm font-medium"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Issue Date
                    </label>
                    <Input
                        type="date"
                        value={form.issueDate}
                        onChange={(e) => setForm((prev) => ({ ...prev, issueDate: e.target.value }))}
                        className="h-11 rounded-xl border-slate-200 dark:border-slate-700 text-sm font-medium"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> Expiration Date (Optional)
                    </label>
                    <Input
                        type="date"
                        value={form.expirationDate}
                        onChange={(e) => setForm((prev) => ({ ...prev, expirationDate: e.target.value }))}
                        className="h-11 rounded-xl border-slate-200 dark:border-slate-700 text-sm font-medium"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-slate-400" /> Credential ID (Optional)
                    </label>
                    <Input
                        placeholder="e.g. AWS-123456"
                        value={form.credentialId}
                        onChange={(e) => setForm((prev) => ({ ...prev, credentialId: e.target.value }))}
                        className="h-11 rounded-xl border-slate-200 dark:border-slate-700 text-sm font-medium"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <LinkIcon className="w-3.5 h-3.5 text-sky-500" /> Credential URL (Optional)
                    </label>
                    <Input
                        placeholder="e.g. https://www.credly.com/badges/..."
                        value={form.credentialUrl}
                        onChange={(e) => setForm((prev) => ({ ...prev, credentialUrl: e.target.value }))}
                        className="h-11 rounded-xl border-slate-200 dark:border-slate-700 text-sm font-medium"
                    />
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto h-11 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all active:scale-95"
                >
                    {isSubmitting ? (
                        <>
                            <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="w-4 h-4 mr-2 text-indigo-200" />
                            {itemIndex !== undefined && itemIndex !== "" ? "Update Certification" : "Save Certification"}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
