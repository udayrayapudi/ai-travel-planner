'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import TripResult from '@/components/TripResult';
import { getTripById, SavedTrip } from '@/lib/trips';
import { useDestinationPhoto } from '@/hooks/useDestinationPhoto';
import { ArrowLeft, MapPin, Calendar, Users, Wallet } from 'lucide-react';

export default function ViewTripPage() {
  const params = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState<SavedTrip | null>(null);
  const [mounted, setMounted] = useState(false);
  const heroPhoto = useDestinationPhoto(trip?.destination || '', 1200);

  useEffect(() => {
    setMounted(true);
    const id = params.id as string;
    getTripById(id).then((found) => {
      if (found) setTrip(found);
    });
  }, [params.id]);

  if (!mounted) return null;

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">Trip not found</h2>
        <p className="text-muted-foreground text-sm mb-6">This trip may have been deleted.</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sub-foreground text-sm hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      {/* Back button + Trip info header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sub-foreground text-sm hover:bg-muted transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Destination hero photo */}
          <div className="h-48 md:h-56 relative overflow-hidden">
            <img
              src={heroPhoto}
              alt={trip.destination || 'Destination'}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
            <div className="absolute bottom-5 left-6">
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">{trip.destination}</h1>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-faint-foreground" />
              From {trip.startLocation}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 text-faint-foreground" />
              {trip.dates}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-3.5 h-3.5 text-faint-foreground" />
              {trip.travelers} traveler{trip.travelers !== '1' ? 's' : ''}
            </div>
            {trip.budget && trip.budget !== 'Flexible' && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wallet className="w-3.5 h-3.5 text-faint-foreground" />
                {trip.budget}
              </div>
            )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Trip result */}
      {trip.plan ? (
        <TripResult plan={trip.plan} destination={trip.destination} showHero={false} />
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">This trip hasn&apos;t been generated yet.</p>
        </div>
      )}
    </div>
  );
}
