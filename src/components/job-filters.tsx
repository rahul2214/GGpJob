
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import type { Domain, ExperienceLevel, Location, JobType } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Calendar, MapPin, Briefcase, ChevronRight, Layers, Award, Search as SearchIcon } from "lucide-react";
import { SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import { Input } from "./ui/input";

interface JobFiltersProps {
    isSheet?: boolean;
}

type FilterCategory = 'posted' | 'domain' | 'location' | 'experience' | 'jobType';

function JobFiltersContent({ isSheet = false }: JobFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [locations, setLocations] = useState<Location[]>([]);
    const [domains, setDomains] = useState<Domain[]>([]);
    const [experienceLevels, setExperienceLevels] = useState<ExperienceLevel[]>([]);
    const [jobTypes, setJobTypes] = useState<JobType[]>([]);
    const [activeCategory, setActiveCategory] = useState<FilterCategory>('posted');
    
    // Desktop search states for long lists
    const [locationSearch, setLocationSearch] = useState("");
    const [domainSearch, setDomainSearch] = useState("");

    // Determine if we should hide the domain filter based on the current context
    const isRecommended = searchParams.has('domain') && searchParams.get('isReferral') !== 'true';
    const isReferral = searchParams.get('isReferral') === 'true';
    const hideDomain = isRecommended || isReferral;

    const [filters, setFilters] = useState({
        posted: searchParams.get('posted') || 'all',
        location: searchParams.getAll('location') || [],
        experience: searchParams.get('experience') || 'all',
        domain: searchParams.getAll('domain') || [],
        jobType: searchParams.getAll('jobType') || [],
    });
    
    const [hasActiveFilters, setHasActiveFilters] = useState(false);

     useEffect(() => {
        const fetchFilterData = async () => {
            const [locationsRes, domainsRes, experienceLevelsRes, jobTypesRes] = await Promise.all([
                fetch('/api/locations'),
                fetch('/api/domains'),
                fetch('/api/experience-levels'),
                fetch('/api/job-types'),
            ]);
            setLocations(await locationsRes.json());
            setDomains(await domainsRes.json());
            setExperienceLevels(await experienceLevelsRes.json());
            setJobTypes(await jobTypesRes.json());
        }
        fetchFilterData();
    }, []);

    useEffect(() => {
        const checkActiveFilters = () => {
            for (const key in filters) {
                const value = filters[key as keyof typeof filters];
                if (Array.isArray(value) && value.length > 0) return true;
                if (typeof value === 'string' && value && value !== 'all') return true;
            }
            return false;
        };
        setHasActiveFilters(checkActiveFilters());
    }, [filters]);


    useEffect(() => {
        setFilters({
            posted: searchParams.get('posted') || 'all',
            location: searchParams.getAll('location') || [],
            experience: searchParams.get('experience') || 'all',
            domain: searchParams.getAll('domain') || [],
            jobType: searchParams.getAll('jobType') || [],
        });
    }, [searchParams]);

    const handleFilterChange = (filterName: string, value: string | string[]) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };
    
    const applyFilters = () => {
        const params = new URLSearchParams();
        
        const currentSearch = searchParams.get('search');
        if (currentSearch) params.set('search', currentSearch);
        if (isReferral) params.set('isReferral', 'true');
        
        const currentDomain = searchParams.get('domain');
        // If domain was hidden (part of page context like Recommended/Referral), preserve it
        if (hideDomain && currentDomain) params.set('domain', currentDomain);

        Object.keys(filters).forEach(key => {
            const filterKey = key as keyof typeof filters;
            const value = filters[filterKey];

            if (hideDomain && filterKey === 'domain') return;

            if (Array.isArray(value)) {
                if (value.length > 0) {
                    value.forEach(v => params.append(filterKey, v));
                }
            } else if (value && value !== 'all') {
                params.set(filterKey, value);
            }
        });

        router.push(`/jobs?${params.toString()}`);
    }

    const clearFilters = () => {
        const currentSearch = searchParams.get('search');
        const currentDomain = searchParams.get('domain');
        const newParams = new URLSearchParams();
        
        if (currentSearch) newParams.set('search', currentSearch);
        if (isReferral) newParams.set('isReferral', 'true');
        
        // If domain was hidden (part of page context), preserve it during clear
        if (hideDomain && currentDomain) newParams.set('domain', currentDomain);
        
        router.push(`/jobs?${newParams.toString()}`);
    }

    const filteredLocationOptions = locations.filter(loc => 
        loc.name.toLowerCase().includes(locationSearch.toLowerCase())
    );

    const filteredDomainOptions = domains.filter(d => 
        d.name.toLowerCase().includes(domainSearch.toLowerCase())
    );

    const experienceLevelOptions = Array.isArray(experienceLevels) ? experienceLevels.map(el => ({ value: String(el.id), label: el.name })) : [];

    const postedOptions = [
        { value: "all", label: "All Dates" },
        { value: "1", label: "Last 24 hours" },
        { value: "7", label: "Last 7 days" },
        { value: "14", label: "Last 14 days" },
        { value: "30", label: "Last 30 days" },
    ];

    const filterCategories: { id: FilterCategory; label: string; icon: React.ElementType }[] = [
        { id: 'posted', label: 'Date Posted', icon: Calendar },
        { id: 'domain', label: 'Domains', icon: Layers },
        { id: 'location', label: 'Locations', icon: MapPin },
        { id: 'experience', label: 'Experience', icon: Award },
        { id: 'jobType', label: 'Employment', icon: Briefcase },
    ].filter(cat => !(hideDomain && cat.id === 'domain'));
    
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
                                    "w-full text-left p-3 text-sm font-medium flex items-center justify-between",
                                    activeCategory === cat.id && "bg-background"
                                )}
                            >
                                <span className="flex items-center">
                                   {cat.label}
                                </span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </button>
                        ))}
                    </div>
                    <div className="col-span-2 p-4 overflow-y-auto">
                        <ScrollArea className="h-full pr-4">
                            {activeCategory === 'posted' && (
                                <RadioGroup value={filters.posted} onValueChange={(value) => handleFilterChange('posted', value)} className="space-y-4">
                                    {postedOptions.map(option => (
                                        <div key={option.value} className="flex items-center space-x-3">
                                            <RadioGroupItem value={option.value} id={`posted-${option.value}`} />
                                            <Label htmlFor={`posted-${option.value}`} className="text-base font-normal">{option.label}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}
                            {activeCategory === 'domain' && !hideDomain && (
                                <div className="space-y-4">
                                    {domains.map(option => (
                                        <div key={option.id} className="flex items-center space-x-3">
                                            <Checkbox
                                                id={`domain-${option.id}`}
                                                checked={filters.domain.includes(option.id)}
                                                onCheckedChange={(checked) => {
                                                    const newSelection = checked
                                                        ? [...filters.domain, option.id]
                                                        : filters.domain.filter(v => v !== option.id);
                                                    handleFilterChange('domain', newSelection);
                                                }}
                                            />
                                            <Label htmlFor={`domain-${option.id}`} className="text-base font-normal">{option.name}</Label>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {activeCategory === 'location' && (
                                <div className="space-y-4">
                                    {locations.map(option => (
                                        <div key={option.id} className="flex items-center space-x-3">
                                            <Checkbox
                                                id={`location-${option.id}`}
                                                checked={filters.location.includes(String(option.id))}
                                                onCheckedChange={(checked) => {
                                                    const newSelection = checked
                                                        ? [...filters.location, String(option.id)]
                                                        : filters.location.filter(v => v !== String(option.id));
                                                    handleFilterChange('location', newSelection);
                                                }}
                                            />
                                            <Label htmlFor={`location-${option.id}`} className="text-base font-normal">{option.name}</Label>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {activeCategory === 'experience' && (
                                <RadioGroup value={filters.experience} onValueChange={(value) => handleFilterChange('experience', value)} className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <RadioGroupItem value="all" id="exp-all" />
                                        <Label htmlFor="exp-all" className="text-base font-normal">All Levels</Label>
                                    </div>
                                    {experienceLevelOptions.map(level => (
                                        <div key={level.value} className="flex items-center space-x-3">
                                            <RadioGroupItem value={level.value} id={`exp-${level.value}`} />
                                            <Label htmlFor={`exp-${level.value}`} className="text-base font-normal">{level.label}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}
                             {activeCategory === 'jobType' && (
                                 <div className="space-y-4">
                                    {jobTypes.map(option => (
                                        <div key={option.id} className="flex items-center space-x-3">
                                            <Checkbox
                                                id={`jobType-${option.id}`}
                                                checked={filters.jobType.includes(String(option.id))}
                                                onCheckedChange={(checked) => {
                                                    const newSelection = checked
                                                        ? [...filters.jobType, String(option.id)]
                                                        : filters.jobType.filter(v => v !== String(option.id));
                                                    handleFilterChange('jobType', newSelection);
                                                }}
                                            />
                                            <Label htmlFor={`jobType-${option.id}`} className="text-base font-normal">{option.name}</Label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>
                 <div className="p-4 border-t mt-auto grid grid-cols-2 gap-2">
                     <Button variant="ghost" onClick={clearFilters} disabled={!hasActiveFilters}>Clear All</Button>
                    <SheetClose asChild>
                        <Button onClick={applyFilters}>Apply Filters</Button>
                    </SheetClose>
                </div>
            </div>
        )
    }

    return (
        <Card className="sticky top-20 shadow-sm border">
            <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b">
                <span className="font-bold">Filters</span>
                {hasActiveFilters && (
                    <Button variant="link" size="sm" onClick={clearFilters} className="h-auto p-0 text-muted-foreground hover:text-primary">
                        Clear all
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-6 p-6">
                {/* Date Posted */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Date Posted
                    </Label>
                    <Select value={filters.posted} onValueChange={(value) => handleFilterChange('posted', value)}>
                        <SelectTrigger className="w-full bg-muted/20">
                            <SelectValue placeholder="Any time" />
                        </SelectTrigger>
                        <SelectContent>
                            {postedOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                {/* Domains */}
                {!hideDomain && domains.length > 0 && (
                    <div className="space-y-3">
                        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Layers className="h-4 w-4" /> Domains
                        </Label>
                        {domains.length > 5 && (
                            <div className="relative mb-2">
                                <SearchIcon className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                <Input 
                                    placeholder="Search domains..." 
                                    className="h-8 pl-7 text-xs bg-muted/20"
                                    value={domainSearch}
                                    onChange={(e) => setDomainSearch(e.target.value)}
                                />
                            </div>
                        )}
                        <ScrollArea className={cn("pr-2", domains.length > 5 ? "h-40" : "h-auto")}>
                            <div className="space-y-2.5">
                                {filteredDomainOptions.map(domain => (
                                    <div key={domain.id} className="flex items-center space-x-2 group">
                                        <Checkbox
                                            id={`d-desktop-${domain.id}`}
                                            checked={filters.domain.includes(domain.id)}
                                            onCheckedChange={(checked) => {
                                                const newSelection = checked
                                                    ? [...filters.domain, domain.id]
                                                    : filters.domain.filter(v => v !== domain.id);
                                                handleFilterChange('domain', newSelection);
                                            }}
                                        />
                                        <Label htmlFor={`d-desktop-${domain.id}`} className="text-sm font-normal cursor-pointer group-hover:text-primary transition-colors line-clamp-1">
                                            {domain.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                )}

                {/* Locations */}
                {locations.length > 0 && (
                    <div className="space-y-3">
                        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <MapPin className="h-4 w-4" /> Locations
                        </Label>
                        <div className="relative mb-2">
                            <SearchIcon className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                            <Input 
                                placeholder="Search locations..." 
                                className="h-8 pl-7 text-xs bg-muted/20"
                                value={locationSearch}
                                onChange={(e) => setLocationSearch(e.target.value)}
                            />
                        </div>
                        <ScrollArea className="h-48 pr-2">
                            <div className="space-y-2.5">
                                {filteredLocationOptions.map(location => (
                                    <div key={location.id} className="flex items-center space-x-2 group">
                                        <Checkbox
                                            id={`l-desktop-${location.id}`}
                                            checked={filters.location.includes(String(location.id))}
                                            onCheckedChange={(checked) => {
                                                const newSelection = checked
                                                    ? [...filters.location, String(location.id)]
                                                    : filters.location.filter(v => v !== String(location.id));
                                                handleFilterChange('location', newSelection);
                                            }}
                                        />
                                        <Label htmlFor={`l-desktop-${location.id}`} className="text-sm font-normal cursor-pointer group-hover:text-primary transition-colors line-clamp-1">
                                            {location.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                )}

                {/* Experience Level */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Award className="h-4 w-4" /> Experience
                    </Label>
                    <Select value={filters.experience} onValueChange={(value) => handleFilterChange('experience', value)}>
                        <SelectTrigger className="w-full bg-muted/20">
                            <SelectValue placeholder="Any experience" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            {experienceLevelOptions.map(level => (
                                <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Employment Types */}
                {jobTypes.length > 0 && (
                    <div className="space-y-3">
                        <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Briefcase className="h-4 w-4" /> Employment
                        </Label>
                        <div className="space-y-2.5">
                            {jobTypes.map(type => (
                                <div key={type.id} className="flex items-center space-x-2 group">
                                    <Checkbox
                                        id={`jt-desktop-${type.id}`}
                                        checked={filters.jobType.includes(String(type.id))}
                                        onCheckedChange={(checked) => {
                                            const newSelection = checked
                                                ? [...filters.jobType, String(type.id)]
                                                : filters.jobType.filter(v => v !== String(type.id));
                                            handleFilterChange('jobType', newSelection);
                                        }}
                                    />
                                    <Label htmlFor={`jt-desktop-${type.id}`} className="text-sm font-normal cursor-pointer group-hover:text-primary transition-colors">
                                        {type.name}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <Button onClick={applyFilters} className="w-full bg-primary hover:bg-primary/90 font-bold py-6 rounded-xl mt-4">
                    Update Results
                </Button>
            </CardContent>
        </Card>
    );
}

export function JobFilters(props: JobFiltersProps) {
    return (
        <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
            <JobFiltersContent {...props} />
        </Suspense>
    )
}
