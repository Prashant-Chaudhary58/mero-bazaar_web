'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            router.push('/login');
            return;
        }

        try {
            const user = JSON.parse(userStr);
            // Allow if role is 'admin' OR if they have the isAdmin flag
            if (user.role !== 'admin' && !user.isAdmin) {
                router.push('/dashboard'); // Redirect non-admins
            } else {
                setAuthorized(true);
            }
        } catch (e) {
            router.push('/login');
        }
    }, [router]);

    if (!authorized) {
        return null; // or loading
    }

    return <>{children}</>;
}
