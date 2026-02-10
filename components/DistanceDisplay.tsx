'use client';

import { useEffect, useState } from 'react';

interface DistanceDisplayProps {
    targetLat: number;
    targetLng: number;
}

export default function DistanceDisplay({ targetLat, targetLng }: DistanceDisplayProps) {
    const [distance, setDistance] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                const dist = calculateDistance(userLat, userLng, targetLat, targetLng);
                setDistance(dist.toFixed(1)); // Display with 1 decimal place
                setLoading(false);
            },
            (err) => {
                console.error("Error getting location:", err);
                setError('Unable to retrieve your location');
                setLoading(false);
            }
        );
    }, [targetLat, targetLng]);

    // Haversine formula to calculate distance in km
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    };

    const deg2rad = (deg: number) => {
        return deg * (Math.PI / 180);
    };

    if (loading) {
        return <span className="text-xs text-gray-400 animate-pulse">Calculating distance...</span>;
    }

    if (error) {
        return <span className="text-xs text-red-400" title={error}>Distance unavailable</span>;
    }

    return (
        <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-semibold text-sm">{distance} km away</span>
        </div>
    );
}
