'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// Leaflet must be imported dynamically or checked for window, but react-leaflet handles some.
// However, the L.icon fix needs L which needs window.
import L from 'leaflet';
import { Button } from './ui/button';

// Only run this on client
if (typeof window !== 'undefined') {
    // Fix for default marker icon
    L.Marker.prototype.options.icon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
    });
}

interface MapPickerProps {
    initialLocation?: [number, number];
    onLocationSelect: (lat: number, lng: number) => void;
    onCancel: () => void;
}

function MapController() {
    const map = useMapEvents({});
    useEffect(() => {
        map.invalidateSize();
    }, [map]);
    return null;
}

function LocationMarker({ position, setPosition }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void }) {
    const map = useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position}>
            <Popup>Selected Location</Popup>
        </Marker>
    );
}

export default function MapPicker({ initialLocation, onLocationSelect, onCancel }: MapPickerProps) {
    const defaultCenter: [number, number] = initialLocation || [27.7172, 85.3240]; // Kathmandu
    const [position, setPosition] = useState<[number, number] | null>(initialLocation || null);

    const handleConfirm = () => {
        if (position) {
            onLocationSelect(position[0], position[1]);
        }
    };

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={onCancel}>
            <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 dark:bg-gray-700">
                    <h3 className="font-semibold text-lg">Pick Farm Location</h3>
                    <Button variant="ghost" size="sm" onClick={onCancel}>✕</Button>
                </div>

                <div className="flex-1 relative h-[400px] w-full bg-gray-100">
                    <MapContainer
                        center={defaultCenter}
                        zoom={13}
                        style={{ height: '400px', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker position={position} setPosition={setPosition} />
                        <MapController />
                    </MapContainer>
                </div>

                <div className="p-4 border-t bg-gray-50 dark:bg-gray-700 flex justify-end gap-3">
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button onClick={handleConfirm} disabled={!position}>
                        Set Location
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
}
