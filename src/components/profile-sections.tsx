
"use client"

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Education, Project, Employment, Language, Skill } from '@/lib/types';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, BookOpen, Briefcase, Lightbulb, Languages, LinkIcon, Wrench, Trophy, Award } from 'lucide-react';
import { format } from 'date-fns';
import { ProfileSectionForm } from './profile-section-form';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from './ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase-client';


type Section = 'education' | 'employment' | 'projects' | 'languages' | 'skills' | 'personal';
type ProfileData = {
    education: Education[],
    employment: Employment[],
    projects: Project[],
    languages: Language[],
    skills: Skill[],
    personal: any | null,
    achievements: any[],
    certifications: any[],
};

interface ProfileSectionsProps {
    userId: string | number;
    isEditable?: boolean;
}

export function ProfileSections({ userId, isEditable = false }: ProfileSectionsProps) {
    const [data, setData] = useState<ProfileData>({ education: [], employment: [], projects: [], languages: [], skills: [], personal: null, achievements: [], certifications: [] });
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentSection, setCurrentSection] = useState<Section | null>(null);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const { toast } = useToast();
    const router = useRouter();
    const isMobile = useIsMobile();

    // Achievements & Certifications Modal State
    const [achievementModalOpen, setAchievementModalOpen] = useState(false);
    const [editingAchievementIndex, setEditingAchievementIndex] = useState<number | null>(null);
    const [achievementForm, setAchievementForm] = useState({ title: '', issuer: '', dateAchieved: '', description: '' });

    const [certModalOpen, setCertModalOpen] = useState(false);
    const [editingCertIndex, setEditingCertIndex] = useState<number | null>(null);
    const [certForm, setCertForm] = useState({ name: '', issuingOrganization: '', issueDate: '', expirationDate: '', credentialId: '', credentialUrl: '' });
    const [isSubmittingExtra, setIsSubmittingExtra] = useState(false);

    const handleOpenAchievementModal = (item: any = null, index: number | null = null) => {
        if (isMobile) {
            if (index !== null) {
                router.push(`/profile/achievements/edit/${index}`);
            } else {
                router.push(`/profile/achievements/add`);
            }
        } else {
            setEditingAchievementIndex(index);
            if (item) {
                setAchievementForm({
                    title: item.title || '',
                    issuer: item.issuer || '',
                    dateAchieved: item.dateAchieved ? item.dateAchieved.split('T')[0] : '',
                    description: item.description || '',
                });
            } else {
                setAchievementForm({ title: '', issuer: '', dateAchieved: '', description: '' });
            }
            setAchievementModalOpen(true);
        }
    };

    const getAuthHeaders = async () => {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return headers;
    };

    const handleSaveAchievement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!achievementForm.title.trim()) {
            toast({ title: 'Error', description: 'Title is required', variant: 'destructive' });
            return;
        }
        setIsSubmittingExtra(true);
        try {
            let updatedAchievements = [...data.achievements];
            if (editingAchievementIndex !== null) {
                updatedAchievements[editingAchievementIndex] = { ...achievementForm };
            } else {
                updatedAchievements.push({ ...achievementForm });
            }

            const headers = await getAuthHeaders();
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ achievements: updatedAchievements }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to save achievement');
            }

            toast({ title: 'Success', description: 'Achievement saved successfully.' });
            await fetchData();
            setAchievementModalOpen(false);
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        } finally {
            setIsSubmittingExtra(false);
        }
    };

    const handleDeleteAchievement = async (index: number) => {
        if (!window.confirm("Are you sure you want to delete this achievement?")) return;
        const updatedAchievements = data.achievements.filter((_, idx) => idx !== index);
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ achievements: updatedAchievements }),
            });
            if (!response.ok) throw new Error('Failed to delete achievement');
            toast({ title: 'Success', description: 'Achievement deleted.' });
            await fetchData();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const handleOpenCertModal = (item: any = null, index: number | null = null) => {
        if (isMobile) {
            if (index !== null) {
                router.push(`/profile/certifications/edit/${index}`);
            } else {
                router.push(`/profile/certifications/add`);
            }
        } else {
            setEditingCertIndex(index);
            if (item) {
                setCertForm({
                    name: item.name || '',
                    issuingOrganization: item.issuingOrganization || '',
                    issueDate: item.issueDate ? item.issueDate.split('T')[0] : '',
                    expirationDate: item.expirationDate ? item.expirationDate.split('T')[0] : '',
                    credentialId: item.credentialId || '',
                    credentialUrl: item.credentialUrl || '',
                });
            } else {
                setCertForm({ name: '', issuingOrganization: '', issueDate: '', expirationDate: '', credentialId: '', credentialUrl: '' });
            }
            setCertModalOpen(true);
        }
    };

    const handleSaveCertification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!certForm.name.trim()) {
            toast({ title: 'Error', description: 'Certification name is required', variant: 'destructive' });
            return;
        }
        setIsSubmittingExtra(true);
        try {
            let updatedCerts = [...data.certifications];
            if (editingCertIndex !== null) {
                updatedCerts[editingCertIndex] = { ...certForm };
            } else {
                updatedCerts.push({ ...certForm });
            }

            const headers = await getAuthHeaders();
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ certifications: updatedCerts }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to save certification');
            }

            toast({ title: 'Success', description: 'Certification saved successfully.' });
            await fetchData();
            setCertModalOpen(false);
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        } finally {
            setIsSubmittingExtra(false);
        }
    };

    const handleDeleteCertification = async (index: number) => {
        if (!window.confirm("Are you sure you want to delete this certification?")) return;
        const updatedCerts = data.certifications.filter((_, idx) => idx !== index);
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ certifications: updatedCerts }),
            });
            if (!response.ok) throw new Error('Failed to delete certification');
            toast({ title: 'Success', description: 'Certification deleted.' });
            await fetchData();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };


    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/users/${userId}/profile`);
            const fetchedData = await res.json();
            setData({
                education: fetchedData.education || [],
                employment: fetchedData.employment || [],
                projects: fetchedData.projects || [],
                languages: fetchedData.languages || [],
                skills: fetchedData.skills || [],
                personal: fetchedData.personal || null,
                achievements: fetchedData.achievements || [],
                certifications: fetchedData.certifications || [],
            });
        } catch (error) {
            console.error("Failed to fetch profile sections", error);
            toast({ title: "Error", description: "Could not fetch profile details." });
        } finally {
            setLoading(false);
        }
    }, [userId, toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenForm = (section: Section, item: any | null = null) => {
        if (isMobile) {
            const basePath = `/profile/${section}`;
            if (item) {
                router.push(`${basePath}/edit/${item.id}`);
            } else {
                router.push(`${basePath}/add`);
            }
        } else {
            setCurrentSection(section);
            setEditingItem(item);
            setIsFormOpen(true);
        }
    };
    
    const handleFormSubmit = async (values: any) => {
        if (!currentSection) return;

        const isEditing = !!editingItem;
        const url = `/api/users/${userId}/profile?section=${currentSection}`;
        const method = isEditing ? 'PUT' : 'POST';

        let bodyData = { ...values };
        if (currentSection === 'employment' && values.isCurrent) {
            bodyData.endDate = '';
        }
        delete bodyData.isCurrent;

        const body = JSON.stringify(isEditing ? { ...bodyData, id: editingItem.id } : bodyData);

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save data');
            }
            
            toast({ title: 'Success', description: `Your ${currentSection} has been saved.` });
            await fetchData();
            setIsFormOpen(false);

        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };
    
     const handleDelete = async (section: Section, id: string | number) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;

        try {
            const response = await fetch(`/api/users/${userId}/profile?section=${section}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete item');
            }
            
            toast({ title: 'Success', description: 'Item deleted.' });
            await fetchData();

        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };
    
    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr || dateStr.toLowerCase() === 'present') return 'Present';
        try {
            const [year, month] = dateStr.split('-');
            if (!year || !month) return 'Present';
            return format(new Date(Number(year), Number(month) - 1), 'MMM yyyy');
        } catch (e) {
            return 'Present';
        }
    }

    if(loading) return <div>Loading profile...</div>

    return (
       <>
         <Accordion type="multiple" className="w-full space-y-6" defaultValue={['item-1', 'item-2', 'item-3', 'item-4', 'item-5', 'item-6', 'item-7']}>
                {/* Employment Section */}
                <AccordionItem value="item-1">
                     <Card>
                        <AccordionTrigger className="p-6">
                             <div className="flex items-center gap-4">
                                <Briefcase className="h-6 w-6 text-primary" />
                                <CardTitle className="text-xl">Employment History</CardTitle>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-6 pt-0">
                            <div className="space-y-4">
                                {data.employment.map(item => (
                                    <div key={item.id} className="p-4 border rounded-lg relative group">
                                        {isEditable && (
                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenForm('employment', item)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete('employment', item.id)}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        )}
                                        <h3 className="font-semibold">{item.title}</h3>
                                        <p className="text-sm">{item.company} · {item.employmentType}</p>
                                        <p className="text-xs text-muted-foreground">{formatDate(item.startDate)} - {formatDate(item.endDate)} · {item.location}</p>
                                        {item.description && <p className="text-sm mt-2 whitespace-pre-wrap">{item.description}</p>}
                                    </div>
                                ))}
                            </div>
                             {isEditable && (
                                <Button variant="outline" className="mt-4" onClick={() => handleOpenForm('employment')}>
                                    <PlusCircle className="mr-2" /> Add Employment
                                </Button>
                             )}
                        </AccordionContent>
                    </Card>
                </AccordionItem>
                {/* Education Section */}
                 <AccordionItem value="item-2">
                    <Card>
                        <AccordionTrigger className="p-6">
                            <div className="flex items-center gap-4">
                                <BookOpen className="h-6 w-6 text-primary" />
                                <CardTitle className="text-xl">Education</CardTitle>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-6 pt-0">
                            <div className="space-y-4">
                                {data.education.map(item => (
                                    <div key={item.id} className="p-4 border rounded-lg relative group">
                                        {isEditable && (
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenForm('education', item)}><Edit className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete('education', item.id)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                        )}
                                        <h3 className="font-semibold">{item.institution}</h3>
                                        <p className="text-sm">{item.degree}, {item.fieldOfStudy}</p>
                                        {item.grade && <p className="text-sm font-medium">Grade: {item.grade}</p>}
                                        <p className="text-xs text-muted-foreground">{formatDate(item.startDate)} - {formatDate(item.endDate)}</p>
                                        {item.description && <p className="text-sm mt-2 whitespace-pre-wrap">{item.description}</p>}
                                    </div>
                                ))}
                            </div>
                             {isEditable && (
                                <Button variant="outline" className="mt-4" onClick={() => handleOpenForm('education')}>
                                    <PlusCircle className="mr-2" /> Add Education
                                </Button>
                             )}
                        </AccordionContent>
                    </Card>
                </AccordionItem>
                {/* Skills Section */}
                <AccordionItem value="item-5">
                     <Card>
                        <AccordionTrigger className="p-6">
                             <div className="flex items-center gap-4">
                                <Wrench className="h-6 w-6 text-primary" />
                                <CardTitle className="text-xl">Skills</CardTitle>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-6 pt-0">
                            <div className="flex flex-wrap gap-2">
                                {data.skills.map(item => (
                                    <div key={item.uuid || item.id} className="relative group">
                                         <Badge variant="secondary" className="text-sm py-1 pr-8 pl-3 flex items-center gap-2">
                                            {item.name}
                                            {(item.proficiencyLevel || item.yearsExperience !== undefined) && (
                                                <span className="text-[10px] text-muted-foreground border-l pl-2 flex items-center gap-1 opacity-70">
                                                    {item.proficiencyLevel && <span className="capitalize">{item.proficiencyLevel}</span>}
                                                    {item.proficiencyLevel && item.yearsExperience !== undefined && <span>·</span>}
                                                    {item.yearsExperience !== undefined && <span>{item.yearsExperience} yrs</span>}
                                                </span>
                                            )}
                                        </Badge>
                                        {isEditable && (
                                            <div className="absolute -top-2 -right-2 flex opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleOpenForm('skills', item)}><Edit className="h-3 w-3" /></Button>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete('skills', item.uuid || item.id)}><Trash2 className="h-3 w-3" /></Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {data.skills.length === 0 && !isEditable && (
                                    <p className="text-sm text-muted-foreground">No skills listed.</p>
                                )}
                            </div>
                             {isEditable && (
                                <Button variant="outline" className="mt-4" onClick={() => handleOpenForm('skills')}>
                                    <PlusCircle className="mr-2" /> Add Skill
                                </Button>
                             )}
                        </AccordionContent>
                    </Card>
                </AccordionItem>
                 {/* Languages Section */}
                <AccordionItem value="item-4">
                     <Card>
                        <AccordionTrigger className="p-6">
                             <div className="flex items-center gap-4">
                                <Languages className="h-6 w-6 text-primary" />
                                <CardTitle className="text-xl">Languages</CardTitle>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-6 pt-0">
                           <div className="space-y-4">
                                {data.languages.map(item => (
                                    <div key={item.id} className="p-4 border rounded-lg relative group">
                                        {isEditable && (
                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenForm('languages', item)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete('languages', item.id)}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        )}
                                        <h3 className="font-semibold">{item.language}</h3>
                                        <p className="text-sm text-muted-foreground">{item.proficiency}</p>
                                    </div>
                                ))}
                           </div>
                           {isEditable && (
                            <Button variant="outline" className="mt-4" onClick={() => handleOpenForm('languages')}>
                                <PlusCircle className="mr-2" /> Add Language
                            </Button>
                           )}
                        </AccordionContent>
                    </Card>
                </AccordionItem>
                 {/* Projects Section */}
                <AccordionItem value="item-3">
                     <Card>
                        <AccordionTrigger className="p-6">
                            <div className="flex items-center gap-4">
                                <Lightbulb className="h-6 w-6 text-primary" />
                                <CardTitle className="text-xl">Projects</CardTitle>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-6 pt-0">
                            <div className="space-y-4">
                                {data.projects.map(item => (
                                    <div key={item.id} className="p-4 border rounded-lg relative group">
                                        {isEditable && (
                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenForm('projects', item)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete('projects', item.id)}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                           <h3 className="font-semibold">{item.name}</h3>
                                           {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer"><LinkIcon className="h-4 w-4 text-primary hover:underline"/></a>}
                                        </div>
                                        <p className="text-xs text-muted-foreground">{formatDate(item.startDate)} - {formatDate(item.endDate)}</p>
                                        {item.description && <p className="text-sm mt-2 whitespace-pre-wrap">{item.description}</p>}
                                    </div>
                                ))}
                                {data.projects.length === 0 && !isEditable && (
                                    <p className="text-sm text-muted-foreground">No projects listed.</p>
                                )}
                            </div>
                            {isEditable && (
                                <Button variant="outline" className="mt-4" onClick={() => handleOpenForm('projects')}>
                                    <PlusCircle className="mr-2" /> Add Project
                                </Button>
                            )}
                        </AccordionContent>
                    </Card>
                </AccordionItem>
                {/* Achievements Section */}
                <AccordionItem value="item-6">
                     <Card>
                        <AccordionTrigger className="p-6">
                            <div className="flex items-center gap-4">
                                <Trophy className="h-6 w-6 text-amber-500" />
                                <CardTitle className="text-xl">Achievements & Honors</CardTitle>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-6 pt-0">
                            <div className="space-y-4">
                                {data.achievements.map((item, idx) => (
                                    <div key={item.id || idx} className="p-4 border rounded-lg relative group">
                                        {isEditable && (
                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenAchievementModal(item, idx)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteAchievement(idx)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                        <h3 className="font-semibold text-slate-900 pr-16">{item.title}</h3>
                                        {item.issuer && <p className="text-sm text-slate-600">Issuer: {item.issuer}</p>}
                                        {item.dateAchieved && <p className="text-xs text-muted-foreground mt-0.5">{formatDate(item.dateAchieved)}</p>}
                                        {item.description && <p className="text-sm mt-2 text-slate-600 whitespace-pre-wrap">{item.description}</p>}
                                    </div>
                                ))}
                                {data.achievements.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No achievements listed.</p>
                                )}
                            </div>
                            {isEditable && (
                                <Button variant="outline" className="mt-4" onClick={() => handleOpenAchievementModal()}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Achievement
                                </Button>
                            )}
                        </AccordionContent>
                    </Card>
                </AccordionItem>
                {/* Certifications Section */}
                <AccordionItem value="item-7">
                     <Card>
                        <AccordionTrigger className="p-6">
                            <div className="flex items-center gap-4">
                                <Award className="h-6 w-6 text-indigo-600" />
                                <CardTitle className="text-xl">Certifications</CardTitle>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-6 pt-0">
                            <div className="space-y-4">
                                {data.certifications.map((item, idx) => (
                                    <div key={item.id || idx} className="p-4 border rounded-lg relative group">
                                        {isEditable && (
                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenCertModal(item, idx)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteCertification(idx)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between pr-16">
                                            <h3 className="font-semibold text-slate-900">{item.name}</h3>
                                            {item.credentialUrl && (
                                                <a href={item.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 font-medium flex items-center gap-1 hover:underline">
                                                    Credential <LinkIcon className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>
                                        {item.issuingOrganization && <p className="text-sm text-slate-600">{item.issuingOrganization}</p>}
                                        {item.credentialId && <p className="text-xs text-slate-500 font-mono mt-1">Credential ID: {item.credentialId}</p>}
                                        {(item.issueDate || item.expirationDate) && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Issued: {formatDate(item.issueDate)} {item.expirationDate ? `· Expires: ${formatDate(item.expirationDate)}` : ''}
                                            </p>
                                        )}
                                    </div>
                                ))}
                                {data.certifications.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No certifications listed.</p>
                                )}
                            </div>
                            {isEditable && (
                                <Button variant="outline" className="mt-4" onClick={() => handleOpenCertModal()}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Certification
                                </Button>
                            )}
                        </AccordionContent>
                    </Card>
                </AccordionItem>
            </Accordion>

            {!isMobile && (
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Edit' : 'Add'} {currentSection === 'personal' ? 'Personal Details' : currentSection}</DialogTitle>
                            <DialogDescription>
                                Fill in the details below.
                            </DialogDescription>
                        </DialogHeader>
                        <ProfileSectionForm 
                            currentSection={currentSection}
                            editingItem={editingItem}
                            onFormSubmit={handleFormSubmit}
                            onCancel={() => setIsFormOpen(false)}
                            existingData={data}
                        />
                    </DialogContent>
                </Dialog>
            )}

            {/* Achievement Edit/Add Dialog */}
            <Dialog open={achievementModalOpen} onOpenChange={setAchievementModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingAchievementIndex !== null ? 'Edit Achievement' : 'Add Achievement'}</DialogTitle>
                        <DialogDescription>Enter details about your award or honor.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveAchievement} className="space-y-4 pt-2">
                        <div className="space-y-1">
                            <Label className="text-xs font-bold">Title / Title of Honor</Label>
                            <Input
                                placeholder="e.g. Won Hackathon 2025"
                                value={achievementForm.title}
                                onChange={(e) => setAchievementForm(prev => ({ ...prev, title: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold">Issuer / Organization</Label>
                            <Input
                                placeholder="e.g. TechCorp / University"
                                value={achievementForm.issuer}
                                onChange={(e) => setAchievementForm(prev => ({ ...prev, issuer: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold">Date Achieved</Label>
                            <Input
                                type="date"
                                value={achievementForm.dateAchieved}
                                onChange={(e) => setAchievementForm(prev => ({ ...prev, dateAchieved: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold">Description</Label>
                            <Input
                                placeholder="Brief detail about your award..."
                                value={achievementForm.description}
                                onChange={(e) => setAchievementForm(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setAchievementModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmittingExtra} className="bg-amber-600 hover:bg-amber-700 text-white font-bold">
                                {isSubmittingExtra ? 'Saving...' : 'Save Achievement'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Certification Edit/Add Dialog */}
            <Dialog open={certModalOpen} onOpenChange={setCertModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingCertIndex !== null ? 'Edit Certification' : 'Add Certification'}</DialogTitle>
                        <DialogDescription>Enter details about your certification or license.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveCertification} className="space-y-4 pt-2">
                        <div className="space-y-1">
                            <Label className="text-xs font-bold">Certification Name</Label>
                            <Input
                                placeholder="e.g. AWS Certified Solutions Architect"
                                value={certForm.name}
                                onChange={(e) => setCertForm(prev => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold">Issuing Organization</Label>
                            <Input
                                placeholder="e.g. Amazon Web Services"
                                value={certForm.issuingOrganization}
                                onChange={(e) => setCertForm(prev => ({ ...prev, issuingOrganization: e.target.value }))}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold">Issue Date</Label>
                                <Input
                                    type="date"
                                    value={certForm.issueDate}
                                    onChange={(e) => setCertForm(prev => ({ ...prev, issueDate: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-bold">Expiration Date</Label>
                                <Input
                                    type="date"
                                    value={certForm.expirationDate}
                                    onChange={(e) => setCertForm(prev => ({ ...prev, expirationDate: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold">Credential ID</Label>
                            <Input
                                placeholder="e.g. AWS-123456"
                                value={certForm.credentialId}
                                onChange={(e) => setCertForm(prev => ({ ...prev, credentialId: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold">Credential URL</Label>
                            <Input
                                placeholder="e.g. https://www.credly.com/badges/..."
                                value={certForm.credentialUrl}
                                onChange={(e) => setCertForm(prev => ({ ...prev, credentialUrl: e.target.value }))}
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setCertModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmittingExtra} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                                {isSubmittingExtra ? 'Saving...' : 'Save Certification'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
