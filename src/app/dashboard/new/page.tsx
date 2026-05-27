"use client";

import TripForm from "@/components/TripForm";
import TripResult from "@/components/TripResult";
import { generateId, saveTrip } from "@/lib/trips";
import { TripResponse } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewTripPage() {
  const [plan, setPlan] = useState<TripResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [tripId] = useState(() => generateId());
  const [formSnapshot, setFormSnapshot] = useState<Record<string, any> | null>(
    null,
  );
  const router = useRouter();

  const handlePlanTrip = async (formData: any) => {
    setIsLoading(true);
    setError(null);
    setSaveError(null);
    setFormSnapshot(formData);

    try {
      const response = await fetch("/api/plan-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate plan");
      }

      const data: TripResponse = await response.json();
      setPlan(data);

      // Save trip to MongoDB
      try {
        await saveTrip({
          id: tripId,
          destination: formData.destination || "",
          startLocation: formData.startLocation || "",
          dates: formData.dates || "",
          travelers: formData.travelers || "1",
          budget: formData.totalBudget || "Flexible",
          formData,
          plan: data,
          status: "generated",
          createdAt: new Date().toISOString(),
        });
      } catch (saveErr: any) {
        // Trip generated but save failed - inform user but show the itinerary
        setSaveError(
          "Trip generated but failed to save. Your plan is displayed below but not persisted. Please try again or contact support.",
        );
        console.error("Save error:", saveErr);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Error alerts */}
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
                    <p className="text-red-300 text-sm font-medium">
                      Generation failed
                    </p>
                    <p className="text-red-400/80 text-sm mt-0.5">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}
            {saveError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="max-w-2xl mx-auto mb-8"
              >
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-5 py-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-300 text-sm font-medium">
                      Warning
                    </p>
                    <p className="text-amber-400/80 text-sm mt-0.5">
                      {saveError}
                    </p>
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
                className="max-w-4xl mx-auto mb-8 flex items-center gap-3"
              >
                <button
                  onClick={() => router.push("/dashboard")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sub-foreground text-sm hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </button>
                <button
                  onClick={() => setPlan(null)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sub-foreground text-sm hover:bg-muted transition-colors"
                >
                  Plan Another Trip
                </button>
              </motion.div>
              <TripResult plan={plan} destination={formSnapshot?.destination} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
