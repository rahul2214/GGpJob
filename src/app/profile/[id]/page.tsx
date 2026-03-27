
"use client"

import { useUser } from "@/contexts/user-context";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { ProfileSections } from "@/components/profile-sections";
import type { User as UserType } from "@/lib/types";
import {
  MapPin, Linkedin, FileText, User as UserIcon,
  Calendar, HeartHandshake, Phone, AtSign,
  Edit3, Sparkles, ExternalLink, CheckCircle2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import axiosInstance from "@/lib/axios";

export default function PublicProfilePage() {
  const { user: currentUser, loading: currentUserLoading } = useUser();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [profileUser, setProfileUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = currentUser?.id === id;

  const fetchUser = useCallback(async () => {
    if (id) {
      setLoading(true);
      try {
        const data = await axiosInstance.get(`/users/${id}`);
        setProfileUser(data);
      } catch (error) {
        console.error("Failed to fetch user data", error);
        setProfileUser(null);
      } finally {
        setLoading(false);
      }
    }
  }, [id]);

  const [hasNotified, setHasNotified] = useState(false);

  useEffect(() => {
    const notifyView = async () => {
      if (
        !loading &&
        !currentUserLoading &&
        currentUser &&
        profileUser &&
        !isOwnProfile &&
        profileUser.role === 'Job Seeker' &&
        currentUser.role === 'Recruiter' &&
        !hasNotified
      ) {
        try {
          await axiosInstance.post('/notifications', {
            userId: profileUser.id,
            message: `A recruiter (${currentUser.name}) viewed your profile.`,
            type: 'profile_view',
            viewerId: currentUser.id
          });
          setHasNotified(true);
        } catch (error) {
          console.error("Failed to send profile view notification", error);
        }
      }
    };
    notifyView();
  }, [loading, currentUserLoading, currentUser, profileUser, isOwnProfile, hasNotified]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }
    return `${name.charAt(0)}`.toUpperCase();
  };

  // ── Loading skeleton ────────────────────────────────────────────────────
  if (loading || currentUserLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Hero skeleton */}
        <div className="bg-slate-900 h-56" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-20 pb-12 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 flex gap-6 items-end">
            <Skeleton className="w-28 h-28 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-3 pb-2">
              <Skeleton className="h-7 w-52" />
              <Skeleton className="h-4 w-80" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-700">Profile Not Found</h2>
          <p className="text-slate-500 mt-1">This user profile does not exist.</p>
        </div>
      </div>
    );
  }

  const hasPersonalDetails = profileUser.gender || profileUser.maritalStatus || profileUser.dateOfBirth || profileUser.category;
  const hasDiversityDetails = profileUser.disabilityStatus || profileUser.militaryExperience || profileUser.careerBreak;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero Banner ──────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 h-52 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-20 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-900/30 via-transparent to-transparent" />
      </div>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-20 pb-16 space-y-5 relative z-10">

        {/* ── Profile Card ─────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {/* Avatar */}
              <div className="shrink-0">
                {(profileUser as any).photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={(profileUser as any).photoUrl}
                    alt={profileUser.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-3xl ring-4 ring-white shadow-lg">
                    {getInitials(profileUser.name)}
                  </div>
                )}
              </div>

              {/* Name + details */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex flex-wrap items-start gap-3 justify-between">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                      {profileUser.name}
                    </h1>
                    {profileUser.headline && (
                      <p className="text-slate-600 mt-1 text-base font-medium">{profileUser.headline}</p>
                    )}
                  </div>
                  {isOwnProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/profile')}
                      className="shrink-0 gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Profile
                    </Button>
                  )}
                </div>

                {/* Meta chips */}
                <div className="flex flex-wrap gap-3 mt-4 text-sm text-slate-500">
                  {profileUser.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {profileUser.location}
                    </span>
                  )}
                  {profileUser.email && (
                    <span className="flex items-center gap-1.5">
                      <AtSign className="w-3.5 h-3.5 text-slate-400" />
                      {profileUser.email}
                    </span>
                  )}
                  {profileUser.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {profileUser.phone}
                    </span>
                  )}
                </div>

                {/* Action links */}
                <div className="flex flex-wrap gap-3 mt-4">
                  {profileUser.linkedinUrl && (
                    <Link
                      href={profileUser.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                      LinkedIn
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </Link>
                  )}
                  {(profileUser as any).githubUrl && (
                    <Link
                      href={(profileUser as any).githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-900/10 text-slate-800 hover:bg-slate-900/20 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                      </svg>
                      GitHub
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </Link>
                  )}
                  {profileUser.resumeUrl && (
                    <a
                      href={profileUser.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Resume
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Professional Summary ──────────────────────────────── */}
        {profileUser.role === 'Job Seeker' && profileUser.summary && (
          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 border-l-4 border-indigo-500">
            <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Professional Summary
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">
              {profileUser.summary}
            </p>
          </div>
        )}

        {/* ── Profile Sections (Skills, Education, etc.) ─────────── */}
        {profileUser.role === 'Job Seeker' && (
          <div className="space-y-5">
            <ProfileSections userId={profileUser.id} isEditable={isOwnProfile} />
          </div>
        )}

        {/* ── Personal Details ──────────────────────────────── */}
        {hasPersonalDetails && (
          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
            <h2 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-slate-500" />
              Personal Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Gender", value: profileUser.gender },
                { label: "Marital Status", value: profileUser.maritalStatus },
                { label: "Date of Birth", value: profileUser.dateOfBirth ? format(new Date(profileUser.dateOfBirth), "PPP") : null },
                { label: "Category", value: profileUser.category },
              ].filter(f => f.value).map(f => (
                <div key={f.label} className="flex items-center gap-3 text-sm">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-slate-500 text-xs">{f.label}</span>
                    <p className="font-semibold text-slate-800">{f.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Diversity & Inclusion ────────────────────────────── */}
        {hasDiversityDetails && (
          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
            <h2 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-rose-500" />
              Diversity & Inclusion
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Disability Status", value: profileUser.disabilityStatus },
                { label: "Military/Veteran Service", value: profileUser.militaryExperience },
                { label: "Career Break", value: profileUser.careerBreak },
              ].filter(f => f.value).map(f => (
                <div key={f.label} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <div>
                    <span className="text-slate-500 text-xs">{f.label}</span>
                    <p className="font-semibold text-slate-800">{f.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
