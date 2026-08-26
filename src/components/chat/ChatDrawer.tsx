"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    onMessageRead?: () => void;
}

export function ChatDrawer({ applicationId, isOpen, onClose, onMessageRead }: ChatDrawerProps) {
    const { user } = useUser();
    const [messages, setMessages] = useState<Message[]>([]);
    const [session, setSession] = useState<ChatSession | null>(null);
    const [access, setAccess] = useState<{
        isFullAccess: boolean;
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
                }, (payload: any) => {
                    fetchChat();
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
                            Job Application Chat
                        </h3>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-5 h-5" />
                </Button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-hidden relative">
                <ScrollArea className="h-full p-4" ref={scrollRef}>
                    <div className="space-y-4">
                        {messages.map((msg) => {
                            const isMe = msg.sender_id === user?.uuid;
                            return (
                                <div key={msg.id} className={cn(
                                    "flex flex-col max-w-[85%]",
                                    isMe ? "ml-auto items-end pl-6 pr-1" : "mr-auto items-start pr-6 pl-1"
                                )}>
                                    <div className={cn(
                                        "px-4 py-2.5 rounded-2xl text-sm shadow-sm break-words whitespace-pre-wrap",
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
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input 
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={isSending}
                        className="rounded-xl border-slate-200"
                    />
                    <Button 
                        type="submit" 
                        size="icon" 
                        disabled={!newMessage.trim() || isSending}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 shrink-0"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
