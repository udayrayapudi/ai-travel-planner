'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TripForm from '@/components/TripForm';
import TripResult from '@/components/TripResult';
import Navbar from '@/components/Navbar';
import { TripResponse } from '@/lib/types';
import { Globe, ArrowLeft, AlertCircle } from 'lucide-react';

export default function Home() {
  const [plan, setPlan] = useState<TripResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlanTrip = async (formData: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate plan');
      }

      const data = await response.json();
      setPlan(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Header — only visible when showing results */}

          {/* Error alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="max-w-2xl mx-auto mb-8"
              >
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-300 text-sm font-medium">Something went wrong</p>
                    <p className="text-red-400/80 text-sm mt-0.5">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main content */}
          {!plan ? (
            <TripForm onSubmit={handlePlanTrip} isLoading={isLoading} />
          ) : (
            <div>
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto mb-8 flex items-center justify-between"
              >
                <button
                  onClick={() => setPlan(null)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sub-foreground text-sm hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Plan Another Trip
                </button>
              </motion.div>
              <TripResult plan={plan} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
