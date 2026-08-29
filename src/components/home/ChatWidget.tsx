"use client";

import { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ChatWidget() {
    const [messages, setMessages] = useState([
        { sender: "employee", text: "Hey Rahul! I reviewed your application. Your full-stack experience is great! Could you share your availability for a quick screening call?", time: "10:14 AM" },
        { sender: "seeker", text: "Hi Rohan! Thanks for reaching out. I'm available tomorrow afternoon or Friday morning. I also updated my resume on the portal.", time: "10:16 AM" },
        { sender: "employee", text: "Great! I've logged your interview request in our recruitment portal and shared your profile with our engineering team manager.", time: "10:18 AM" }
    ]);
    const [inputVal, setInputVal] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputVal.trim()) return;
        
        const newMsg = { 
            sender: "seeker", 
            text: inputVal.trim(), 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        };
        setMessages(prev => [...prev, newMsg]);
        setInputVal("");
        setIsTyping(true);
        
        setTimeout(() => {
            setIsTyping(false);
            const replies = [
                "Awesome! I've added that to your candidate profile right away.",
                "Got it! Let me sync with the hiring manager and send over an invite.",
                "Perfect. I'll notify you as soon as the team reviews your update.",
                "Sounds great! Looking forward to our call."
            ];
            const randomReply = replies[Math.floor(Math.random() * replies.length)];
            setMessages(prev => [...prev, {
                sender: "employee",
                text: randomReply,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }, 1500);
    };

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    return (
        <section id="chat-showcase" aria-label="Direct In-App Chat Features" className="py-24 relative overflow-hidden bg-slate-50 dark:bg-[hsl(220_65%_8%)] transition-colors duration-300">
            <div className="absolute top-1/4 left-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-10 w-96 h-96  pointer-events-none" />

            <div className="container-xl relative z-10">
                <div className="grid lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Mock Chat Interface Visual */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: "easeOut" as any }}
                        className="lg:col-span-6 bg-slate-900 text-white rounded-[2.5rem] p-6 border border-slate-800 dark:border-white/10 shadow-2xl relative order-last lg:order-first backdrop-blur-md"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent rounded-[2.5rem] pointer-events-none" />
                        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-xs shadow-md">
                                    RK
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                                        Rohan K. <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-medium">Talent Acquisition Lead @ Google</p>
                                </div>
                            </div>
                            <span className="bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[9px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5 animate-pulse text-violet-450" /> Live Chat
                            </span>
                        </div>

                        <div 
                            ref={scrollContainerRef}
                            className="space-y-4 h-[300px] overflow-y-auto pr-1"
                        >
                            <AnimatePresence initial={false}>
                                {messages.map((msg, idx) => (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.3, ease: "easeOut" as any }}
                                        className={`p-3 rounded-2xl text-xs max-w-[85%] ${
                                            msg.sender === "seeker" 
                                                ? "bg-violet-600/30 border border-violet-500/30 text-violet-100 ml-auto" 
                                                : "bg-white/10 border border-white/10 text-slate-200 mr-auto"
                                        }`}
                                    >
                                        <p className="leading-relaxed">{msg.text}</p>
                                        <span className="text-[9px] text-slate-400 mt-1 block text-right">{msg.time}</span>
                                    </motion.div>
                                ))}
                                {isTyping && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="bg-white/10 border border-white/10 rounded-2xl p-3 text-xs text-slate-400 flex items-center gap-2 w-max"
                                    >
                                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" />
                                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <form onSubmit={handleSendMessage} className="mt-4 pt-4 border-t border-white/10 flex gap-2">
                            <input
                                type="text"
                                placeholder="Type a message to recruiter..."
                                value={inputVal}
                                onChange={e => setInputVal(e.target.value)}
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                            />
                            <button 
                                type="submit"
                                className="bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-4 flex items-center justify-center transition-colors shadow-md"
                            >
                                <Send className="w-3.5 h-3.5" />
                            </button>
                        </form>
                    </motion.div>

                    {/* Right side: Chat features info */}
                    <div className="lg:col-span-6 space-y-6">
                        <h2 className="section-heading">
                            Communicate Directly with <span className="text-gradient-primary">Hiring Recruiters</span>
                        </h2>
                        <p className="section-subheading">
                            Connect with recruiters in real-time, ask questions about active roles, and get updates directly through our secure messaging portal.
                        </p>

                        <div className="space-y-4 pt-4">
                            {[
                                { title: "Team Specific Insights", desc: "Understand role expectations, team structure, and technologies before your interview." },
                                { title: "Transparent Application Progress", desc: "No more silent rejections. Track every step of your application with real-time status updates." },
                                { title: "Verified Recruiter Chat", desc: "All recruiter profiles and job posts are authenticated for maximum trust." }
                            ].map((feat, idx) => (
                                <div key={idx} className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold shrink-0 mt-0.5">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{feat.title}</h4>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{feat.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
