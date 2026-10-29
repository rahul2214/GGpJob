"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users, Heart, MessageSquare, Share2, Pin, CheckCircle2, Pencil, Trash2, Loader2, Check, Link2, LogIn, PenSquare,
} from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CommunityShareModal } from "@/components/community-share-modal";
import { CommunityIcon, PostTypeBadge, formatRelativeDate, Avatar, POST_TYPE_LABELS } from "@/components/communities/community-ui";
import { communityFetch, errorMessage } from "@/components/communities/community-fetch";

export interface ViewCommunity {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  icon: string;
  memberCount: number;
  createdAt: string | null;
}

export interface ViewPost {
  id: number;
  communityId: number;
  authorUuid: string | null;
  author: { name: string; role: string; type: string };
  title: string;
  content: string;
  postType: string;
  isPinned: boolean;
  isSolved: boolean;
  commentCount: number;
  likesCount: number;
  createdAt: string;
}

type SortKey = "latest" | "top" | "unanswered";

const TITLE_MAX = 150;
const CONTENT_MAX = 10000;
const labelClass = "text-xs font-semibold text-slate-600 dark:text-slate-300";
const cardClass = "rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900";
const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950";

export function CommunityView({ initialCommunity, initialPosts }: { initialCommunity: ViewCommunity; initialPosts: ViewPost[] }) {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const comm = initialCommunity;

  const [isJoined, setIsJoined] = useState(false);
  const [memberCount, setMemberCount] = useState(initialCommunity.memberCount);
  const [joining, setJoining] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const [posts, setPosts] = useState<ViewPost[]>(initialPosts);
  const [sort, setSort] = useState<SortKey>("latest");

  const [composerOpen, setComposerOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("discussion");
  const [link, setLink] = useState("");
  const [formErrors, setFormErrors] = useState<{ title?: string; content?: string; link?: string }>({});
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState<ViewPost | null>(null);
  const [deleting, setDeleting] = useState<ViewPost | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [sharing, setSharing] = useState<ViewPost | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const basePath = `/communities/${comm.slug}`;
  const loginHref = `/login?redirect=${encodeURIComponent(basePath)}`;

  // Membership is per user, so it is fetched after hydration rather than baked
  // into the cached server HTML.
  useEffect(() => {
    if (!user?.uuid) {
      setIsJoined(false);
      return;
    }
    let cancelled = false;
    fetch(`/api/communities/${comm.id}?userId=${encodeURIComponent(user.uuid)}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (cancelled || !data) return;
        setIsJoined(!!data.isJoined);
        if (typeof data.memberCount === "number") setMemberCount(data.memberCount);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [comm.id, user?.uuid]);

  const reloadPosts = async () => {
    try {
      const res = await fetch(`/api/communities/${comm.id}/posts${user?.uuid ? `?userId=${encodeURIComponent(user.uuid)}` : ""}`);
      if (res.ok) setPosts(await res.json());
    } catch {
      // Keep showing the current list.
    }
  };

  const sortedPosts = useMemo(() => {
    const list = [...posts];
    if (sort === "top") {
      return list.sort((a, b) => b.likesCount + b.commentCount * 2 - (a.likesCount + a.commentCount * 2));
    }
    if (sort === "unanswered") {
      return list.filter(p => p.commentCount === 0).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }
    return list.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return +new Date(b.createdAt) - +new Date(a.createdAt);
    });
  }, [posts, sort]);

  const toggleMembership = async () => {
    if (!user) {
      router.push(loginHref);
      return;
    }
    setJoining(true);
    try {
      const res = isJoined
        ? await communityFetch(`/api/communities/${comm.id}/join?userUuid=${encodeURIComponent(user.uuid)}`, { method: "DELETE" })
        : await communityFetch(`/api/communities/${comm.id}/join`, { method: "POST", body: JSON.stringify({ userUuid: user.uuid }) });
      if (!res.ok) throw new Error(await errorMessage(res, "We couldn't update your membership. Please try again."));
      setMemberCount(c => Math.max(0, c + (isJoined ? -1 : 1)));
      setIsJoined(j => !j);
    } catch (err: any) {
      toast({ title: "Something went wrong", description: err.message, variant: "destructive" });
    } finally {
      setJoining(false);
      setConfirmLeave(false);
    }
  };

  const copyCommunityLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${basePath}`);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setLinkCopied(false);
    }
  };

  const openComposer = (post?: ViewPost) => {
    if (post) {
      setEditing(post);
      setTitle(post.title);
      setContent(post.content);
    } else {
      setEditing(null);
      setTitle("");
      setContent("");
      setPostType("discussion");
      setLink("");
    }
    setFormErrors({});
    setComposerOpen(true);
  };

  const validate = () => {
    const errors: typeof formErrors = {};
    const t = title.trim();
    const c = content.trim();
    if (t.length < 5) errors.title = "Give your post a clear title of at least 5 characters.";
    else if (t.length > TITLE_MAX) errors.title = `Keep the title under ${TITLE_MAX} characters.`;
    if (c.length < 10) errors.content = "Add a bit more detail (at least 10 characters).";
    else if (c.length > CONTENT_MAX) errors.content = `Keep the post under ${CONTENT_MAX.toLocaleString()} characters.`;
    if (!editing && link.trim()) {
      try {
        const u = new URL(link.trim());
        if (!/^https?:$/.test(u.protocol)) throw new Error();
      } catch {
        errors.link = "Enter a full link starting with https://";
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validate()) return;
    setSaving(true);
    try {
      const res = editing
        ? await communityFetch(`/api/communities/posts/${editing.id}`, {
            method: "PUT",
            body: JSON.stringify({ title: title.trim(), content: content.trim(), userUuid: user.uuid }),
          })
        : await communityFetch(`/api/communities/${comm.id}/posts`, {
            method: "POST",
            body: JSON.stringify({
              authorUuid: user.uuid,
              title: title.trim(),
              content: content.trim(),
              postType,
              metadata: link.trim() ? { external_link: link.trim() } : {},
            }),
          });
      if (!res.ok) throw new Error(await errorMessage(res, editing ? "We couldn't save your changes." : "We couldn't publish your post."));
      setComposerOpen(false);
      setEditing(null);
      await reloadPosts();
    } catch (err: any) {
      toast({ title: editing ? "Update failed" : "Post not published", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!user || !deleting) return;
    setDeletingBusy(true);
    try {
      const res = await communityFetch(`/api/communities/posts/${deleting.id}?userUuid=${encodeURIComponent(user.uuid)}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await errorMessage(res, "We couldn't delete this post."));
      setPosts(prev => prev.filter(p => p.id !== deleting.id));
      setDeleting(null);
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    } finally {
      setDeletingBusy(false);
    }
  };

  const likePost = async (post: ViewPost) => {
    if (!user) {
      router.push(loginHref);
      return;
    }
    try {
      const res = await communityFetch(`/api/communities/posts/${post.id}/reactions`, {
        method: "POST",
        body: JSON.stringify({ userUuid: user.uuid, reactionType: "like" }),
      });
      if (!res.ok) throw new Error(await errorMessage(res, "We couldn't save your reaction."));
      const data = await res.json();
      setPosts(prev => prev.map(p => (p.id === post.id ? { ...p, likesCount: Math.max(0, p.likesCount + (data.reacted ? 1 : -1)) } : p)));
    } catch (err: any) {
      toast({ title: "Something went wrong", description: err.message, variant: "destructive" });
    }
  };

  return (
    <>
      {/* Header */}
      <section className={cn(cardClass, "p-5 sm:p-7")} aria-labelledby="community-title">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
              <CommunityIcon name={comm.icon} className="h-7 w-7" />
            </span>
            <div className="min-w-0">
              <h1 id="community-title" className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                {comm.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{comm.category}</span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" aria-hidden="true" />
                  <span className="tabular-nums">{memberCount.toLocaleString()}</span> {memberCount === 1 ? "member" : "members"}
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  <span className="tabular-nums">{posts.length}</span> {posts.length === 1 ? "post" : "posts"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button type="button" variant="outline" onClick={copyCommunityLink} className="h-10 rounded-xl border-slate-200 dark:border-slate-700" aria-label="Copy community link">
              {linkCopied ? <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
              <span className="ml-2 hidden sm:inline">{linkCopied ? "Copied" : "Share"}</span>
            </Button>
            {user ? (
              <Button
                type="button"
                disabled={joining}
                onClick={() => (isJoined ? setConfirmLeave(true) : toggleMembership())}
                variant={isJoined ? "outline" : "default"}
                className={cn(
                  "h-10 rounded-xl px-5 font-semibold",
                  isJoined ? "border-slate-200 dark:border-slate-700" : "bg-indigo-600 text-white hover:bg-indigo-700"
                )}
              >
                {joining ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : isJoined ? <><Check className="mr-1.5 h-4 w-4" aria-hidden="true" /> Joined</> : "Join community"}
              </Button>
            ) : (
              <Button asChild className="h-10 rounded-xl bg-indigo-600 px-5 font-semibold text-white hover:bg-indigo-700">
                <Link href={loginHref}><LogIn className="mr-2 h-4 w-4" aria-hidden="true" /> Sign in to join</Link>
              </Button>
            )}
          </div>
        </div>
        {comm.description && (
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">{comm.description}</p>
        )}
      </section>

      {/* Composer prompt */}
      <div className={cn(cardClass, "flex items-center gap-3 p-4")}>
        <Avatar name={user?.name} />
        {user && isJoined ? (
          <button
            type="button"
            onClick={() => openComposer()}
            className={cn("h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-left text-sm text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-400 dark:hover:bg-slate-800", focusRing)}
          >
            Ask a question or start a discussion…
          </button>
        ) : (
          <p className="flex-1 text-sm text-slate-600 dark:text-slate-400">
            {user ? "Join this community to start a discussion." : "Sign in and join to post, comment and react."}
          </p>
        )}
        {user && isJoined && (
          <Button type="button" onClick={() => openComposer()} className="hidden h-11 rounded-xl bg-indigo-600 font-semibold text-white hover:bg-indigo-700 sm:inline-flex">
            <PenSquare className="mr-2 h-4 w-4" aria-hidden="true" /> New post
          </Button>
        )}
      </div>

      {/* Feed */}
      <section aria-labelledby="discussions-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="discussions-heading" className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Discussions</h2>
          <div role="group" aria-label="Sort discussions" className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
            {([["latest", "Latest"], ["top", "Top"], ["unanswered", "Unanswered"]] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={sort === key}
                onClick={() => setSort(key)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  focusRing,
                  sort === key ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {sortedPosts.length > 0 ? (
          <ul className="space-y-3">
            {sortedPosts.map(post => {
              const href = `${basePath}/posts/${post.id}`;
              const isOwner = !!user && user.uuid === post.authorUuid;
              return (
                <li key={post.id}>
                  <article className={cn(cardClass, "relative p-5 transition-colors hover:border-indigo-300 dark:hover:border-indigo-700")}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Avatar name={post.author.name} size="sm" />
                        <div className="min-w-0 text-xs">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{post.author.name}</span>
                          <span className="text-slate-400"> · </span>
                          <time dateTime={post.createdAt} className="text-slate-500 dark:text-slate-400">{formatRelativeDate(post.createdAt)}</time>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {post.isPinned && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                            <Pin className="h-3 w-3" aria-hidden="true" /> Pinned
                          </span>
                        )}
                        {post.isSolved && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Solved
                          </span>
                        )}
                        <PostTypeBadge type={post.postType} />
                      </div>
                    </div>

                    <h3 className="mt-3 text-base font-semibold leading-snug text-slate-900 dark:text-white">
                      <Link href={href} className={cn("rounded after:absolute after:inset-0 after:rounded-2xl", focusRing)}>
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-1.5 line-clamp-2 break-words text-sm leading-relaxed text-slate-600 dark:text-slate-400">{post.content}</p>

                    <div className="relative z-10 mt-4 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => likePost(post)}
                          aria-label={`Like "${post.title}"`}
                          className={cn("flex items-center gap-1.5 rounded-lg px-2 py-1.5 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30", focusRing)}
                        >
                          <Heart className="h-4 w-4" aria-hidden="true" /> <span className="tabular-nums">{post.likesCount}</span>
                        </button>
                        <Link href={`${href}#replies`} className={cn("flex items-center gap-1.5 rounded-lg px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800", focusRing)}>
                          <MessageSquare className="h-4 w-4" aria-hidden="true" />
                          <span className="tabular-nums">{post.commentCount}</span> <span className="sr-only">replies</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setSharing(post)}
                          aria-label={`Share "${post.title}"`}
                          className={cn("flex items-center gap-1.5 rounded-lg px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800", focusRing)}
                        >
                          <Share2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                      {isOwner && (
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => openComposer(post)} aria-label="Edit post" className={cn("rounded-lg p-1.5 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800", focusRing)}>
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => setDeleting(post)} aria-label="Delete post" className={cn("rounded-lg p-1.5 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30", focusRing)}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className={cn(cardClass, "p-10 text-center")}>
            <MessageSquare className="mx-auto mb-3 h-6 w-6 text-slate-400" aria-hidden="true" />
            <p className="font-semibold text-slate-900 dark:text-white">
              {sort === "unanswered" && posts.length > 0 ? "Every question has a reply" : "No discussions yet"}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {sort === "unanswered" && posts.length > 0 ? "Nice — this community is keeping up." : "Start the first conversation in this community."}
            </p>
          </div>
        )}
      </section>

      {/* Create / edit post */}
      <Dialog open={composerOpen} onOpenChange={open => { if (!saving) setComposerOpen(open); }}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">{editing ? "Edit post" : `New post in ${comm.name}`}</DialogTitle>
            <DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
              Be specific and respectful. Never share passwords, payment details or personal documents.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitPost} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="post-title" className={labelClass}>Title <span className="text-rose-500">*</span></label>
              <Input
                id="post-title"
                value={title}
                maxLength={TITLE_MAX + 20}
                onChange={e => { setTitle(e.target.value); if (formErrors.title) setFormErrors(f => ({ ...f, title: undefined })); }}
                placeholder="e.g. How do I prepare for a system design round?"
                aria-invalid={!!formErrors.title}
                aria-describedby={formErrors.title ? "post-title-error" : undefined}
                className="h-11 rounded-xl"
              />
              {formErrors.title && <p id="post-title-error" className="text-xs font-medium text-rose-600 dark:text-rose-400">{formErrors.title}</p>}
            </div>

            {!editing && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="post-type" className={labelClass}>Post type</label>
                  <Select value={postType} onValueChange={setPostType}>
                    <SelectTrigger id="post-type" className="h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["discussion", "question", "experience", "review", "resource"].map(t => (
                        <SelectItem key={t} value={t}>{POST_TYPE_LABELS[t]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="post-link" className={labelClass}>Link <span className="font-normal text-slate-400">Optional</span></label>
                  <Input
                    id="post-link"
                    type="url"
                    value={link}
                    onChange={e => { setLink(e.target.value); if (formErrors.link) setFormErrors(f => ({ ...f, link: undefined })); }}
                    placeholder="https://"
                    aria-invalid={!!formErrors.link}
                    aria-describedby={formErrors.link ? "post-link-error" : undefined}
                    className="h-11 rounded-xl"
                  />
                  {formErrors.link && <p id="post-link-error" className="text-xs font-medium text-rose-600 dark:text-rose-400">{formErrors.link}</p>}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="post-content" className={labelClass}>Details <span className="text-rose-500">*</span></label>
              <Textarea
                id="post-content"
                value={content}
                onChange={e => { setContent(e.target.value); if (formErrors.content) setFormErrors(f => ({ ...f, content: undefined })); }}
                placeholder="Share context, what you've tried, and what kind of help you need."
                aria-invalid={!!formErrors.content}
                aria-describedby="post-content-hint"
                className="min-h-40 rounded-xl"
              />
              <div id="post-content-hint" className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-medium text-rose-600 dark:text-rose-400">{formErrors.content}</span>
                <span className={cn("tabular-nums", content.length > CONTENT_MAX && "font-semibold text-rose-600")}>{content.length.toLocaleString()} / {CONTENT_MAX.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setComposerOpen(false)} disabled={saving} className="rounded-xl">Cancel</Button>
              <Button type="submit" disabled={saving} className="rounded-xl bg-indigo-600 font-semibold text-white hover:bg-indigo-700">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : editing ? "Save changes" : "Publish post"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={open => { if (!open && !deletingBusy) setDeleting(null); }}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleting?.title}&quot; and its replies will be removed permanently. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingBusy} className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={e => { e.preventDefault(); confirmDelete(); }}
              disabled={deletingBusy}
              className="rounded-xl bg-rose-600 text-white hover:bg-rose-700"
            >
              {deletingBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Delete post"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmLeave} onOpenChange={setConfirmLeave}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Leave {comm.name}?</AlertDialogTitle>
            <AlertDialogDescription>You&apos;ll stop getting updates from this community. You can rejoin at any time.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Stay</AlertDialogCancel>
            <AlertDialogAction onClick={e => { e.preventDefault(); toggleMembership(); }} className="rounded-xl bg-rose-600 text-white hover:bg-rose-700">
              {joining ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Leave community"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CommunityShareModal
        open={!!sharing}
        onOpenChange={open => !open && setSharing(null)}
        post={sharing ? { title: sharing.title, content: sharing.content, communityPath: basePath, postId: sharing.id } : null}
      />
    </>
  );
}
