"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Sparkles, Loader2, ArrowLeft, Heart,
  Calendar, CheckCircle, Reply, Trash2, Edit2, ShieldAlert
} from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Post {
  id: number;
  uuid: string;
  communityId: number;
  authorUuid: string;
  title: string;
  content: string;
  postType: string;
  createdAt: string;
  isPinned: boolean;
  isLocked: boolean;
  isBookmarked: boolean;
  isSolved: boolean;
  likesCount: number;
  commentCount: number;
  author: {
    name: string;
    role: string;
    type: string;
  };
}

interface Comment {
  id: number;
  uuid: string;
  parentId: number | null;
  content: string;
  createdAt: string;
  isAccepted: boolean;
  authorUuid: string;
  author: {
    name: string;
    role: string;
    type: string;
  };
  reactions: any[];
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const { id: communityId, postId } = params;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms states
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyTargetId, setReplyTargetId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      const [postRes, commRes] = await Promise.all([
        fetch(`/api/communities/posts/${postId}?userId=${user?.uuid || ""}`),
        fetch(`/api/communities/posts/${postId}/comments`)
      ]);

      if (postRes.ok) {
        setPost(await postRes.json());
      }
      if (commRes.ok) {
        setComments(await commRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostDetails();
  }, [postId, user?.uuid]);

  const handlePostLike = async () => {
    if (!user || !post) return;
    try {
      const res = await fetch(`/api/communities/posts/${postId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userUuid: user.uuid, reactionType: "like" })
      });
      if (res.ok) {
        const data = await res.json();
        setPost(prev => prev ? {
          ...prev,
          likesCount: data.reacted ? prev.likesCount + 1 : prev.likesCount - 1
        } : null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async (e: React.FormEvent, parentId: number | null = null) => {
    e.preventDefault();
    const content = parentId ? replyText : newComment;
    if (!content.trim() || !user || !post) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/communities/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          authorUuid: user.uuid,
          parentId
        })
      });

      if (res.ok) {
        toast({ title: "Comment Published" });
        if (parentId) {
          setReplyText("");
          setReplyTargetId(null);
        } else {
          setNewComment("");
        }
        // Reload comments
        const commRes = await fetch(`/api/communities/posts/${postId}/comments`);
        if (commRes.ok) setComments(await commRes.json());
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAcceptComment = async (comment: Comment) => {
    if (!user || !post) return;
    try {
      const res = await fetch(`/api/communities/posts/${postId}/comments`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId: comment.id,
          isAccepted: !comment.isAccepted,
          userUuid: user.uuid
        })
      });

      if (res.ok) {
        toast({
          title: !comment.isAccepted ? "Answer Accepted! ✓" : "Dismissed Answer"
        });
        const commRes = await fetch(`/api/communities/posts/${postId}/comments`);
        if (commRes.ok) setComments(await commRes.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/communities/posts/${postId}/comments?commentId=${commentId}&userUuid=${user.uuid}`, {
        method: "DELETE"
      });
      if (res.ok) {
        toast({ title: "Comment deleted" });
        setComments(prev => prev.filter(c => c.id !== commentId));
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Reconstruct nested comment lists (returns roots with children maps)
  const roots = comments.filter(c => c.parentId === null);
  const repliesGroup = new Map<number, Comment[]>();
  comments.forEach(c => {
    if (c.parentId !== null) {
      const list = repliesGroup.get(c.parentId) || [];
      list.push(c);
      repliesGroup.set(c.parentId, list);
    }
  });

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold">Discussion not found</h2>
        <Button onClick={() => router.push(`/communities/${communityId}`)}>Back to Forum</Button>
      </div>
    );
  }

  const isPostCreator = post.authorUuid === user?.uuid;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 pb-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none -translate-x-1/2 -translate-y-1/2 opacity-15 dark:opacity-5 bg-[#3525cd]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-10 relative z-10">
        
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.push(`/communities/${post.communityId}`)} 
          className="mb-6 hover:bg-slate-100 dark:hover:bg-slate-900 font-bold text-xs uppercase gap-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Forum
        </Button>

        {/* Main Post details */}
        <div className="max-w-4xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 p-6 sm:p-8 shadow-sm mb-8">
          
          {/* Post header info */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 flex items-center justify-center font-bold text-[#3525cd] text-sm shrink-0">
                {post.author.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{post.author.name}</span>
                <span className="block text-[10px] text-slate-400 font-semibold">{post.author.role}</span>
              </div>
            </div>

            <div className="flex gap-2">
              {post.isPinned && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200/30">
                  Pin
                </span>
              )}
              <span className="text-[9px] font-black uppercase tracking-wider rounded bg-slate-50 text-slate-500 dark:bg-slate-950 px-2.5 py-1">
                {post.postType}
              </span>
            </div>
          </div>

          {/* Title & description body */}
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug mb-4">
            {post.title}
          </h1>

          <div className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium leading-relaxed mb-8 whitespace-pre-wrap">
            {post.content}
          </div>

          {/* Likes, bookmark count */}
          <div className="flex items-center justify-between border-t border-slate-200/30 dark:border-slate-800/30 pt-4 text-xs font-black uppercase tracking-widest text-slate-400">
            <button 
              onClick={handlePostLike}
              className="flex items-center gap-1.5 hover:text-rose-500 transition-colors"
            >
              <Heart className="w-4.5 h-4.5 text-slate-400 hover:text-rose-500" />
              {post.likesCount} Likes
            </button>
            <span className="text-[10px] text-slate-400/80">Posted {new Date(post.createdAt).toLocaleDateString()}</span>
          </div>

        </div>

        {/* Discussions Comments Section */}
        <div className="max-w-4xl space-y-6">
          
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
            <MessageSquare className="w-4.5 h-4.5" />
            Comments ({comments.length})
          </h3>

          {/* Add root comment form */}
          {user && (
            <form onSubmit={(e) => handleAddComment(e)} className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-5 flex gap-3.5 shadow-sm">
              <Input 
                placeholder="Write a supportive comment or helpful answer..." 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                required
                className="h-11 rounded-xl text-xs font-semibold"
              />
              <Button type="submit" disabled={submittingComment || !newComment.trim()} className="bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs uppercase px-5 h-11 rounded-xl">
                {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish"}
              </Button>
            </form>
          )}

          {/* Comment replies stream list */}
          {roots.length > 0 ? (
            <div className="space-y-4">
              {roots.map(comment => {
                const subReplies = repliesGroup.get(comment.id) || [];
                return (
                  <div key={comment.id} className="space-y-3">
                    
                    {/* Root comment bubble */}
                    <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-sm">
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 flex items-center justify-center font-bold text-[#3525cd] text-sm shrink-0">
                            {comment.author.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{comment.author.name}</span>
                            <span className="block text-[10px] text-slate-400 font-semibold">{comment.author.role}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Mark as Accepted for Questions */}
                          {post.postType === "question" && isPostCreator && (
                            <Button 
                              size="sm" 
                              variant={comment.isAccepted ? "default" : "outline"}
                              onClick={() => handleAcceptComment(comment)}
                              className={cn(
                                "h-7 text-[8px] uppercase font-black tracking-wider px-2 rounded-lg",
                                comment.isAccepted ? "bg-emerald-600 text-white hover:bg-emerald-700" : "border-slate-200"
                              )}
                            >
                              {comment.isAccepted ? "✓ Accepted Answer" : "Mark as Solution"}
                            </Button>
                          )}
                          {post.postType === "question" && comment.isAccepted && !isPostCreator && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200/30">
                              ✓ Accepted Solution
                            </span>
                          )}
                          {user?.uuid === comment.authorUuid && (
                            <button onClick={() => handleDeleteComment(comment.id)} className="p-1.5 hover:text-rose-500 text-slate-400 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium leading-relaxed mb-4 pl-1">
                        {comment.content}
                      </p>

                      <div className="flex items-center justify-between border-t border-slate-200/10 pt-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {user && (
                          <button 
                            onClick={() => setReplyTargetId(prev => prev === comment.id ? null : comment.id)}
                            className="flex items-center gap-1 hover:text-[#3525cd] transition-colors"
                          >
                            <Reply className="w-3.5 h-3.5" /> Reply
                          </button>
                        )}
                        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Inline Reply input for this comment */}
                    {replyTargetId === comment.id && (
                      <form onSubmit={(e) => handleAddComment(e, comment.id)} className="ml-10 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex gap-3 shadow-inner">
                        <Input 
                          placeholder={`Reply to ${comment.author.name}...`} 
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          required
                          className="h-9 text-xs rounded-lg"
                        />
                        <Button size="sm" type="submit" disabled={submittingComment || !replyText.trim()} className="bg-slate-900 text-white font-bold text-[10px] uppercase px-4 h-9 rounded-lg">
                          {submittingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Publish"}
                        </Button>
                      </form>
                    )}

                    {/* Nested Sub-replies */}
                    {subReplies.map(reply => (
                      <div key={reply.id} className="ml-10 bg-slate-50/50 dark:bg-slate-950/20 rounded-3xl border border-slate-200/30 dark:border-slate-800/30 p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-4 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 flex items-center justify-center font-bold text-[#3525cd] text-xs shrink-0">
                              {reply.author.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{reply.author.name}</span>
                              <span className="block text-[10px] text-slate-400 font-semibold">{reply.author.role}</span>
                            </div>
                          </div>
                          {user?.uuid === reply.authorUuid && (
                            <button onClick={() => handleDeleteComment(reply.id)} className="p-1.5 hover:text-rose-500 text-slate-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium leading-relaxed pl-1">
                          {reply.content}
                        </p>
                      </div>
                    ))}

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-16 text-center">
              <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h4 className="text-slate-700 dark:text-slate-300 font-extrabold text-base mb-1">No comments yet</h4>
              <p className="text-slate-400 dark:text-slate-500 text-xs max-w-xs mx-auto">Publish your reply above to get this thread started.</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
