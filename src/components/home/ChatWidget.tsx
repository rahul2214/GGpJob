"use client";

import { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle2, Sparkles } from 'lucide-react';

export function ChatWidget() {
    const [messages, setMessages] = useState([
        { sender: "employee", text: "Hey Rahul! I reviewed your resume. The project experience is great, but could you specify the cloud deployment details? That will help it stand out internally.", time: "10:14 AM" },
        { sender: "seeker", text: "Sure Rohan! I just updated my details on the onboarding page and uploaded the new resume version. Could you check it?", time: "10:16 AM" },
        { sender: "employee", text: "Perfect, this version is excellent. I am submitting it internally right now and will upload the screenshot proof. Let's discuss details once it is verified by the admin!", time: "10:18 AM" }
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
                "Awesome! I'll add that detail to the referral application right away.",
                "Got it! Let me sync with the internal hiring team and get back to you.",
                "Perfect. I'll notify you as soon as the status changes in the employee portal.",
                "That makes complete sense. Good luck, I'm rooting for you!"
            ];
            const randomReply = replies[Math.floor(Math.random() * replies.length)];
            setMessages(prev => [...prev, {
                sender: "employee",
                text: randomReply,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }, 1500);
    };

    // Auto-scroll chat to bottom when message or typing state updates
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    return (
        <section id="chat-showcase" aria-label="Direct In-App Chat Features" className="py-24 bg-white relative">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="grid lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Mock Chat Interface Visual */}
                    <div className="lg:col-span-6 bg-slate-950 rounded-[2.5rem] p-6 border border-slate-800 shadow-2xl relative order-last lg:order-first">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-[2.5rem] pointer-events-none" />
                        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                                    RK
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                                        Rohan K. <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-medium">Software Engineer II @ Google</p>
                                </div>
                            </div>
                            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5 animate-pulse" /> Interactive Demo Chat
                            </span>
                        </div>

                        <div 
                            ref={scrollContainerRef}
                            className="space-y-4 max-h-[300px] min-h-[250px] overflow-y-auto pr-1 scrollbar-thin"
                        >
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`p-3 rounded-2xl text-xs max-w-[85%] ${
                                    msg.sender === "seeker" 
                                        ? "bg-indigo-600/20 border border-indigo-500/20 text-indigo-200 ml-auto" 
                                        : "bg-white/5 border border-white/5 text-slate-200"
                                }`}>
                                    <span className="text-[9px] font-bold text-slate-400 block mb-1">
                                        {msg.sender === "seeker" ? `Rahul (Jobseeker) • ${msg.time}` : `Rohan K. • ${msg.time}`}
                                    </span>
                                    {msg.text}
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex gap-1.5 items-center p-1.5 text-slate-500 text-[10px] italic">
                                    <span className="animate-bounce">.</span>
                                    <span className="animate-bounce delay-100">.</span>
                                    <span className="animate-bounce delay-200">.</span>
                                    <span>Rohan is typing</span>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl p-2 mt-4">
                            <input 
                                type="text" 
                                value={inputVal}
                                onChange={(e) => setInputVal(e.target.value)}
                                placeholder="Type a message to test this demo chat..." 
                                className="bg-transparent border-none text-xs focus:outline-none focus:ring-0 text-white w-full px-2" 
                            />
                            <button type="submit" className="p-2 rounded-lg bg-indigo-600 text-white shadow-sm shrink-0 hover:bg-indigo-500 transition-colors">
                                <Send className="w-3.5 h-3.5" />
                            </button>
                        </form>
                    </div>

                    {/* Chat explanation Copy */}
                    <div className="lg:col-span-6 max-w-xl">
                      
                        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mt-4 mb-6 tracking-tight leading-tight">
                            Direct In-App Chat.<br />No Middlemen.
                        </h2>
                        <p className="text-base sm:text-lg text-slate-600 mb-6 leading-relaxed">
                            Cut out recruiters' email silos and phone delays. Once an application is unlocked or direct screening starts, jobseekers, employee referrers, and recruiters can chat directly inside our dedicated messaging engine.
                        </p>
                        <div className="space-y-4">
                            {[
                                { t: "Resume Optimization Tips", d: "Employees can guide you to format and align your CV to match company roles before submitting the referral." },
                                { t: "Interview Coordination", d: "Directly schedule screening calls, ask questions about company culture, or ask for guidance on target questions." },
                                { t: "Real-Time Tracking Alerts", d: "Get notified when a message is received, keeping both parties sync'd throughout the 8 stages." }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-3.5 items-start">
                                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-base leading-snug">{item.t}</h4>
                                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">{item.d}</p>
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
