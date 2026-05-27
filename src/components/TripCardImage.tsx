'use client';

import { useDestinationPhoto } from '@/hooks/useDestinationPhoto';

interface TripCardImageProps {
  destination: string;
  width?: number;
  className?: string;
}

export default function TripCardImage({ destination, width = 600, className = '' }: TripCardImageProps) {
  const photoUrl = useDestinationPhoto(destination, width);
  return (
    <img
      src={photoUrl}
      alt={destination || 'Destination'}
      className={className}
    />
  );
}
