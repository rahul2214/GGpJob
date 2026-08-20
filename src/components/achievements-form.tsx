"use client";

import { useState, useEffect } from "react";
import { User } from "@/lib/types";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, LoaderCircle, CheckCircle2, Trophy, Calendar, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface AchievementsFormProps {
    user: User;
    onSuccess?: () => void;
}

export function AchievementsForm({ user, onSuccess }: AchievementsFormProps) {
    const { setUser } = useUser();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial state setup from user object
    const [achievements, setAchievements] = useState<any[]>([]);

    useEffect(() => {
        if (user && Array.isArray(user.achievements)) {
            setAchievements(
                user.achievements.map((a: any) =>
                    typeof a === "string"
                        ? { title: a, issuer: "", dateAchieved: "", description: "" }
                        : {
                              title: a.title || a.name || "",
                              issuer: a.issuer || a.issuingOrganization || "",
                              dateAchieved: a.dateAchieved || a.issueDate || "",
                              description: a.description || "",
                          }
                )
            );
        }
    }, [user]);

    // Handlers
    const addAchievement = () => {
        setAchievements((prev) => [...prev, { title: "", issuer: "", dateAchieved: "", description: "" }]);
    };
    const updateAchievement = (index: number, fields: any) => {
        setAchievements((prev) => prev.map((item, idx) => (idx === index ? { ...item, ...fields } : item)));
    };
    const removeAchievement = (index: number) => {
        setAchievements((prev) => prev.filter((_, idx) => idx !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Clean empty entries
            const finalAchievements = achievements
                .map((a) => (typeof a === "string" ? { title: a.trim() } : { ...a, title: (a.title || "").trim() }))
                .filter((a) => a.title);

            const targetId = user.uuid || user.id;
            const res = await fetch(`/api/users/${targetId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    achievements: finalAchievements,
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to update achievements");
            }

            const updatedUser = await res.json();
            setUser({
                ...user,
                ...updatedUser,
                achievements: updatedUser.achievements || finalAchievements,
            });

            toast({
                title: "Achievements Saved! ✨",
                description: "Your honors and accomplishments have been updated in your profile database.",
            });

            if (onSuccess) onSuccess();
        } catch (err: any) {
            console.error("Save error:", err);
            toast({
                title: "Save Failed",
                description: err.message || "An error occurred while saving your achievements.",
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
                    Add awards, honors, competitions, and accomplishments.
                </p>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAchievement}
                    className="rounded-xl border-amber-200 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-bold text-xs gap-1.5"
                >
                    <Plus className="w-4 h-4" /> Add Achievement
                </Button>
            </div>

            {achievements.length === 0 ? (
                <div className="p-8 bg-amber-50/40 dark:bg-amber-950/20 rounded-2xl border border-dashed border-amber-200 dark:border-amber-900 text-center">
                    <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-2 opacity-60" />
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No achievements added yet.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Click "Add Achievement" above to list your awards or recognitions.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {achievements.map((ach, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-5 bg-slate-50/70 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4 relative group"
                        >
                            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2.5">
                                <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                                    <Trophy className="w-3.5 h-3.5" /> Achievement #{idx + 1}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeAchievement(idx)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="sm:col-span-2 space-y-1">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Title / Title of Honor</label>
                                    <Input
                                        placeholder="e.g. Won Hackathon 2025 / Best Developer Award"
                                        value={ach.title || ""}
                                        onChange={(e) => updateAchievement(idx, { title: e.target.value })}
                                        className="h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Issuer / Organization</label>
                                    <Input
                                        placeholder="e.g. TechCorp / JNTU"
                                        value={ach.issuer || ""}
                                        onChange={(e) => updateAchievement(idx, { issuer: e.target.value })}
                                        className="h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5 text-amber-500" /> Date Achieved
                                    </label>
                                    <Input
                                        type="date"
                                        value={ach.dateAchieved ? ach.dateAchieved.split("T")[0] : ""}
                                        onChange={(e) => updateAchievement(idx, { dateAchieved: e.target.value })}
                                        className="h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                                    />
                                </div>
                                <div className="sm:col-span-2 space-y-1">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                        <FileText className="w-3.5 h-3.5 text-slate-400" /> Description
                                    </label>
                                    <Input
                                        placeholder="Brief detail about your award or achievement..."
                                        value={ach.description || ""}
                                        onChange={(e) => updateAchievement(idx, { description: e.target.value })}
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
                    className="w-full sm:w-auto h-11 px-8 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-all active:scale-95"
                >
                    {isSubmitting ? (
                        <>
                            <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                            Saving Achievements...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="w-4 h-4 mr-2 text-amber-200" />
                            Save Achievements
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
