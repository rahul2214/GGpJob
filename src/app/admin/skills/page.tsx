"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { MasterSkill } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, MoreHorizontal, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { SkillForm } from "@/components/skill-form";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";

export default function ManageSkillsPage() {
  const router = useRouter();
  const [skills, setSkills] = useState<MasterSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSkillFormOpen, setIsSkillFormOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<MasterSkill | null>(null);
  const [skillToDelete, setSkillToDelete] = useState<MasterSkill | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/skills');
      const data = await res.json();
      setSkills(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch skills", error);
      toast({ title: 'Error', description: 'Failed to fetch skills.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const filteredSkills = useMemo(() => {
    return skills.filter(skill =>
      skill.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [skills, searchTerm]);

  const handleEditSkill = (skill: MasterSkill) => {
    if (isMobile) {
      router.push(`/admin/skills/edit/${skill.id}`);
    } else {
      setSelectedSkill(skill);
      setIsSkillFormOpen(true);
    }
  };

  const handleAddSkill = () => {
    if (isMobile) {
      router.push('/admin/skills/add');
    } else {
      setSelectedSkill(null);
      setIsSkillFormOpen(true);
    }
  };
  
  const handleDeleteSkill = async () => {
    if (!skillToDelete) return;
    try {
      const response = await fetch(`/api/skills/${skillToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete skill');
      }
      toast({ title: 'Success', description: 'Skill deleted successfully.' });
      await fetchSkills();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete skill.', variant: 'destructive' });
      console.error(error);
    } finally {
        setSkillToDelete(null);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Skill Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Skill Name</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSkills.map((skill) => (
            <TableRow key={skill.id}>
              <TableCell className="font-medium">{skill.name}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditSkill(skill)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSkillToDelete(skill)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <>
      <Dialog open={isSkillFormOpen} onOpenChange={setIsSkillFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedSkill ? "Edit Skill" : "Add New Skill"}</DialogTitle>
            <DialogDescription>
              {selectedSkill ? "Update the details of the skill." : "Enter the name for the new skill."}
            </DialogDescription>
          </DialogHeader>
          <SkillForm
            skill={selectedSkill}
            onSuccess={() => {
              setIsSkillFormOpen(false);
              fetchSkills();
            }}
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!skillToDelete} onOpenChange={(open) => !open && setSkillToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the skill &quot;{skillToDelete?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSkillToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSkill}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Manage Skills</CardTitle>
              <CardDescription>Add, edit, or remove skills from the global pool.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search skills..."
                    className="pl-8 sm:w-[200px] lg:w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddSkill} className="whitespace-nowrap">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Skill
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </>
  );
}
