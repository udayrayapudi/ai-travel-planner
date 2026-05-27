'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  RefreshCw, Sparkles, MapPin, Calendar, Loader2,
  ArrowRight, ChevronDown, MessageSquare
} from 'lucide-react';
import { getTrips, saveTrip, SavedTrip } from '@/lib/trips';

export default function RefinePlanPage() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [refinement, setRefinement] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    getTrips().then((allTrips) => {
      const generated = allTrips.filter((t) => t.status === 'generated');
      setTrips(generated);
      if (generated.length > 0) setSelectedTripId(generated[0].id);
    });
  }, []);

  const selectedTrip = trips.find((t) => t.id === selectedTripId);

  const handleRefine = async () => {
    if (!selectedTrip || !refinement.trim()) return;
    setIsRefining(true);
    setResult(null);
    try {
      const response = await fetch('/api/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...selectedTrip.formData,
          refinement: refinement,
        }),
      });

      if (!response.ok) throw new Error('Failed to refine plan');

      const data = await response.json();

      // Update the saved trip
      await saveTrip({
        ...selectedTrip,
        plan: data,
      });

      setResult('Plan refined successfully! View the updated trip to see changes.');
      const allTrips = await getTrips();
      setTrips(allTrips.filter((t) => t.status === 'generated'));
    } catch (err: any) {
      setResult(`Error: ${err.message}`);
    } finally {
      setIsRefining(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Refine Plan</h1>
        </div>
        <p className="text-muted-foreground text-sm">Modify and improve your existing travel plans with AI assistance.</p>
      </motion.div>

      {trips.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-10 text-center"
        >
          <RefreshCw className="w-10 h-10 text-faint-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">No plans to refine</h2>
          <p className="text-muted-foreground text-sm mb-6">Generate a trip plan first, then come back to refine it.</p>
          <button
            onClick={() => router.push('/dashboard/new')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Create a Trip
          </button>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Select trip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <label className="block text-sm font-medium text-sub-foreground mb-3">Select a trip to refine</label>
            <div className="relative">
              <select
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer pr-10"
              >
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.destination} — {t.dates}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            {selectedTrip && (
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-faint-foreground" />
                  {selectedTrip.startLocation} → {selectedTrip.destination}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-faint-foreground" />
                  {selectedTrip.dates}
                </span>
              </div>
            )}
          </motion.div>

          {/* Refinement input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <label className="block text-sm font-medium text-sub-foreground mb-3">
              What would you like to change or improve?
            </label>
            <div className="space-y-3">
              {/* Quick suggestion chips */}
              <div className="flex flex-wrap gap-2">
                {[
                  'Make it more budget-friendly',
                  'Add more adventure activities',
                  'Include more local food spots',
                  'Adjust for rainy weather',
                  'Add a rest day',
                  'Include nightlife options',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setRefinement(suggestion)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                      refinement === suggestion
                        ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400'
                        : 'border-border text-muted-foreground hover:border-muted-foreground hover:text-sub-foreground'
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <textarea
                value={refinement}
                onChange={(e) => setRefinement(e.target.value)}
                placeholder="e.g., I want to spend less on accommodation and more on experiences. Also, can you add a day trip to nearby mountains?"
                rows={4}
                className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />

              <button
                onClick={handleRefine}
                disabled={isRefining || !refinement.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
              >
                {isRefining ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Refining...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Refine Plan
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Result message */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl px-5 py-4 flex items-start gap-3 ${
                result.startsWith('Error')
                  ? 'bg-red-500/10 border border-red-500/20'
                  : 'bg-green-500/10 border border-green-500/20'
              }`}
            >
              <MessageSquare className={`w-5 h-5 shrink-0 mt-0.5 ${
                result.startsWith('Error') ? 'text-red-400' : 'text-green-400'
              }`} />
              <div>
                <p className={`text-sm ${result.startsWith('Error') ? 'text-red-300' : 'text-green-300'}`}>
                  {result}
                </p>
                {!result.startsWith('Error') && selectedTrip && (
                  <button
                    onClick={() => router.push(`/dashboard/trip/${selectedTrip.id}`)}
                    className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 mt-2 transition-colors"
                  >
                    View updated trip <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
