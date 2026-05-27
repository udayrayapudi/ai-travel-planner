"use client";

import TripCardImage from "@/components/TripCardImage";
import { deleteTrip, getTrips, SavedTrip } from "@/lib/trips";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Eye,
  MapPin,
  Plane,
  PlusCircle,
  Sparkles,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    getTrips().then(setTrips);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      await deleteTrip(id);
      const updated = await getTrips();
      setTrips(updated);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete trip";
      setError(message);
    }
  };

  if (!mounted) return null;

  return (
    <div className="p-6 lg:p-10">
      {/* Error alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto mb-6"
        >
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-start justify-between">
            <p className="text-red-300 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">My Trips</h1>
          <p className="text-muted-foreground text-sm">
            {trips.length === 0
              ? "No trips yet. Create your first AI-powered travel plan!"
              : `${trips.length} trip${trips.length !== 1 ? "s" : ""} planned`}
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/new")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          Add Trip
        </button>
      </div>

      {/* Empty state */}
      {trips.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-muted border border-border flex items-center justify-center mb-6">
            <Plane className="w-10 h-10 text-faint-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No trips planned yet
          </h2>
          <p className="text-muted-foreground text-sm max-w-sm mb-8">
            Start by adding a new trip. Our AI will craft a detailed,
            personalized itinerary for your adventure.
          </p>
          <button
            onClick={() => router.push("/dashboard/new")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
          >
            <Sparkles className="w-4 h-4" />
            Plan Your First Trip
          </button>
        </motion.div>
      )}

      {/* Trip cards grid */}
      {trips.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence>
            {trips.map((trip, i) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-muted-foreground/30 transition-all"
              >
                {/* Card header with destination photo */}
                <div className="h-36 relative overflow-hidden">
                  <TripCardImage
                    destination={trip.destination || ""}
                    width={600}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
                  {/* Status badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium backdrop-blur-sm ${
                        trip.status === "generated"
                          ? "bg-green-500/15 text-green-400 border border-green-500/20"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {trip.status === "generated" ? "Generated" : "Planning"}
                    </span>
                  </div>
                  {/* Destination name on image */}
                  <div className="absolute bottom-3 left-5">
                    <h3 className="text-lg font-semibold text-white drop-shadow-lg truncate">
                      {trip.destination || "Untitled Trip"}
                    </h3>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5">
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 text-faint-foreground" />
                      <span className="truncate">
                        From {trip.startLocation || "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 text-faint-foreground" />
                      <span className="truncate">
                        {trip.dates || "No dates set"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-3.5 h-3.5 text-faint-foreground" />
                      <span>
                        {trip.travelers || "1"} traveler
                        {trip.travelers !== "1" ? "s" : ""}
                      </span>
                    </div>
                    {trip.budget && trip.budget !== "Flexible" && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Wallet className="w-3.5 h-3.5 text-faint-foreground" />
                        <span>{trip.budget}</span>
                      </div>
                    )}
                  </div>

                  {/* Card actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/dashboard/trip/${trip.id}`)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium hover:bg-indigo-600/20 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(trip.id)}
                      className="p-2 rounded-xl border border-border text-muted-foreground hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="px-5 pb-4">
                  <p className="text-xs text-faint-foreground">
                    Created{" "}
                    {new Date(trip.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
