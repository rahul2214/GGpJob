"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import type { JobType } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, Calendar, MapPin, Briefcase, Building, Award, RotateCcw } from "lucide-react";
import { SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import { MultiSelectFilter } from "./multi-select-filter";
import { Slider } from "./ui/slider";

interface JobFiltersProps {
    isSheet?: boolean;
}

type FilterCategory = 'posted' | 'experience' | 'jobType' | 'workplace' | 'location';

interface WorkplaceType {
    id: number;
    name: string;
    uuid: string;
}

function JobFiltersContent({ isSheet = false }: JobFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [jobTypes, setJobTypes] = useState<JobType[]>([]);
    const [workplaceTypes, setWorkplaceTypes] = useState<WorkplaceType[]>([]);
    const [activeCategory, setActiveCategory] = useState<FilterCategory>('posted');
    
    const isRecommended = searchParams.get('view') === 'recommended';
    const isReferral = searchParams.get('isReferral') === 'true';

    const [filters, setFilters] = useState({
        posted: searchParams.get('posted') || 'all',
        location: searchParams.get('location') || searchParams.get('country') || '',
        expRange: [
            searchParams.get('minExp') ? parseInt(searchParams.get('minExp')!, 10) : 0,
            searchParams.get('maxExp') ? parseInt(searchParams.get('maxExp')!, 10) : 30
        ] as number[],
        jobType: searchParams.getAll('jobType').flatMap(jt => jt.split(',')).filter(Boolean),
        workplaceType: searchParams.getAll('workplaceType').concat(searchParams.getAll('remoteType')).flatMap(wt => wt.split(',')).filter(Boolean),
    });
    
    const [hasActiveFilters, setHasActiveFilters] = useState(false);

    useEffect(() => {
        const fetchFilterData = async () => {
            try {
                const [jobTypesRes, wpTypesRes] = await Promise.all([
                    fetch('/api/job-types'),
                    fetch('/api/workplace-types')
                ]);
                if (jobTypesRes.ok) setJobTypes(await jobTypesRes.json());
                if (wpTypesRes.ok) setWorkplaceTypes(await wpTypesRes.json());
            } catch (err) {
                console.error("Failed to fetch filter data:", err);
            }
        };
        fetchFilterData();
    }, []);

    useEffect(() => {
        const checkActiveFilters = () => {
            if (filters.posted && filters.posted !== 'all') return true;
            if (filters.location && filters.location !== 'all' && filters.location.trim() !== '') return true;
            if (filters.expRange[0] !== 0 || filters.expRange[1] !== 30) return true;
            if (filters.jobType.length > 0) return true;
            if (filters.workplaceType.length > 0) return true;
            return false;
        };
        setHasActiveFilters(checkActiveFilters());
    }, [filters]);

    useEffect(() => {
        setFilters({
            posted: searchParams.get('posted') || 'all',
            location: searchParams.get('location') || searchParams.get('country') || '',
            expRange: [
                searchParams.get('minExp') ? parseInt(searchParams.get('minExp')!, 10) : 0,
                searchParams.get('maxExp') ? parseInt(searchParams.get('maxExp')!, 10) : 30
            ],
            jobType: searchParams.getAll('jobType').flatMap(jt => jt.split(',')).filter(Boolean),
            workplaceType: searchParams.getAll('workplaceType').concat(searchParams.getAll('remoteType')).flatMap(wt => wt.split(',')).filter(Boolean),
        });
    }, [searchParams]);

    const handleFilterChange = (filterName: string, value: any) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };
    
    const applyFilters = () => {
        const params = new URLSearchParams();
        
        const currentSearch = searchParams.get('search');
        if (currentSearch) params.set('search', currentSearch);
        if (isReferral) params.set('isReferral', 'true');
        if (isRecommended) params.set('view', 'recommended');
        
        // 1. Date Posted
        if (filters.posted && filters.posted !== 'all') {
            params.set('posted', filters.posted);
        }

        // 2. Location
        if (filters.location && filters.location.trim() !== '' && filters.location !== 'all') {
            params.set('location', filters.location.trim());
        }

        // 3. Experience Range
        const [min, max] = filters.expRange;
        if (min > 0) params.set('minExp', String(min));
        if (max < 30) params.set('maxExp', String(max));

        // 4. Job Types (Employment)
        if (filters.jobType.length > 0) {
            filters.jobType.forEach(jt => params.append('jobType', jt));
        }

        // 5. Workplace Types (Remote / Hybrid / On-site)
        if (filters.workplaceType.length > 0) {
            filters.workplaceType.forEach(wt => params.append('workplaceType', wt));
        }

        const viewParam = searchParams.get('view');
        if (viewParam && viewParam !== 'all') {
            params.set('view', viewParam);
        }

        router.push(`/jobs?${params.toString()}`);
    };

    const clearFilters = () => {
        const currentSearch = searchParams.get('search');
        const newParams = new URLSearchParams();
        
        if (currentSearch) newParams.set('search', currentSearch);
        if (isReferral) newParams.set('isReferral', 'true');
        const viewParam = searchParams.get('view');
        if (viewParam && viewParam !== 'all') {
            newParams.set('view', viewParam);
        }
        
        setFilters({
            posted: 'all',
            location: '',
            expRange: [0, 30],
            jobType: [],
            workplaceType: [],
        });

        router.push(`/jobs?${newParams.toString()}`);
    };

    const jobTypeOptions = useMemo(() => 
        jobTypes.map(jt => ({ value: String(jt.id), label: jt.name })), 
    [jobTypes]);

    const workplaceTypeOptions = useMemo(() => {
        if (workplaceTypes.length > 0) {
            return workplaceTypes.map(wt => ({ value: String(wt.id), label: wt.name }));
        }
        return [
            { value: "1", label: "Remote" },
            { value: "2", label: "On-site" },
            { value: "3", label: "Hybrid" }
        ];
    }, [workplaceTypes]);

    const postedOptions = [
        { value: "all", label: "All Dates" },
        { value: "1", label: "Last 24 hours" },
        { value: "7", label: "Last 7 days" },
        { value: "14", label: "Last 14 days" },
        { value: "30", label: "Last 30 days" },
    ];

    const filterCategories: { id: FilterCategory; label: string; icon: React.ElementType }[] = [
        { id: 'posted' as const, label: 'Date Posted', icon: Calendar },
        { id: 'experience' as const, label: 'Experience', icon: Award },
        { id: 'jobType' as const, label: 'Employment', icon: Briefcase },
        { id: 'workplace' as const, label: 'Workplace', icon: Building },
        { id: 'location' as const, label: 'Location', icon: MapPin },
    ];
    
    if (isSheet) {
        return (
            <div className="h-full flex flex-col">
                <div className="grid grid-cols-3 h-full overflow-hidden">
                    <div className="col-span-1 bg-muted/50 border-r overflow-y-auto">
                        {filterCategories.map(cat => (
                            <button 
                                key={cat.id} 
                                onClick={() => setActiveCategory(cat.id)}
                                className={cn(
                                    "w-full text-left p-3 text-sm font-medium flex items-center justify-between transition-colors",
                                    activeCategory === cat.id ? "bg-background font-bold text-primary" : "text-muted-foreground hover:bg-muted/30"
                                )}
                            >
                                <span className="flex items-center gap-1.5 text-xs">
                                   <cat.icon className="w-3.5 h-3.5" />
                                   {cat.label}
                                </span>
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                        ))}
                    </div>
                    <div className="col-span-2 p-4 overflow-y-auto">
                        <ScrollArea className="h-full pr-2">
                            {activeCategory === 'posted' && (
                                <RadioGroup value={filters.posted} onValueChange={(value) => handleFilterChange('posted', value)} className="space-y-4">
                                    {postedOptions.map(option => (
                                        <div key={option.value} className="flex items-center space-x-3">
                                            <RadioGroupItem value={option.value} id={`posted-${option.value}`} />
                                            <Label htmlFor={`posted-${option.value}`} className="text-sm font-medium cursor-pointer">{option.label}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}

                            {activeCategory === 'experience' && (
                                <div className="space-y-6 pt-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-sm font-bold">Experience Range</Label>
                                        <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                                            {filters.expRange[0]} - {filters.expRange[1]} Yrs
                                        </span>
                                    </div>
                                    <Slider
                                        value={filters.expRange}
                                        min={0}
                                        max={30}
                                        step={1}
                                        onValueChange={(val) => handleFilterChange('expRange', val)}
                                    />
                                    <p className="text-xs text-muted-foreground">Showing jobs matching this minimum to maximum years of experience.</p>
                                </div>
                            )}

                            {activeCategory === 'jobType' && (
                                <div className="space-y-3.5">
                                    {jobTypeOptions.map(option => (
                                        <div key={option.value} className="flex items-center space-x-3">
                                            <Checkbox
                                                id={`jobType-${option.value}`}
                                                checked={filters.jobType.includes(option.value)}
                                                onCheckedChange={(checked) => {
                                                    const newSelection = checked
                                                        ? [...filters.jobType, option.value]
                                                        : filters.jobType.filter(v => v !== option.value);
                                                    handleFilterChange('jobType', newSelection);
                                                }}
                                            />
                                            <Label htmlFor={`jobType-${option.value}`} className="text-sm font-medium cursor-pointer">{option.label}</Label>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeCategory === 'workplace' && (
                                <div className="space-y-3.5">
                                    {workplaceTypeOptions.map(option => (
                                        <div key={option.value} className="flex items-center space-x-3">
                                            <Checkbox
                                                id={`workplaceType-${option.value}`}
                                                checked={filters.workplaceType.includes(option.value)}
                                                onCheckedChange={(checked) => {
                                                    const newSelection = checked
                                                        ? [...filters.workplaceType, option.value]
                                                        : filters.workplaceType.filter(v => v !== option.value);
                                                    handleFilterChange('workplaceType', newSelection);
                                                }}
                                            />
                                            <Label htmlFor={`workplaceType-${option.value}`} className="text-sm font-medium cursor-pointer">{option.label}</Label>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeCategory === 'location' && (
                                <div className="space-y-4 pt-1">
                                    <Label className="text-sm font-bold">Country or City</Label>
                                    <input
                                        type="text"
                                        value={filters.location}
                                        onChange={(e) => handleFilterChange('location', e.target.value)}
                                        placeholder="e.g. India, United States, Remote..."
                                        className="w-full px-3 py-2 text-sm border rounded-xl bg-background outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    <div className="flex flex-wrap gap-1.5 pt-2">
                                        {['Remote', 'India', 'United States', 'United Kingdom', 'Canada', 'Germany'].map(loc => (
                                            <button
                                                key={loc}
                                                type="button"
                                                onClick={() => handleFilterChange('location', loc)}
                                                className={cn(
                                                    "text-xs px-2.5 py-1 rounded-full border transition-all",
                                                    filters.location.toLowerCase() === loc.toLowerCase()
                                                        ? "bg-primary text-primary-foreground border-primary font-bold"
                                                        : "bg-muted/40 text-muted-foreground hover:bg-muted"
                                                )}
                                            >
                                                {loc}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>
                <div className="p-4 border-t mt-auto grid grid-cols-2 gap-2 bg-background">
                    <Button variant="outline" onClick={clearFilters} disabled={!hasActiveFilters}>
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                        Clear All
                    </Button>
                    <SheetClose asChild>
                        <Button onClick={applyFilters} className="font-bold">
                            Apply Filters
                        </Button>
                    </SheetClose>
                </div>
            </div>
        );
    }

    return (
        <Card className="sticky top-20 shadow-sm border rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b bg-muted/20">
                <span className="font-bold text-sm tracking-wide">Job Filters</span>
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-1 text-xs text-muted-foreground hover:text-primary flex items-center gap-1 font-semibold">
                        <RotateCcw className="w-3 h-3" />
                        Reset
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-6 p-6">
                {/* Date Posted */}
                <div className="space-y-2.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        Date Posted
                    </Label>
                    <Select value={filters.posted} onValueChange={(value) => handleFilterChange('posted', value)}>
                        <SelectTrigger className="w-full bg-muted/20 rounded-xl text-xs h-9">
                            <SelectValue placeholder="All Dates" />
                        </SelectTrigger>
                        <SelectContent>
                            {postedOptions.map(option => (
                                <SelectItem key={option.value} value={option.value} className="text-xs">{option.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Experience Level */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-primary" />
                            Experience
                        </Label>
                        <span className="text-xs font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                            {filters.expRange[0]} - {filters.expRange[1]} Yrs
                        </span>
                    </div>
                    <Slider
                        value={filters.expRange}
                        min={0}
                        max={30}
                        step={1}
                        onValueChange={(val) => handleFilterChange('expRange', val)}
                        className="py-1"
                    />
                </div>

                {/* Workplace Types (Remote, Hybrid, On-site) */}
                <div className="space-y-2.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-primary" />
                        Workplace Type
                    </Label>
                    <MultiSelectFilter
                        title="Workplace"
                        options={workplaceTypeOptions}
                        selectedValues={filters.workplaceType}
                        onChange={(values) => handleFilterChange('workplaceType', values)}
                    />
                </div>

                {/* Employment Types (Full-Time, Contract, etc.) */}
                {jobTypeOptions.length > 0 && (
                    <div className="space-y-2.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-primary" />
                            Employment
                        </Label>
                        <MultiSelectFilter
                            title="Employment"
                            options={jobTypeOptions}
                            selectedValues={filters.jobType}
                            onChange={(values) => handleFilterChange('jobType', values)}
                        />
                    </div>
                )}

                {/* Location / Country */}
                <div className="space-y-2.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        Location / Country
                    </Label>
                    <input
                        type="text"
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        placeholder="e.g. Remote, India, US..."
                        className="w-full px-3 py-2 text-xs border rounded-xl bg-muted/20 outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <Button onClick={applyFilters} className="w-full bg-primary hover:bg-primary/90 font-bold py-5 rounded-xl shadow-md transition-all active:scale-95">
                    Update Results
                </Button>
            </CardContent>
        </Card>
    );
}

export function JobFilters(props: JobFiltersProps) {
    return (
        <Suspense fallback={<Skeleton className="h-[600px] w-full rounded-2xl" />}>
            <JobFiltersContent {...props} />
        </Suspense>
    );
}
