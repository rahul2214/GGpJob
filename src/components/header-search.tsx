
"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUser } from "@/contexts/user-context";
import { useDebounce } from "@/hooks/use-debounce";
import { useState, useEffect } from "react";

export default function HeaderSearch() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useUser();
    
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    // Determine if the search bar should be visible
    const isJobSeeker = user?.role === 'Job Seeker';
    const isRelevantPage = pathname === '/' || pathname.startsWith('/jobs');
    
    useEffect(() => {
        const newParams = new URLSearchParams(searchParams.toString());
        if (debouncedSearchQuery) {
            newParams.set('search', debouncedSearchQuery);
        } else {
            newParams.delete('search');
        }

        // Only push router if we are on the jobs page and the query has changed
        if (pathname === '/jobs') {
            router.push(`/jobs?${newParams.toString()}`);
        }
    }, [debouncedSearchQuery, router, pathname, searchParams]);

    if (!isJobSeeker || !isRelevantPage) {
        return null;
    }

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newParams = new URLSearchParams(searchParams.toString());
        if (searchQuery) {
            newParams.set('search', searchQuery);
        } else {
            newParams.delete('search');
        }
        router.push(`/jobs?${newParams.toString()}`);
    }

    return (
        <form onSubmit={handleFormSubmit} className="ml-auto flex-1 sm:flex-initial">
           <div className="relative">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input
               type="search"
               name="search"
               placeholder="Search jobs..."
               className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
         </form>
    )
}
