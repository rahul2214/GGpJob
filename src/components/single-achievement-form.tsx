"use client";

import { useState, useEffect } from "react";
import { User } from "@/lib/types";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, CheckCircle2, Trophy, Calendar, FileText } from "lucide-react";

interface SingleAchievementFormProps {
    user: User;
    itemIndex?: string | number;
    onSuccess?: () => void;
}

export function SingleAchievementForm({ user, itemIndex, onSuccess }: SingleAchievementFormProps) {
    const { setUser } = useUser();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        title: "",
        issuer: "",
        dateAchieved: "",
        description: "",
    });

    useEffect(() => {
        if (user && Array.isArray(user.achievements) && itemIndex !== undefined && itemIndex !== null && itemIndex !== "") {
            const idx = Number(itemIndex);
            const item = user.achievements[idx];
            if (item) {
                setForm({
                    title: typeof item === "string" ? item : ((item as any).title || (item as any).name || ""),
                    issuer: typeof item === "string" ? "" : ((item as any).issuer || (item as any).issuingOrganization || ""),
                    dateAchieved: typeof item === "string" ? "" : (item.dateAchieved ? item.dateAchieved.split("T")[0] : ""),
                    description: typeof item === "string" ? "" : (item.description || ""),
                });
            }
        }
    }, [user, itemIndex]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) {
            toast({
                title: "Validation Error",
                description: "Title / Title of Honor is required.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const currentAchievements = Array.isArray(user.achievements) ? [...user.achievements] : [];
            const newAchievementObj = {
                title: form.title.trim(),
                issuer: form.issuer.trim(),
                dateAchieved: form.dateAchieved,
                description: form.description.trim(),
            };

            let updatedAchievements: any[];
            if (itemIndex !== undefined && itemIndex !== null && itemIndex !== "" && !isNaN(Number(itemIndex))) {
                const idx = Number(itemIndex);
                updatedAchievements = currentAchievements.map((item, i) => (i === idx ? newAchievementObj : item));
            } else {
                updatedAchievements = [...currentAchievements, newAchievementObj];
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
                    achievements: updatedAchievements,
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to save achievement");
            }

            const updatedUser = await res.json();
            setUser({
                ...user,
                ...updatedUser,
                achievements: updatedUser.achievements || updatedAchievements,
            });

            toast({
                title: itemIndex !== undefined && itemIndex !== "" ? "Achievement Updated! ✨" : "Achievement Added! ✨",
                description: "Your achievement details have been updated successfully.",
            });

            if (onSuccess) onSuccess();
        } catch (err: any) {
            console.error("Save error:", err);
            toast({
                title: "Save Failed",
                description: err.message || "An error occurred while saving your achievement.",
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
                    Title / Title of Honor <span className="text-rose-500">*</span>
                </label>
                <Input
                    placeholder="e.g. Won Hackathon 2026 / Best Developer Award"
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="h-11 rounded-xl border-slate-200 dark:border-slate-700 text-sm font-medium"
                    required
                />
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Issuer / Organization
                </label>
                <Input
                    placeholder="e.g. TechCorp / JNTU / Google"
                    value={form.issuer}
                    onChange={(e) => setForm((prev) => ({ ...prev, issuer: e.target.value }))}
                    className="h-11 rounded-xl border-slate-200 dark:border-slate-700 text-sm font-medium"
                />
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" /> Date Achieved
                </label>
                <Input
                    type="date"
                    value={form.dateAchieved}
                    onChange={(e) => setForm((prev) => ({ ...prev, dateAchieved: e.target.value }))}
                    className="h-11 rounded-xl border-slate-200 dark:border-slate-700 text-sm font-medium"
                />
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" /> Description
                </label>
                <Input
                    placeholder="Brief detail about your award or achievement..."
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="h-11 rounded-xl border-slate-200 dark:border-slate-700 text-sm font-medium"
                />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto h-11 px-8 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-all active:scale-95"
                >
                    {isSubmitting ? (
                        <>
                            <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="w-4 h-4 mr-2 text-amber-200" />
                            {itemIndex !== undefined && itemIndex !== "" ? "Update Achievement" : "Save Achievement"}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
