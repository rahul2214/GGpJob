

"use client"

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoaderCircle, Check, ChevronsUpDown } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import type { MasterSkill } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

const educationSchema = z.object({
    institution: z.string().min(1, "Institution is required"),
    degree: z.string().min(1, "Degree is required"),
    fieldOfStudy: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    grade: z.string().optional(),
    description: z.string().optional(),
    isCurrent: z.boolean().default(false).optional(),
});

const employmentSchema = z.object({
    company: z.string().min(1, "Company is required"),
    title: z.string().min(1, "Title is required"),
    employmentType: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship']),
    location: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    description: z.string().optional(),
    isCurrent: z.boolean().default(false).optional(),
});

const projectSchema = z.object({
    name: z.string().min(1, "Project name is required"),
    description: z.string().optional(),
    url: z.string().url("Must be a valid URL").optional().or(z.literal('')),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isCurrent: z.boolean().default(false).optional(),
});

const languageSchema = z.object({
    language: z.string().min(1, "Language is required"),
    proficiency: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Native']),
});

const skillSchema = z.object({
    name: z.string().min(1, "Skill name is required"),
    uuid: z.string().min(1, "Selection from list required"),
    proficiencyLevel: z.preprocess(
        (val) => (val === null || val === "") ? undefined : val,
        z.enum(['beginner', 'intermediate', 'expert']).optional().default('beginner')
    ),
    yearsExperience: z.coerce.number().min(0, "Experience must be 0 or more").optional().default(0),
});

const personalDetailsSchema = z.object({
    gender: z.string().optional(),
    maritalStatus: z.string().optional(),
    dateOfBirth: z.string().optional(),
    category: z.string().optional(),
    disabilityStatus: z.string().optional(),
    militaryExperience: z.string().optional(),
    careerBreak: z.string().optional(),
});

const schemas = {
    education: educationSchema,
    employment: employmentSchema,
    projects: projectSchema,
    languages: languageSchema,
    skills: skillSchema,
    personal: personalDetailsSchema,
};

const defaultValues = {
    education: {
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        grade: '',
        description: '',
        isCurrent: false,
    },
    employment: { company: '', title: '', employmentType: 'Full-time' as const, location: '', startDate: '', endDate: '', description: '', isCurrent: false },
    projects: { name: '', description: '', url: '', startDate: '', endDate: '', isCurrent: false },
    languages: { language: '', proficiency: 'Beginner' as const },
    skills: { name: '', uuid: '', proficiencyLevel: 'beginner' as const, yearsExperience: 0 },
    personal: { gender: '', maritalStatus: '', dateOfBirth: '', category: '', disabilityStatus: '', militaryExperience: '', careerBreak: '' },
};

type FormData = z.infer<typeof educationSchema> | z.infer<typeof employmentSchema> | z.infer<typeof projectSchema> | z.infer<typeof languageSchema> | z.infer<typeof skillSchema> | z.infer<typeof personalDetailsSchema>;
type Section = 'education' | 'employment' | 'projects' | 'languages' | 'skills' | 'personal';

interface ProfileSectionFormProps {
    currentSection: Section | null;
    editingItem: any | null;
    onFormSubmit: (values: FormData) => void;
    onCancel?: () => void;
    existingData?: any;
}

export const ProfileSectionForm = ({
    currentSection,
    editingItem,
    onFormSubmit,
    onCancel,
    existingData
}: ProfileSectionFormProps) => {
    if (!currentSection) return null;

    const form = useForm({
        resolver: async (data, context, options) => {
            const baseResolver = zodResolver(schemas[currentSection!] as any);
            const result = await baseResolver(data, context, options);

            if (currentSection === 'skills') {
                const typedResult = result as any;
                if (!typedResult.errors.name) {
                    const typedName = (data as any).name;

                    const isValidSkill = masterSkills.some(s => s.name.toLowerCase() === typedName.toLowerCase());
                    if (!isValidSkill) {
                        return {
                            values: data,
                            errors: { name: { type: "manual", message: "Please select a valid skill from the dropdown." } }
                        };
                    }

                    const isDuplicate = existingData?.skills?.some(
                        (s: any) => s.name.toLowerCase() === typedName.toLowerCase() && s.uuid !== editingItem?.uuid
                    );
                    if (isDuplicate) {
                        return {
                            values: data,
                            errors: { name: { type: "manual", message: "This skill is already in your profile." } }
                        };
                    }
                }
            }

            return result;
        },
        defaultValues: editingItem
            ? { ...editingItem, isCurrent: !editingItem.endDate }
            : defaultValues[currentSection],
    });

    const { watch, setValue, formState: { isSubmitting } } = form;

    const isCurrent = watch('isCurrent');
    const [masterSkills, setMasterSkills] = useState<MasterSkill[]>([]);
    const [skillDropdownOpen, setSkillDropdownOpen] = useState(false);

    useEffect(() => {
        if (currentSection === 'skills') {
            const fetchSkills = async () => {
                try {
                    const res = await fetch('/api/skills');
                    const data = await res.json();
                    setMasterSkills(Array.isArray(data) ? data : []);
                } catch (error) {
                    console.error("Failed to fetch skills", error);
                }
            };
            fetchSkills();
        }
    }, [currentSection]);

    useEffect(() => {
        if (isCurrent && (currentSection === 'employment' || currentSection === 'education' || currentSection === 'projects')) {
            setValue('endDate', '');
        }
    }, [isCurrent, setValue, currentSection]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
                {currentSection === 'education' && (
                    <>
                        <FormField control={form.control} name="institution" render={({ field }) => (<FormItem> <FormLabel>Institution</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                        <FormField control={form.control} name="degree" render={({ field }) => (<FormItem> <FormLabel>Degree</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                        <FormField control={form.control} name="fieldOfStudy" render={({ field }) => (<FormItem> <FormLabel>Field of Study</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                        <FormField control={form.control} name="grade" render={({ field }) => (<FormItem> <FormLabel>Grade / CGPA</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="startDate" render={({ field }) => (<FormItem> <FormLabel>Start Date</FormLabel> <FormControl><Input type="date" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                            <FormField control={form.control} name="endDate" render={({ field }) => (<FormItem> <FormLabel>End Date</FormLabel> <FormControl><Input type="date" {...field} disabled={isCurrent} /></FormControl> <FormMessage /> </FormItem>)} />
                        </div>
                        <FormField control={form.control} name="isCurrent" render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>This is ongoing</FormLabel>
                                </div>
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (<FormItem> <FormLabel>Description</FormLabel> <FormControl><Textarea {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                    </>
                )}
                {currentSection === 'employment' && (
                    <>
                        <FormField control={form.control} name="company" render={({ field }) => (<FormItem> <FormLabel>Company</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                        <FormField control={form.control} name="title" render={({ field }) => (<FormItem> <FormLabel>Title</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                        <FormField control={form.control} name="employmentType" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Employment Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Full-time">Full-time</SelectItem>
                                        <SelectItem value="Part-time">Part-time</SelectItem>
                                        <SelectItem value="Contract">Contract</SelectItem>
                                        <SelectItem value="Internship">Internship</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="location" render={({ field }) => (<FormItem> <FormLabel>Location</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="startDate" render={({ field }) => (<FormItem> <FormLabel>Start Date</FormLabel> <FormControl><Input type="month" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                            <FormField control={form.control} name="endDate" render={({ field }) => (<FormItem> <FormLabel>End Date</FormLabel> <FormControl><Input type="month" {...field} disabled={isCurrent} /></FormControl> <FormMessage /> </FormItem>)} />
                        </div>
                        <FormField control={form.control} name="isCurrent" render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>I currently work here</FormLabel>
                                </div>
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (<FormItem> <FormLabel>Description</FormLabel> <FormControl><Textarea {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                    </>
                )}
                {currentSection === 'projects' && (
                    <>
                        <FormField control={form.control} name="name" render={({ field }) => (<FormItem> <FormLabel>Project Name</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                        <FormField control={form.control} name="url" render={({ field }) => (<FormItem> <FormLabel>Project URL</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="startDate" render={({ field }) => (<FormItem> <FormLabel>Start Date</FormLabel> <FormControl><Input type="date" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                            <FormField control={form.control} name="endDate" render={({ field }) => (<FormItem> <FormLabel>End Date</FormLabel> <FormControl><Input type="date" {...field} disabled={isCurrent} /></FormControl> <FormMessage /> </FormItem>)} />
                        </div>
                        <FormField control={form.control} name="isCurrent" render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>This is ongoing</FormLabel>
                                </div>
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (<FormItem> <FormLabel>Description</FormLabel> <FormControl><Textarea {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                    </>
                )}
                {currentSection === 'languages' && (
                    <>
                        <FormField control={form.control} name="language" render={({ field }) => (<FormItem> <FormLabel>Language</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                        <FormField control={form.control} name="proficiency" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Proficiency</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select proficiency" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Beginner">Beginner</SelectItem>
                                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                                        <SelectItem value="Advanced">Advanced</SelectItem>
                                        <SelectItem value="Native">Native</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </>
                )}
                {currentSection === 'skills' && (
                    <>
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem className="flex flex-col relative">
                                <FormLabel>Skill Name</FormLabel>
                                <Command className="overflow-visible bg-transparent">
                                    <div className="border border-input rounded-md flex items-center bg-transparent">
                                        <CommandInput
                                            placeholder="e.g. Python"
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            onFocus={() => setSkillDropdownOpen(true)}
                                            onBlur={() => setTimeout(() => setSkillDropdownOpen(false), 200)}
                                            className="border-none focus:ring-0 w-full"
                                        />
                                    </div>
                                    {skillDropdownOpen && (
                                        <div className="relative">
                                            <CommandList className="absolute top-2 z-50 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
                                                <CommandEmpty>No matching skills found.</CommandEmpty>
                                                <CommandGroup className="max-h-60 overflow-y-auto">
                                                    {masterSkills.map((skill) => (
                                                        <CommandItem
                                                            key={skill.id}
                                                            value={skill.name}
                                                            onSelect={() => {
                                                                const isDuplicate = existingData?.skills?.some(
                                                                    (s: any) => s.name.toLowerCase() === skill.name.toLowerCase() && s.id !== editingItem?.id
                                                                );
                                                                if (isDuplicate) {
                                                                    form.setError("name", { type: "manual", message: "This skill is already in your profile." });
                                                                } else {
                                                                    form.clearErrors("name");
                                                                    form.setValue("name", skill.name);
                                                                    form.setValue("uuid", skill.uuid);
                                                                    setSkillDropdownOpen(false);
                                                                }
                                                            }}
                                                            className="cursor-pointer"
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    skill.name === field.value ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {skill.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </div>
                                    )}
                                </Command>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                            <FormField control={form.control} name="proficiencyLevel" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Proficiency Level</FormLabel>
                                    <Select 
                                        onValueChange={field.onChange} 
                                        value={field.value || "beginner"}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select proficiency" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="beginner">Beginner</SelectItem>
                                            <SelectItem value="intermediate">Intermediate</SelectItem>
                                            <SelectItem value="expert">Expert</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="yearsExperience" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Years of Experience</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type="number" min={0} {...field} />
                                            <span className="absolute right-3 top-2 text-sm text-slate-400">Years</span>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </>
                )}
                {currentSection === 'personal' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="gender" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gender</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                            <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="maritalStatus" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Marital Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select marital status" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Single">Single</SelectItem>
                                            <SelectItem value="Married">Married</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date of Birth</FormLabel>
                                    <FormControl><Input type="date" {...field} /></FormControl>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="category" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="General">General</SelectItem>
                                            <SelectItem value="OBC">OBC</SelectItem>
                                            <SelectItem value="SC">SC</SelectItem>
                                            <SelectItem value="ST">ST</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )} />
                        </div>
                        <div className="pt-4 border-t">
                            <h3 className="text-sm font-semibold mb-3">Diversity and Inclusion</h3>
                            <div className="space-y-4">
                                <FormField control={form.control} name="disabilityStatus" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Disability Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="No">No</SelectItem>
                                                <SelectItem value="Yes">Yes</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="militaryExperience" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Military Experience</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="No">No</SelectItem>
                                                <SelectItem value="Yes">Yes</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="careerBreak" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Have you taken a career break?</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="No">No</SelectItem>
                                                <SelectItem value="Yes">Yes</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                            </div>
                        </div>
                    </>
                )}
                <div className="flex justify-end gap-2 pt-4">
                    {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <LoaderCircle className="animate-spin mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </Form>
    );
};
