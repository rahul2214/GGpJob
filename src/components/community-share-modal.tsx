"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Share2, Copy, Check, ExternalLink, Send, Linkedin, Twitter, Facebook } from "lucide-react";

interface CommunityShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: {
    title: string;
    content?: string;
    communityId: number;
    postId: number | string;
  } | null;
}

export function CommunityShareModal({ open, onOpenChange, post }: CommunityShareModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!post) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.jobsdart.in";
  const postUrl = `${origin}/communities/${post.communityId}/posts/${post.postId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      toast({
        title: "✓ Link Copied!",
        description: "Post URL has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (typeof window !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.title,
          url: postUrl,
        });
      } catch (err: any) {
        if (err.name !== "AbortError") {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: Send,
      color: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20",
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + "\n" + postUrl)}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
    },
    {
      name: "X (Twitter)",
      icon: Twitter,
      color: "bg-slate-900 hover:bg-black text-white shadow-slate-900/20 dark:bg-slate-800 dark:hover:bg-slate-700",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(postUrl)}`,
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-950 rounded-[2rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-900 shadow-2xl">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Share2 className="w-6 h-6 text-indigo-600" />
            Share Discussion
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 leading-relaxed mt-1">
            Spread the word or share this post with your professional network.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Post preview snippet */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{post.title}</h4>
            {post.content && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2 mt-0.5">{post.content}</p>
            )}
          </div>

          {/* Direct Link Input + Copy Button */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Post Link</label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={postUrl}
                className="h-11 text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200/80 dark:border-slate-800"
              />
              <Button
                type="button"
                onClick={handleCopy}
                className="h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 shadow-md shadow-indigo-500/20"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1.5" /> Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Social Media Quick Share Grid */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Share to Socials</label>
            <div className="grid grid-cols-2 gap-2.5">
              {shareLinks.map((item) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2 h-11 px-3 rounded-xl font-bold text-xs transition-all shadow-sm ${item.color}`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.name}</span>
                    <ExternalLink className="w-3 h-3 opacity-60 ml-auto" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Native Mobile Share Button */}
          {typeof window !== "undefined" && typeof navigator !== "undefined" && "share" in navigator && (
            <Button
              type="button"
              variant="outline"
              onClick={handleNativeShare}
              className="w-full h-11 rounded-xl font-bold text-xs uppercase text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              <Share2 className="w-4 h-4 mr-2 text-indigo-600" />
              More Share Options
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
