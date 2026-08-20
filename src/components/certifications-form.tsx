"use client";

import { useState, useEffect } from "react";
import { User } from "@/lib/types";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, LoaderCircle, CheckCircle2, Medal, Calendar, LinkIcon, Hash } from "lucide-react";
import { motion } from "framer-motion";

interface CertificationsFormProps {
    user: User;
    onSuccess?: () => void;
}

export function CertificationsForm({ user, onSuccess }: CertificationsFormProps) {
    const { setUser } = useUser();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial state setup from user object
    const [certifications, setCertifications] = useState<any[]>([]);

    useEffect(() => {
        if (user && Array.isArray(user.certifications)) {
            setCertifications(
                user.certifications.map((c: any) =>
                    typeof c === "string"
                        ? { name: c, issuingOrganization: "", issueDate: "", expirationDate: "", credentialId: "", credentialUrl: "" }
                        : {
                              name: c.name || c.title || "",
                              issuingOrganization: c.issuingOrganization || c.issuer || "",
                              issueDate: c.issueDate || c.dateAchieved || "",
                              expirationDate: c.expirationDate || "",
                              credentialId: c.credentialId || "",
                              credentialUrl: c.credentialUrl || "",
                          }
                )
            );
        }
    }, [user]);

    // Handlers
    const addCertification = () => {
        setCertifications((prev) => [
            ...prev,
            { name: "", issuingOrganization: "", issueDate: "", expirationDate: "", credentialId: "", credentialUrl: "" },
        ]);
    };
    const updateCertification = (index: number, fields: any) => {
        setCertifications((prev) => prev.map((item, idx) => (idx === index ? { ...item, ...fields } : item)));
    };
    const removeCertification = (index: number) => {
        setCertifications((prev) => prev.filter((_, idx) => idx !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Clean empty entries
            const finalCertifications = certifications
                .map((c) => (typeof c === "string" ? { name: c.trim() } : { ...c, name: (c.name || "").trim() }))
                .filter((c) => c.name);

            const targetId = user.uuid || user.id;
            const res = await fetch(`/api/users/${targetId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    certifications: finalCertifications,
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to update certifications");
            }

            const updatedUser = await res.json();
            setUser({
                ...user,
                ...updatedUser,
                certifications: updatedUser.certifications || finalCertifications,
            });

            toast({
                title: "Certifications Saved! ✨",
                description: "Your verified licenses and certifications have been updated in your profile database.",
            });

            if (onSuccess) onSuccess();
        } catch (err: any) {
            console.error("Save error:", err);
            toast({
                title: "Save Failed",
                description: err.message || "An error occurred while saving your certifications.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Add verified licenses, courses, and professional credentials.
                </p>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCertification}
                    className="rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-bold text-xs gap-1.5"
                >
                    <Plus className="w-4 h-4" /> Add Certification
                </Button>
            </div>

            {certifications.length === 0 ? (
                <div className="p-8 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-2xl border border-dashed border-indigo-200 dark:border-indigo-900 text-center">
                    <Medal className="w-10 h-10 text-indigo-400 mx-auto mb-2 opacity-60" />
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No certifications added yet.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Click "Add Certification" above to list your professional certifications.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {certifications.map((cert, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-5 bg-slate-50/70 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4 relative group"
                        >
                            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2.5">
                                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                                    <Medal className="w-3.5 h-3.5" /> Certification #{idx + 1}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeCertification(idx)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Certification Name</label>
                                    <Input
                                        placeholder="e.g. AWS Certified Solutions Architect"
                                        value={cert.name || ""}
                                        onChange={(e) => updateCertification(idx, { name: e.target.value })}
                                        className="h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Issuing Organization</label>
                                    <Input
                                        placeholder="e.g. Amazon Web Services / Google"
                                        value={cert.issuingOrganization || ""}
                                        onChange={(e) => updateCertification(idx, { issuingOrganization: e.target.value })}
                                        className="h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Issue Date
                                    </label>
                                    <Input
                                        type="date"
                                        value={cert.issueDate ? cert.issueDate.split("T")[0] : ""}
                                        onChange={(e) => updateCertification(idx, { issueDate: e.target.value })}
                                        className="h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> Expiration Date (Optional)
                                    </label>
                                    <Input
                                        type="date"
                                        value={cert.expirationDate ? cert.expirationDate.split("T")[0] : ""}
                                        onChange={(e) => updateCertification(idx, { expirationDate: e.target.value })}
                                        className="h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                        <Hash className="w-3.5 h-3.5 text-slate-400" /> Credential ID (Optional)
                                    </label>
                                    <Input
                                        placeholder="e.g. AWS-123456"
                                        value={cert.credentialId || ""}
                                        onChange={(e) => updateCertification(idx, { credentialId: e.target.value })}
                                        className="h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                        <LinkIcon className="w-3.5 h-3.5 text-sky-500" /> Credential URL (Optional)
                                    </label>
                                    <Input
                                        placeholder="e.g. https://www.credly.com/badges/..."
                                        value={cert.credentialUrl || ""}
                                        onChange={(e) => updateCertification(idx, { credentialUrl: e.target.value })}
                                        className="h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto h-11 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all active:scale-95"
                >
                    {isSubmitting ? (
                        <>
                            <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                            Saving Certifications...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="w-4 h-4 mr-2 text-indigo-200" />
                            Save Certifications
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
