"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MessageSquare, Share2, Pencil, Trash2, Loader2, Reply, CheckCircle2, Pin, LogIn, ExternalLink } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CommunityShareModal } from "@/components/community-share-modal";
import { Avatar, PostTypeBadge, formatRelativeDate } from "@/components/communities/community-ui";
import { communityFetch, errorMessage } from "@/components/communities/community-fetch";

export interface ViewPostDetail {
  id: number;
  communityId: number;
  authorUuid: string | null;
  author: { name: string; role: string };
  title: string;
  content: string;
  postType: string;
  externalLink: string | null;
  isPinned: boolean;
  isLocked: boolean;
  likesCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface ViewComment {
  id: number;
  parentId: number | null;
  authorUuid: string | null;
  author: { name: string; role: string };
  content: string;
  isAccepted: boolean;
  createdAt: string;
}

const COMMENT_MAX = 5000;
const cardClass = "rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900";
const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950";
const labelClass = "text-xs font-semibold text-slate-600 dark:text-slate-300";

export function PostView({
  initialPost,
  initialComments,
  communityName,
  communitySlug,
}: {
  initialPost: ViewPostDetail;
  initialComments: ViewComment[];
  communityName: string;
  communitySlug: string;
}) {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const [post, setPost] = useState(initialPost);
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [savingComment, setSavingComment] = useState(false);
  const [deletingComment, setDeletingComment] = useState<ViewComment | null>(null);
  const [busyDeleteComment, setBusyDeleteComment] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [savingPost, setSavingPost] = useState(false);
  const [confirmDeletePost, setConfirmDeletePost] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const communityHref = `/communities/${communitySlug}`;
  const postPath = `${communityHref}/posts/${post.id}`;
  const loginHref = `/login?redirect=${encodeURIComponent(postPath)}`;
  const isAuthor = !!user && user.uuid === post.authorUuid;
  const isQuestion = post.postType === "question";

  const reloadComments = async () => {
    const res = await fetch(`/api/communities/posts/${post.id}/comments`);
    if (res.ok) setComments(await res.json());
  };

  const fail = (title: string, err: any) => toast({ title, description: err?.message || "Please try again.", variant: "destructive" });

  const likePost = async () => {
    if (!user) return router.push(loginHref);
    try {
      const res = await communityFetch(`/api/communities/posts/${post.id}/reactions`, {
        method: "POST",
        body: JSON.stringify({ userUuid: user.uuid, reactionType: "like" }),
      });
      if (!res.ok) throw new Error(await errorMessage(res, "We couldn't save your reaction."));
      const data = await res.json();
      setPost(p => ({ ...p, likesCount: Math.max(0, p.likesCount + (data.reacted ? 1 : -1)) }));
    } catch (err) {
      fail("Something went wrong", err);
    }
  };

  const addComment = async (e: React.FormEvent, parentId: number | null) => {
    e.preventDefault();
    if (!user) return;
    const text = (parentId ? replyText : newComment).trim();
    if (text.length < 2 || text.length > COMMENT_MAX) return;
    setSubmitting(true);
    try {
      const res = await communityFetch(`/api/communities/posts/${post.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: text, authorUuid: user.uuid, parentId }),
      });
      if (!res.ok) throw new Error(await errorMessage(res, "We couldn't publish your reply."));
      if (parentId) {
        setReplyText("");
        setReplyTo(null);
      } else {
        setNewComment("");
      }
      await reloadComments();
    } catch (err) {
      fail("Reply not published", err);
    } finally {
      setSubmitting(false);
    }
  };

  const saveComment = async (commentId: number) => {
    if (!user || !editCommentText.trim()) return;
    setSavingComment(true);
    try {
      const res = await communityFetch(`/api/communities/posts/${post.id}/comments`, {
        method: "PUT",
        body: JSON.stringify({ commentId, content: editCommentText.trim(), userUuid: user.uuid }),
      });
      if (!res.ok) throw new Error(await errorMessage(res, "We couldn't save your changes."));
      setComments(prev => prev.map(c => (c.id === commentId ? { ...c, content: editCommentText.trim() } : c)));
      setEditingCommentId(null);
    } catch (err) {
      fail("Update failed", err);
    } finally {
      setSavingComment(false);
    }
  };

  const deleteComment = async () => {
    if (!user || !deletingComment) return;
    setBusyDeleteComment(true);
    try {
      const res = await communityFetch(
        `/api/communities/posts/${post.id}/comments?commentId=${deletingComment.id}&userUuid=${encodeURIComponent(user.uuid)}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error(await errorMessage(res, "We couldn't delete this reply."));
      await reloadComments();
      setDeletingComment(null);
    } catch (err) {
      fail("Delete failed", err);
    } finally {
      setBusyDeleteComment(false);
    }
  };

  const toggleAccepted = async (comment: ViewComment) => {
    if (!user) return;
    try {
      const res = await communityFetch(`/api/communities/posts/${post.id}/comments`, {
        method: "PUT",
        body: JSON.stringify({ commentId: comment.id, isAccepted: !comment.isAccepted, userUuid: user.uuid }),
      });
      if (!res.ok) throw new Error(await errorMessage(res, "We couldn't update the answer."));
      await reloadComments();
    } catch (err) {
      fail("Something went wrong", err);
    }
  };

  const savePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || editTitle.trim().length < 5 || editContent.trim().length < 10) return;
    setSavingPost(true);
    try {
      const res = await communityFetch(`/api/communities/posts/${post.id}`, {
        method: "PUT",
        body: JSON.stringify({ title: editTitle.trim(), content: editContent.trim(), userUuid: user.uuid }),
      });
      if (!res.ok) throw new Error(await errorMessage(res, "We couldn't save your changes."));
      setPost(p => ({ ...p, title: editTitle.trim(), content: editContent.trim() }));
      setEditOpen(false);
    } catch (err) {
      fail("Update failed", err);
    } finally {
      setSavingPost(false);
    }
  };

  const deletePost = async () => {
    if (!user) return;
    setDeletingPost(true);
    try {
      const res = await communityFetch(`/api/communities/posts/${post.id}?userUuid=${encodeURIComponent(user.uuid)}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await errorMessage(res, "We couldn't delete this post."));
      router.push(communityHref);
    } catch (err) {
      fail("Delete failed", err);
      setDeletingPost(false);
      setConfirmDeletePost(false);
    }
  };

  const roots = comments.filter(c => c.parentId === null);
  const replies = new Map<number, ViewComment[]>();
  comments.forEach(c => {
    if (c.parentId !== null) replies.set(c.parentId, [...(replies.get(c.parentId) || []), c]);
  });

  const renderComment = (comment: ViewComment, nested: boolean) => {
    const own = !!user && user.uuid === comment.authorUuid;
    const editing = editingCommentId === comment.id;
    return (
      <article
        key={comment.id}
        id={`reply-${comment.id}`}
        className={cn(
          "rounded-2xl border p-4",
          comment.isAccepted
            ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/20"
            : nested
              ? "border-slate-200/70 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40"
              : "border-slate-200/70 bg-white dark:border-slate-800 dark:bg-slate-900"
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5 text-xs">
            <Avatar name={comment.author.name} size="sm" />
            <span className="truncate font-semibold text-slate-900 dark:text-slate-100">{comment.author.name}</span>
            <span className="text-slate-400">·</span>
            <time dateTime={comment.createdAt} className="shrink-0 text-slate-500 dark:text-slate-400">{formatRelativeDate(comment.createdAt)}</time>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {comment.isAccepted && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Accepted answer
              </span>
            )}
            {own && !editing && (
              <>
                <button type="button" onClick={() => { setEditingCommentId(comment.id); setEditCommentText(comment.content); }} aria-label="Edit reply" className={cn("rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800", focusRing)}>
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => setDeletingComment(comment)} aria-label="Delete reply" className={cn("rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30", focusRing)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {editing ? (
          <div className="mt-3 space-y-2">
            <label htmlFor={`edit-${comment.id}`} className="sr-only">Edit reply</label>
            <Textarea id={`edit-${comment.id}`} value={editCommentText} onChange={e => setEditCommentText(e.target.value)} className="min-h-24 rounded-xl text-sm" />
            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={() => saveComment(comment.id)} disabled={savingComment || !editCommentText.trim()} className="rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                {savingComment ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : "Save"}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setEditingCommentId(null)} className="rounded-lg">Cancel</Button>
            </div>
          </div>
        ) : (
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700 dark:text-slate-300">{comment.content}</p>
        )}

        {!nested && !editing && (user || (isQuestion && isAuthor)) && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            {user && !post.isLocked && (
              <button
                type="button"
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                aria-expanded={replyTo === comment.id}
                className={cn("flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-slate-600 hover:bg-slate-100 hover:text-indigo-700 dark:text-slate-400 dark:hover:bg-slate-800", focusRing)}
              >
                <Reply className="h-3.5 w-3.5" aria-hidden="true" /> Reply
              </button>
            )}
            {isQuestion && isAuthor && (
              <button
                type="button"
                onClick={() => toggleAccepted(comment)}
                className={cn("flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-400 dark:hover:bg-emerald-950/30", focusRing)}
              >
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> {comment.isAccepted ? "Unmark answer" : "Mark as answer"}
              </button>
            )}
          </div>
        )}
      </article>
    );
  };

  return (
    <>
      <article className={cn(cardClass, "p-5 sm:p-7")} aria-labelledby="post-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={post.author.name} />
            <div className="min-w-0 text-sm">
              <p className="truncate font-semibold text-slate-900 dark:text-white">{post.author.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                in <Link href={communityHref} className="font-medium text-indigo-700 hover:underline dark:text-indigo-300">{communityName}</Link>
                {" · "}
                <time dateTime={post.createdAt}>{formatRelativeDate(post.createdAt)}</time>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {post.isPinned && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                <Pin className="h-3 w-3" aria-hidden="true" /> Pinned
              </span>
            )}
            <PostTypeBadge type={post.postType} />
          </div>
        </div>

        <h1 id="post-title" className="mt-5 text-2xl font-bold leading-snug tracking-tight text-slate-900 sm:text-3xl dark:text-white">{post.title}</h1>
        <div className="mt-4 whitespace-pre-wrap break-words text-base leading-relaxed text-slate-700 dark:text-slate-300">{post.content}</div>

        {post.externalLink && (
          <a
            href={post.externalLink}
            target="_blank"
            rel="noopener noreferrer nofollow ugc"
            className="mt-4 inline-flex max-w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-slate-50 dark:border-slate-700 dark:text-indigo-300 dark:hover:bg-slate-800"
          >
            <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{post.externalLink}</span>
          </a>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
            <button type="button" onClick={likePost} aria-label="Like this post" className={cn("flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30", focusRing)}>
              <Heart className="h-4 w-4" aria-hidden="true" /> <span className="tabular-nums">{post.likesCount}</span>
            </button>
            <a href="#replies" className={cn("flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800", focusRing)}>
              <MessageSquare className="h-4 w-4" aria-hidden="true" /> <span className="tabular-nums">{comments.length}</span> <span className="sr-only">replies</span>
            </a>
            <button type="button" onClick={() => setShareOpen(true)} className={cn("flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800", focusRing)}>
              <Share2 className="h-4 w-4" aria-hidden="true" /> Share
            </button>
          </div>
          {isAuthor && (
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => { setEditTitle(post.title); setEditContent(post.content); setEditOpen(true); }} className="rounded-lg border-slate-200 dark:border-slate-700">
                <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Edit
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setConfirmDeletePost(true)} className="rounded-lg border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/30">
                <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Delete
              </Button>
            </div>
          )}
        </div>
      </article>

      <section id="replies" aria-labelledby="replies-heading" className="scroll-mt-24 space-y-4">
        <h2 id="replies-heading" className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          {comments.length} {comments.length === 1 ? "reply" : "replies"}
        </h2>

        {post.isLocked ? (
          <p className={cn(cardClass, "p-4 text-sm text-slate-600 dark:text-slate-400")}>This discussion is locked. New replies are turned off.</p>
        ) : user ? (
          <form onSubmit={e => addComment(e, null)} className={cn(cardClass, "space-y-3 p-4")}>
            <label htmlFor="new-reply" className={labelClass}>Your reply</label>
            <Textarea
              id="new-reply"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder={isQuestion ? "Share an answer or a helpful pointer…" : "Add to the discussion…"}
              className="min-h-24 rounded-xl text-sm"
            />
            <div className="flex items-center justify-between">
              <span className={cn("text-[11px] tabular-nums text-slate-500", newComment.length > COMMENT_MAX && "font-semibold text-rose-600")}>
                {newComment.length.toLocaleString()} / {COMMENT_MAX.toLocaleString()}
              </span>
              <Button type="submit" disabled={submitting || newComment.trim().length < 2 || newComment.length > COMMENT_MAX} className="rounded-xl bg-indigo-600 font-semibold text-white hover:bg-indigo-700">
                {submitting && !replyTo ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Post reply"}
              </Button>
            </div>
          </form>
        ) : (
          <div className={cn(cardClass, "flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:justify-between")}>
            <p className="text-sm text-slate-600 dark:text-slate-400">Sign in to reply, react and follow this discussion.</p>
            <Button asChild className="rounded-xl bg-indigo-600 font-semibold text-white hover:bg-indigo-700">
              <Link href={loginHref}><LogIn className="mr-2 h-4 w-4" aria-hidden="true" /> Sign in</Link>
            </Button>
          </div>
        )}

        {roots.length > 0 ? (
          <ul className="space-y-3">
            {roots.map(comment => (
              <li key={comment.id} className="space-y-2">
                {renderComment(comment, false)}
                {replyTo === comment.id && (
                  <form onSubmit={e => addComment(e, comment.id)} className="ml-6 flex gap-2 sm:ml-10">
                    <label htmlFor={`reply-input-${comment.id}`} className="sr-only">Reply to {comment.author.name}</label>
                    <Input
                      id={`reply-input-${comment.id}`}
                      autoFocus
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder={`Reply to ${comment.author.name}…`}
                      className="h-10 rounded-xl text-sm"
                    />
                    <Button type="submit" disabled={submitting || replyText.trim().length < 2} className="h-10 rounded-xl bg-indigo-600 font-semibold text-white hover:bg-indigo-700">
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Reply"}
                    </Button>
                  </form>
                )}
                {(replies.get(comment.id) || []).length > 0 && (
                  <ul className="ml-6 space-y-2 border-l-2 border-slate-200 pl-4 sm:ml-10 dark:border-slate-800">
                    {(replies.get(comment.id) || []).map(r => <li key={r.id}>{renderComment(r, true)}</li>)}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className={cn(cardClass, "p-8 text-center")}>
            <MessageSquare className="mx-auto mb-2 h-6 w-6 text-slate-400" aria-hidden="true" />
            <p className="font-semibold text-slate-900 dark:text-white">No replies yet</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Be the first to help.</p>
          </div>
        )}
      </section>

      <Dialog open={editOpen} onOpenChange={open => { if (!savingPost) setEditOpen(open); }}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Edit post</DialogTitle>
            <DialogDescription>Update the title or details of your post.</DialogDescription>
          </DialogHeader>
          <form onSubmit={savePost} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="edit-post-title" className={labelClass}>Title <span className="text-rose-500">*</span></label>
              <Input id="edit-post-title" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="h-11 rounded-xl" />
              {editTitle.trim().length > 0 && editTitle.trim().length < 5 && <p className="text-xs font-medium text-rose-600">Use at least 5 characters.</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="edit-post-content" className={labelClass}>Details <span className="text-rose-500">*</span></label>
              <Textarea id="edit-post-content" value={editContent} onChange={e => setEditContent(e.target.value)} className="min-h-40 rounded-xl" />
              {editContent.trim().length > 0 && editContent.trim().length < 10 && <p className="text-xs font-medium text-rose-600">Use at least 10 characters.</p>}
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={savingPost} className="rounded-xl">Cancel</Button>
              <Button type="submit" disabled={savingPost || editTitle.trim().length < 5 || editContent.trim().length < 10} className="rounded-xl bg-indigo-600 font-semibold text-white hover:bg-indigo-700">
                {savingPost ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Save changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDeletePost} onOpenChange={open => { if (!deletingPost) setConfirmDeletePost(open); }}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>The post and all of its replies will be removed permanently. This can&apos;t be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingPost} className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={e => { e.preventDefault(); deletePost(); }} disabled={deletingPost} className="rounded-xl bg-rose-600 text-white hover:bg-rose-700">
              {deletingPost ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Delete post"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingComment} onOpenChange={open => { if (!open && !busyDeleteComment) setDeletingComment(null); }}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this reply?</AlertDialogTitle>
            <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busyDeleteComment} className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={e => { e.preventDefault(); deleteComment(); }} disabled={busyDeleteComment} className="rounded-xl bg-rose-600 text-white hover:bg-rose-700">
              {busyDeleteComment ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Delete reply"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CommunityShareModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        post={{ title: post.title, content: post.content, communityPath: communityHref, postId: post.id }}
      />
    </>
  );
}
