"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
    MessageSquare, Send, X, ShieldAlert, Lock, 
    Clock, AlertCircle, Sparkles, MessageCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser } from '@/contexts/user-context';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase-client';

interface Message {
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
    is_system: boolean;
}

interface ChatSession {
    id: string;
    is_unlocked: boolean;
    msg_count_jobseeker: number;
    msg_count_employee: number;
    expires_at: string;
}

interface ChatDrawerProps {
    applicationId: string;
    isOpen: boolean;
    onClose: () => void;
    onUnlockRequest?: () => void;
    onMessageRead?: () => void;
}

export function ChatDrawer({ applicationId, isOpen, onClose, onUnlockRequest, onMessageRead }: ChatDrawerProps) {
    const { user } = useUser();
    const [messages, setMessages] = useState<Message[]>([]);
    const [session, setSession] = useState<ChatSession | null>(null);
    const [access, setAccess] = useState<{
        isFullAccess: boolean;
        isReferral: boolean;
        isPremium: boolean;
        statusId: number;
    } | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && applicationId) {
            fetchChat();
            
            // Subscribe to real-time messages
            const channel = supabase
                .channel(`chat_${applicationId}`)
                .on('postgres_changes', { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'messages' 
                }, (payload) => {
                    const newMsg = payload.new as Message;
                    setMessages(prev => [...prev, newMsg]);
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [isOpen, applicationId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchChat = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/chat/${applicationId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages);
                setSession(data.session);
                setAccess(data.access);

                // Mark notifications as read
                if (user?.uuid) {
                    fetch('/api/notifications', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            applicationId: applicationId,
                            userId: user.uuid
                        })
                    })
                    .then(() => {
                        if (onMessageRead) onMessageRead();
                    })
                    .catch(err => console.error("Failed to mark notifications as read", err));
                }
            }
        } catch (error) {
            console.error("Failed to fetch chat", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || isSending) return;

        setIsSending(true);
        try {
            const res = await fetch(`/api/chat/${applicationId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: user.uuid,
                    content: newMessage
                })
            });

            if (res.ok) {
                setNewMessage("");
                // Reload session to update counts
                fetchChat();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to send message");
            }
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    const isJobseeker = user?.role === 'Job Seeker';
    const msgCount = isJobseeker ? session?.msg_count_jobseeker : session?.msg_count_employee;
    const isFullAccess = access?.isFullAccess || false;
    const limitReached = !isFullAccess && (msgCount || 0) >= 3;
    const isExpired = access?.isReferral && session?.expires_at && new Date(session.expires_at) < new Date();

    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-white shadow-2xl z-[100] flex flex-col border-l transition-transform duration-300">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">
                            {access?.isReferral ? 'Referral Chat' : 'Job Application Chat'}
                        </h3>
                        {access?.isPremium && !access?.isReferral && (
                            <Badge className="bg-gradient-to-r from-amber-400 to-amber-600 text-white border-none text-[10px]">
                                <Sparkles className="w-3 h-3 mr-1" /> Premium Access
                            </Badge>
                        )}
                        {access?.isReferral && !isFullAccess && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 uppercase">
                                <Clock className="w-3 h-3" />
                                Expires in {session?.expires_at ? formatDistanceToNow(new Date(session.expires_at)) : '...'}
                            </div>
                        )}
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-5 h-5" />
                </Button>
            </div>

            {/* Info Banner */}
            {!isFullAccess && (
                <div className="bg-blue-50 p-3 px-4 flex items-start gap-3 border-b">
                    <ShieldAlert className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                        <span className="font-bold">Limited Mode:</span> Contact info and files are blocked. 
                        {isJobseeker 
                            ? (access?.isReferral ? ' Unlock referral' : ' Upgrade to Premium')
                            : (access?.isReferral ? ' Waiting for unlock' : ' Upgrade plan')
                        } for full access.
                    </p>
                </div>
            )}

            {/* Message Area */}
            <div className="flex-1 overflow-hidden relative">
                <ScrollArea className="h-full p-4" ref={scrollRef}>
                    <div className="space-y-4">
                        {messages.map((msg) => {
                            const isMe = msg.sender_id === user?.uuid;
                            return (
                                <div key={msg.id} className={cn(
                                    "flex flex-col max-w-[85%]",
                                    isMe ? "ml-auto items-end" : "mr-auto items-start"
                                )}>
                                    <div className={cn(
                                        "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                                        isMe 
                                            ? "bg-blue-600 text-white rounded-tr-none" 
                                            : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200"
                                    )}>
                                        {msg.content}
                                    </div>
                                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>

                {limitReached && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center p-6 text-center">
                        <div className="bg-white border-2 border-blue-100 shadow-xl rounded-2xl p-6 max-w-[300px]">
                            <Lock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                            <h4 className="font-bold text-slate-800 mb-2">Limit Reached</h4>
                            <p className="text-xs text-slate-500 mb-4">
                                {access?.isReferral 
                                    ? (isJobseeker 
                                        ? 'You have used all your pre-unlock messages. Unlock this referral to continue.' 
                                        : 'You have used all your pre-unlock messages. The candidate needs to unlock this referral for you to continue chatting.')
                                    : (isJobseeker
                                        ? 'You have reached the limit for free chat. Upgrade to Premium for unlimited access.'
                                        : 'You have reached the free chat limit for this candidate. Upgrade your plan for unlimited access.')}
                            </p>
                            {access?.isReferral ? (
                                isJobseeker ? (
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700 font-bold" onClick={onUnlockRequest}>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Unlock Referral
                                    </Button>
                                ) : (
                                    <Button disabled className="w-full bg-slate-200 text-slate-500 font-bold cursor-not-allowed">
                                        <Clock className="w-4 h-4 mr-2" />
                                        Waiting for Unlock
                                    </Button>
                                )
                            ) : (
                                <Button asChild className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 font-bold border-none cursor-pointer">
                                    <Link href={isJobseeker ? "/jobseeker/plans" : "/company/payment"}>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        {isJobseeker ? 'Go Premium' : 'Upgrade Plan'}
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-white">
                {!isFullAccess && (
                    <div className="flex justify-between items-center mb-2 px-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Messages: {msgCount || 0}/3
                        </span>
                        {(msgCount || 0) >= 2 && (
                            <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-700 border-amber-200 uppercase">
                                <AlertCircle className="w-2.5 h-2.5 mr-1" />
                                Limit nearly reached
                            </Badge>
                        )}
                    </div>
                )}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input 
                        placeholder={limitReached ? (isJobseeker ? "Limit reached..." : "Waiting for unlock...") : "Type a message..."}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={limitReached || isExpired || isSending}
                        className="rounded-xl border-slate-200"
                    />
                    <Button 
                        type="submit" 
                        size="icon" 
                        disabled={!newMessage.trim() || limitReached || isExpired || isSending}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 shrink-0"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
