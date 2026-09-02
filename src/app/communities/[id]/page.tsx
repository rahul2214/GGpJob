"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MessageSquare, Loader2, ArrowLeft,
  Users, CheckCircle, Heart, AlertTriangle, Megaphone,
  Edit2, Trash2, Share2
} from "lucide-react";
import * as Icons from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CommunityShareModal } from "@/components/community-share-modal";

interface Community {
  id: number;
  uuid: string;
  name: string;
  description: string;
  category: string;
  coverImage?: string;
  icon: string;
  memberCount: number;
  isJoined: boolean;
  userRole: string;
}

interface Post {
  id: number;
  uuid: string;
  communityId?: number;
  authorUuid: string;
  title: string;
  content: string;
  postType: string;
  createdAt: string;
  commentCount: number;
  isPinned: boolean;
  isLocked: boolean;
  isSolved: boolean;
  likesCount: number;
  isBookmarked: boolean;
  metadata: any;
  author: {
    name: string;
    role: string;
    type: string;
  };
}

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (Icons as any)[name] || Icons.Users;
  return <IconComponent className={className} />;
}

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const id = params.id as string;

  const [comm, setComm] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);

  // Discussions state
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingTab, setLoadingTab] = useState(false);

  // Share state
  const [sharingPost, setSharingPost] = useState<any | null>(null);

  // New Post Dialog Form
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postType, setPostType] = useState("discussion");
  const [postLink, setPostLink] = useState("");
  const [creatingPost, setCreatingPost] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showLeaveConfirmDialog, setShowLeaveConfirmDialog] = useState(false);

  // Edit / Delete post state
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [updatingPost, setUpdatingPost] = useState(false);
  const [deletingPost, setDeletingPost] = useState<Post | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/communities/${id}?userId=${user?.uuid || ""}`);
      if (res.ok) {
        const data = await res.json();
        setComm(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, user?.uuid]);

  const loadPosts = async () => {
    if (!comm) return;
    setLoadingTab(true);
    try {
      const res = await fetch(`/api/communities/${id}/posts?userId=${user?.uuid || ""}`);
      if (res.ok) setPosts(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTab(false);
    }
  };

  useEffect(() => {
    if (comm) {
      loadPosts();
    }
  }, [comm]);

  const handleJoinToggle = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to join professional communities.",
        variant: "destructive"
      });
      router.push('/login');
      return;
    }
    if (!comm) return;
    if (comm.isJoined) {
      setShowLeaveConfirmDialog(true);
    } else {
      executeJoinToggle();
    }
  };

  const executeJoinToggle = async () => {
    if (!user || !comm) return;
    try {
      const method = comm.isJoined ? "DELETE" : "POST";
      const url = comm.isJoined 
        ? `/api/communities/${comm.id}/join?userUuid=${user.uuid}`
        : `/api/communities/${comm.id}/join`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: comm.isJoined ? undefined : JSON.stringify({ userUuid: user.uuid })
      });

      if (res.ok) {
        setComm(prev => prev ? {
          ...prev,
          isJoined: !prev.isJoined,
          memberCount: prev.isJoined ? (prev.memberCount || 0) - 1 : (prev.memberCount || 0) + 1
        } : null);

        toast({
          title: comm.isJoined ? "Left Community" : "Joined Community! 🎉",
          description: comm.isJoined ? `Unsubscribed from ${comm.name}.` : `Welcome to ${comm.name}!`
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !postTitle || !postContent) return;

    setCreatingPost(true);
    try {
      const res = await fetch(`/api/communities/${id}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorUuid: user.uuid,
          title: postTitle,
          content: postContent,
          postType,
          metadata: postLink ? { external_link: postLink } : {}
        })
      });

      if (res.ok) {
        toast({ title: "✓ Post Created!" });
        setPostTitle("");
        setPostContent("");
        setPostLink("");
        setIsDialogOpen(false);
        loadPosts();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setCreatingPost(false);
    }
  };

  const openEditModal = (p: Post) => {
    setEditingPost(p);
    setEditTitle(p.title);
    setEditContent(p.content);
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingPost || !editTitle.trim() || !editContent.trim()) return;

    setUpdatingPost(true);
    try {
      const res = await fetch(`/api/communities/posts/${editingPost.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          userUuid: user.uuid
        })
      });

      if (res.ok) {
        toast({ title: "✓ Post Updated!" });
        setEditingPost(null);
        loadPosts();
      } else {
        const err = await res.json();
        toast({ title: "Error", description: err.error || "Failed to update post", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUpdatingPost(false);
    }
  };

  const handleDeletePost = async () => {
    if (!user || !deletingPost) return;

    setIsDeletingPost(true);
    try {
      const res = await fetch(`/api/communities/posts/${deletingPost.id}?userUuid=${user.uuid}`, {
        method: "DELETE"
      });

      if (res.ok) {
        toast({ title: "Post deleted" });
        setDeletingPost(null);
        loadPosts();
      } else {
        const err = await res.json();
        toast({ title: "Error", description: err.error || "Failed to delete post", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsDeletingPost(false);
    }
  };

  const handlePostLike = async (post: Post) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/communities/posts/${post.id}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userUuid: user.uuid, reactionType: "like" })
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(prev => prev.map(p => p.id === post.id ? {
          ...p,
          likesCount: data.reacted ? p.likesCount + 1 : p.likesCount - 1
        } : p));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!comm) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold">Community not found</h2>
        <Button onClick={() => router.push('/communities')} className="mt-4">Back to Forums</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 pb-24 relative overflow-hidden">
      {/* Background blur styling */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none -translate-x-1/2 -translate-y-1/2 opacity-15 dark:opacity-5 bg-[#3525cd]" />
      
      {/* Banner Cover Grid */}
      <div className="h-44 sm:h-56 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 relative">
        <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f8fafc] dark:from-slate-950 to-transparent" />
        <Button
          variant="ghost"
          onClick={() => router.push('/communities')}
          className="absolute top-6 left-6 text-white hover:bg-white/10 font-bold gap-2 text-xs rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Forums List
        </Button>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        
        {/* Core Metadata Container */}
        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 flex items-center justify-center text-[#3525cd] dark:text-indigo-400 shadow-inner shrink-0">
                <DynamicIcon name={comm.icon} className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">
                  {comm.name}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-semibold max-w-2xl leading-relaxed mb-3">
                  {comm.description || "Discussion and coordination forum."}
                </p>
                
                <div className="flex items-center gap-4 flex-wrap text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {(comm.memberCount || 0).toLocaleString()} Members
                  </span>
                  
                  <span className="bg-indigo-50 text-[#3525cd] dark:bg-indigo-950/20 dark:text-indigo-400 px-2 py-0.5 rounded-md">
                    {comm.category}
                  </span>
                </div>
              </div>
            </div>

            {user && (
              <>
                <Button
                  onClick={handleJoinToggle}
                  className={cn(
                    "rounded-xl font-bold text-xs uppercase px-5 py-2.5 h-11 shadow-sm shrink-0 transition-all",
                    comm.isJoined 
                      ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/10" 
                      : "bg-[#3525cd] text-white hover:bg-indigo-700"
                  )}
                >
                  {comm.isJoined ? "Leave Forum" : "Join Forum"}
                </Button>

                {/* Leave Community Confirmation Dialog */}
                <Dialog open={showLeaveConfirmDialog} onOpenChange={setShowLeaveConfirmDialog}>
                  <DialogContent className="max-w-md bg-white dark:bg-slate-950 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-900 shadow-2xl">
                    <DialogHeader className="mb-4">
                      <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6 text-rose-500" />
                        Leave Community
                      </DialogTitle>
                      <DialogDescription className="text-sm text-slate-500 leading-relaxed mt-2">
                        Are you sure you want to leave the community <strong>{comm.name}</strong>? You will no longer receive notifications or updates from this forum.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-4 pt-4 border-t border-slate-100/50">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowLeaveConfirmDialog(false)} 
                        className="flex-1 h-12 rounded-xl font-bold text-xs uppercase"
                      >
                        No
                      </Button>
                      <Button 
                        type="button" 
                        onClick={async () => {
                          setShowLeaveConfirmDialog(false);
                          await executeJoinToggle();
                        }} 
                        className="flex-grow h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase shadow-lg shadow-rose-500/25"
                      >
                        Yes
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>

        {/* Centered Single-Column discussions layout */}
        <div className="max-w-4xl mx-auto w-full">
          {loadingTab ? (
            <div className="space-y-4 py-10 text-center">
              <Loader2 className="w-7 h-7 animate-spin text-indigo-600 mx-auto" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Discussions...</span>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Create Post Banner Row */}
              {user && comm.isJoined && (
                <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-5 flex gap-4 items-center shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center font-bold text-[#3525cd] text-sm shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <button className="flex-grow text-left h-11 px-5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/50 text-slate-400 dark:bg-slate-950/30 dark:border-slate-800 dark:hover:bg-slate-950/60 transition-colors text-xs font-medium">
                        Start a discussion, review resumes, or ask questions...
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-white dark:bg-slate-950 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-900 shadow-2xl">
                      <DialogHeader className="mb-4">
                        <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Create Post in {comm.name}</DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">Share markdown codes, interview checks, or upload links to help others.</DialogDescription>
                      </DialogHeader>
                      
                      <form onSubmit={handleCreatePost} className="space-y-5">
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-wider text-slate-400">Post Title</label>
                          <Input 
                            placeholder="Enter descriptive post title..." 
                            value={postTitle} 
                            onChange={e => setPostTitle(e.target.value)} 
                            required 
                            className="h-12 rounded-xl text-sm font-semibold"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-wider text-slate-400">Post Type</label>
                            <Select value={postType} onValueChange={setPostType}>
                              <SelectTrigger className="h-12 rounded-xl text-xs font-bold uppercase tracking-wider">
                                <SelectValue placeholder="Discussion" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="discussion" className="text-xs font-bold uppercase tracking-wider">Discussion</SelectItem>
                                <SelectItem value="question" className="text-xs font-bold uppercase tracking-wider">Question</SelectItem>
                                <SelectItem value="experience" className="text-xs font-bold uppercase tracking-wider">Interview Loop</SelectItem>
                                <SelectItem value="review" className="text-xs font-bold uppercase tracking-wider">Resume Review</SelectItem>
                                <SelectItem value="resource" className="text-xs font-bold uppercase tracking-wider">Resource Link</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-wider text-slate-400">External URL (Optional)</label>
                            <Input 
                              placeholder="GitHub, PDF link..." 
                              value={postLink} 
                              onChange={e => setPostLink(e.target.value)} 
                              className="h-12 rounded-xl text-sm font-semibold"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-wider text-slate-400">Body Description (Markdown/Codes)</label>
                          <Textarea 
                            placeholder="Write your explanation or code logs here..." 
                            value={postContent} 
                            onChange={e => setPostContent(e.target.value)} 
                            required
                            className="min-h-40 rounded-2xl text-sm font-medium leading-relaxed"
                          />
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-slate-100/50">
                          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1 h-12 rounded-xl font-bold text-xs uppercase">Cancel</Button>
                          <Button type="submit" disabled={creatingPost} className="flex-grow h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase shadow-lg shadow-indigo-500/25">
                            {creatingPost ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publish Post"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {/* Posts Cards Stream */}
              {posts.length > 0 ? (
                <div className="space-y-5">
                  {posts.map(post => (
                    <div 
                      key={post.id}
                      onClick={() => router.push(`/communities/${id}/posts/${post.id}`)}
                      className="cursor-pointer bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-6 hover:shadow-[0_20px_40px_rgba(99,102,241,0.04)] hover:translate-y-[-2px] transition-all duration-300 relative"
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 flex items-center justify-center font-bold text-[#3525cd] text-sm shrink-0">
                            {post.author.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{post.author.name}</span>
                            <span className="block text-[10px] text-slate-400 font-semibold">{post.author.role}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {user?.uuid === post.authorUuid && (
                            <div className="flex items-center gap-1 mr-1">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openEditModal(post);
                                }}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                                title="Edit Post"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setDeletingPost(post);
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                                title="Delete Post"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          {post.isPinned && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200/30">
                              <Megaphone className="w-2.5 h-2.5" /> Pin
                            </span>
                          )}
                          {post.isSolved && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200/30">
                              <CheckCircle className="w-2.5 h-2.5" /> Solved
                            </span>
                          )}
                          <span className="text-[9px] font-black uppercase tracking-wider rounded bg-slate-50 text-slate-500 dark:bg-slate-950 px-2 py-1">
                            {post.postType}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug mb-2 group-hover:text-indigo-600">
                        {post.title}
                      </h3>
                      
                      <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium leading-relaxed line-clamp-3 mb-5">
                        {post.content}
                      </p>

                      <div className="flex items-center justify-between border-t border-slate-200/30 dark:border-slate-800/30 pt-4 text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">
                        <div className="flex items-center gap-5">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handlePostLike(post);
                            }}
                            className="flex items-center gap-1.5 hover:text-rose-500 transition-colors"
                          >
                            <Heart className="w-4 h-4 text-slate-400 hover:text-rose-500" />
                            {post.likesCount} Likes
                          </button>
                          <span className="flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4 text-slate-400" />
                            {post.commentCount} Replies
                          </span>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSharingPost({
                                title: post.title,
                                content: post.content,
                                communityId: post.communityId || comm.id,
                                postId: post.id
                              });
                            }}
                            className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
                          >
                            <Share2 className="w-4 h-4 text-slate-400 hover:text-indigo-600" />
                            Share
                          </button>
                        </div>

                        <span className="text-[10px] text-slate-400/80">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-16 text-center">
                  <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                  <h4 className="text-slate-700 dark:text-slate-300 font-extrabold text-base mb-1">No posts found</h4>
                  <p className="text-slate-400 dark:text-slate-500 text-xs max-w-xs mx-auto">Be the first to share your thoughts, links or questions in this community.</p>
                </div>
              )}

            </div>
          )}
        </div>

      </div>

      {/* --- Edit Post Modal --- */}
      <Dialog open={!!editingPost} onOpenChange={(open) => !open && setEditingPost(null)}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-950 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-900 shadow-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Edit2 className="w-6 h-6 text-indigo-600" />
              Edit Post
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdatePost} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-400">Post Title</label>
              <Input 
                placeholder="Post title..." 
                value={editTitle} 
                onChange={e => setEditTitle(e.target.value)} 
                required 
                className="h-12 rounded-xl text-sm font-semibold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-400">Post Description</label>
              <Textarea 
                placeholder="Post description..." 
                value={editContent} 
                onChange={e => setEditContent(e.target.value)} 
                required 
                className="min-h-40 rounded-2xl text-sm font-medium leading-relaxed"
              />
            </div>
            <div className="flex gap-4 pt-4 border-t border-slate-100/50">
              <Button type="button" variant="outline" onClick={() => setEditingPost(null)} className="flex-1 h-12 rounded-xl font-bold text-xs uppercase">Cancel</Button>
              <Button type="submit" disabled={updatingPost} className="flex-grow h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase shadow-lg shadow-indigo-500/25">
                {updatingPost ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- Delete Post Modal --- */}
      <Dialog open={!!deletingPost} onOpenChange={(open) => !open && setDeletingPost(null)}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-950 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-900 shadow-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
              Delete Post
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 leading-relaxed mt-2">
              Are you sure you want to delete <strong>&quot;{deletingPost?.title}&quot;</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4 pt-4 border-t border-slate-100/50">
            <Button type="button" variant="outline" onClick={() => setDeletingPost(null)} className="flex-1 h-12 rounded-xl font-bold text-xs uppercase">Cancel</Button>
            <Button type="button" onClick={handleDeletePost} disabled={isDeletingPost} className="flex-grow h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase shadow-lg shadow-rose-500/25">
              {isDeletingPost ? <Loader2 className="w-5 h-5 animate-spin" /> : "Yes, Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- Share Post Modal --- */}
      <CommunityShareModal
        open={!!sharingPost}
        onOpenChange={(open) => !open && setSharingPost(null)}
        post={sharingPost}
      />

    </div>
  );
}
