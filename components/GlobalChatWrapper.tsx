'use client';

import { useEffect, useState } from 'react';
import ChatWidget from './ChatWidget';
import api from '@/lib/axios';

interface User {
    _id: string;
    fullName: string;
    image: string;
}

export default function GlobalChatWrapper() {
    const [user, setUser] = useState<User | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Fetch fresh user data on mount
        const fetchUser = async () => {
            try {
                // Check localStorage first for speed to avoid flickering
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    try {
                        setUser(JSON.parse(storedUser));
                    } catch (e) {
                        console.error("Failed to parse stored user", e);
                    }
                }

                const response = await api.get('/api/v1/auth/me');
                if (response.data.success) {
                    setUser(response.data.data);
                    localStorage.setItem('user', JSON.stringify(response.data.data));
                }
            } catch (error) {
                // If auth fails/token expired, clear user
                console.log("Not logged in");
                setUser(null);
            }
        };

        fetchUser();

    }, []);

    // Listen for global chat open events
    const [targetReceiverId, setTargetReceiverId] = useState<string | undefined>(undefined);

    useEffect(() => {
        const handleOpenChat = (event: CustomEvent<{ receiverId?: string }>) => {
            if (event.detail?.receiverId) {
                setTargetReceiverId(event.detail.receiverId);
            }
            setIsOpen(true);
        };

        window.addEventListener('open-chat' as any, handleOpenChat as any);
        return () => {
            window.removeEventListener('open-chat' as any, handleOpenChat as any);
        };
    }, []);

    // If no user is logged in, don't show the chat widget
    if (!user) return null;

    return (
        <ChatWidget
            currentUser={user}
            receiverId={targetReceiverId}
            isOpen={isOpen}
            onClose={() => {
                setIsOpen(false);
                setTargetReceiverId(undefined);
            }}
            onOpen={() => setIsOpen(true)}
        />
    );
}
