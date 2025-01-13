'use client';
import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapsProps {
  address: {
    city: string;
    district: string;
    neighborhood: string;
    street: string;
  };
}

export function GoogleMaps({ address }: GoogleMapsProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      version: "weekly",
    });

    loader.load().then(() => {
      if (mapRef.current && !map) {
        const initialMap = new google.maps.Map(mapRef.current, {
          center: { lat: 41.0082, lng: 28.9784 }, // İstanbul merkezi
          zoom: 13,
        });
        setMap(initialMap);
      }
    });
  }, [map]);

  useEffect(() => {
    if (!map) return;

    const { city, district, neighborhood, street } = address;
    
    // Tüm adres bilgilerinin dolu olduğunu kontrol et
    if (!city || !district || !neighborhood || !street) {
      return;
    }

    const searchAddress = `${street} ${neighborhood} ${district} ${city} Turkey`;
    console.log('Searching address:', searchAddress);
    
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { address: searchAddress },
      (
        results: google.maps.GeocoderResult[] | null,
        status: google.maps.GeocoderStatus
      ) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const location = results[0].geometry.location;
          
          map.setCenter(location);
          map.setZoom(17);

          if (marker) {
            marker.setMap(null);
          }

          const newMarker = new google.maps.Marker({
            map,
            position: location,
            animation: google.maps.Animation.DROP,
          });

          setMarker(newMarker);
        }
      }
    );
  }, [address.city, address.district, address.neighborhood, address.street, map]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        minHeight: '400px',
        borderRadius: '0.5rem',
        overflow: 'hidden'
      }} 
    />
  );
} 