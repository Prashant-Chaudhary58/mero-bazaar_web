'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        // Simple check: if user exists in localStorage (since we can't easily check HTTP-only cookie in client)
        // Ideally we would fetch /api/v1/auth/me here, but for now mimicking previous behavior
        const user = localStorage.getItem('user');
        if (!user) {
            router.push('/login');
        } else {
            setAuthorized(true);
        }
    }, [router]);

    if (!authorized) {
        return null; // or a loading spinner
    }

    return <>{children}</>;
}
