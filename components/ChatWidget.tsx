"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Phone, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";

interface User {
    _id: string;
    fullName: string;
    image: string;
}

interface Message {
    _id: string;
    chat: string;
    sender: User | string;
    text: string;
    createdAt: string;
}

interface Chat {
    _id: string;
    otherParticipant: User;
    lastMessage?: Message;
    updatedAt: string;
}

interface ChatWidgetProps {
    currentUser: User | null;
    receiverId?: string; // If provided, opens chat with this user specifically
    isOpen: boolean;
    onClose: () => void;
    onOpen: () => void;
}

export default function ChatWidget({ currentUser, receiverId, isOpen, onClose, onOpen }: ChatWidgetProps) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [activeChat, setActiveChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [chats, setChats] = useState<Chat[]>([]);
    const [loadingChats, setLoadingChats] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Initialize Socket
    useEffect(() => {
        if (!currentUser) return;

        const newSocket = io("http://localhost:5001");
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [currentUser]);

    // Socket Event Listeners
    useEffect(() => {
        if (!socket || !currentUser) return;

        socket.emit("addNewUser", currentUser._id);

        socket.on("getMessage", (message: Message) => {
            // If chat is open with sender, add message
            if (activeChat && (
                (typeof message.sender === 'string' && activeChat.otherParticipant._id === message.sender) ||
                (typeof message.sender === 'object' && activeChat.otherParticipant._id === message.sender._id)
            )) {
                setMessages((prev) => [...prev, message]);
            } else {
                // Refresh chats list to show unread/latest
                fetchChats();
                toast("New message received!");
            }
        });

        return () => {
            socket.off("getMessage");
        };
    }, [socket, currentUser, activeChat]);

    // Fetch Chats
    const fetchChats = async () => {
        try {
            setLoadingChats(true);
            const res = await api.get("/api/v1/chats");
            setChats(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingChats(false);
        }
    };

    useEffect(() => {
        if (currentUser && isOpen) {
            fetchChats();
        }
    }, [currentUser, isOpen]);

    // Initialize specific chat if receiverId provided
    useEffect(() => {
        const initChat = async () => {
            if (currentUser && receiverId && isOpen) {
                try {
                    const res = await api.post("/api/v1/chats", { receiverId });
                    setActiveChat(res.data.data);
                    fetchMessages(res.data.data._id);
                } catch (err) {
                    console.error(err);
                    toast.error("Failed to start chat");
                }
            }
        };
        initChat();
    }, [currentUser, receiverId, isOpen]);

    // Fetch Messages
    const fetchMessages = async (chatId: string) => {
        try {
            const res = await api.get(`/api/v1/chats/${chatId}/messages`);
            setMessages(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    // Scroll to bottom
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Send Message
    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !activeChat || !currentUser || !socket) return;

        try {
            const res = await api.post(`/api/v1/chats/${activeChat._id}/messages`, {
                text: newMessage,
            });

            // Emit socket event
            socket.emit("sendMessage", {
                senderId: currentUser._id,
                recipientId: activeChat.otherParticipant._id,
                text: newMessage,
                chatId: activeChat._id,
                createdAt: new Date().toISOString(),
            });

            setMessages([...messages, res.data.data]);
            setNewMessage("");
            fetchChats(); // Update last message in list
        } catch (err) {
            console.error(err);
            toast.error("Failed to send message");
        }
    };

    if (!currentUser) return null;

    if (!isOpen) {
        return (
            <button
                onClick={onOpen}
                className="fixed bottom-4 right-4 z-50 p-4 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-110 flex items-center justify-center"
            >
                <MessageCircle size={24} />
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden max-h-[600px] h-[500px]">

            {/* Header */}
            <div className="bg-primary p-3 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                    {activeChat ? (
                        <>
                            <button onClick={() => setActiveChat(null)} className="mr-1 hover:bg-white/20 rounded p-1">←</button>
                            <img
                                src={activeChat.otherParticipant.image !== 'no-photo.jpg' && activeChat.otherParticipant.image
                                    ? (activeChat.otherParticipant.image.startsWith('http') ? activeChat.otherParticipant.image : `http://localhost:5001/uploads/users/${activeChat.otherParticipant.image}`)
                                    : "https://via.placeholder.com/40"}
                                alt="Avatar"
                                className="w-8 h-8 rounded-full border border-white/50 object-cover"
                            />
                            <span className="font-semibold truncate w-32">{activeChat.otherParticipant.fullName}</span>
                        </>
                    ) : (
                        <span className="font-semibold flex items-center gap-2"><MessageCircle size={18} /> Messages</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {activeChat && (
                        <a href={`tel:${(activeChat.otherParticipant as any).phone || ''}`} className="p-1 hover:bg-white/20 rounded-full" title="Call">
                            <Phone size={18} />
                        </a>
                    )}
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-900">
                {activeChat ? (
                    // Messages View
                    <div className="space-y-3">
                        {messages.length === 0 ? (
                            <div className="text-center text-gray-400 text-sm mt-10">Start the conversation...</div>
                        ) : (
                            messages.map((msg, idx) => {
                                const isMe = (typeof msg.sender === 'string' ? msg.sender : msg.sender._id) === currentUser._id;
                                return (
                                    <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${isMe
                                            ? "bg-primary text-white rounded-br-none"
                                            : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-bl-none"
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                        <div ref={scrollRef}></div>
                    </div>
                ) : (
                    // Chat List View
                    <div className="space-y-1">
                        {loadingChats ? (
                            <div className="text-center p-4">Loading...</div>
                        ) : chats.length === 0 ? (
                            <div className="text-center text-gray-400 text-sm mt-10">No messages yet.</div>
                        ) : (
                            chats.map(chat => (
                                <div
                                    key={chat._id}
                                    onClick={() => { setActiveChat(chat); fetchMessages(chat._id); }}
                                    className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer transition-colors"
                                >
                                    <img
                                        src={chat.otherParticipant.image !== 'no-photo.jpg' && chat.otherParticipant.image
                                            ? (chat.otherParticipant.image.startsWith('http') ? chat.otherParticipant.image : `http://localhost:5001/uploads/users/${chat.otherParticipant.image}`)
                                            : "https://via.placeholder.com/40"}
                                        alt="Avatar"
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div className="flex-1 overflow-hidden">
                                        <div className="font-semibold text-sm truncate">{chat.otherParticipant.fullName}</div>
                                        <div className="text-xs text-gray-500 truncate">
                                            {chat.lastMessage ? chat.lastMessage.text : "Draft"}
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-gray-400">
                                        {new Date(chat.updatedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Footer / Input */}
            {activeChat && (
                <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                        <Send size={18} />
                    </Button>
                </form>
            )}
        </div>
    );
}
