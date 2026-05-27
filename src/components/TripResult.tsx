'use client';
import { motion } from 'framer-motion';
import {
  CheckCircle, AlertTriangle, XCircle,
  Sun, DollarSign, Calendar, Camera, Utensils,
  Shield, Gem, Eye, MapPin, Star, Luggage, ChevronRight,
  Shirt, FileText, Dumbbell, CalendarClock, Hotel, ExternalLink,
  Info, Sparkles
} from 'lucide-react';
import { TripResponse } from '@/lib/types';
import { useDestinationPhoto } from '@/hooks/useDestinationPhoto';

interface TripResultProps {
  plan: TripResponse;
  destination?: string;
  showHero?: boolean;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' as const },
  }),
};

function SectionCard({ children, index = 0 }: { children: React.ReactNode; index?: number }) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="bg-card/60 border border-border rounded-2xl p-6 md:p-8"
    >
      {children}
    </motion.div>
  );
}

function Badge({ label, variant }: { label: string; variant: 'green' | 'yellow' | 'red' }) {
  const colors = {
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    yellow: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  const icons = {
    green: <CheckCircle className="w-4 h-4" />,
    yellow: <AlertTriangle className="w-4 h-4" />,
    red: <XCircle className="w-4 h-4" />,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${colors[variant]}`}>
      {icons[variant]} {label}
    </span>
  );
}

// Safely coerce any value into a string array for rendering
function toArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === 'string') return [val];
  if (val && typeof val === 'object') {
    // Handle { "1": "...", "2": "..." } or named-key objects
    return Object.values(val).map(String);
  }
  return [];
}

// Parse text containing Google Maps URLs and render them as clickable links
function renderWithLinks(text: string | undefined): React.ReactNode {
  if (!text) return null;
  const urlRegex = /(https?:\/\/(?:www\.)?google\.com\/maps[^\s)]*)/gi;
  const parts = text.split(urlRegex);
  if (parts.length === 1) return renderBold(text);
  return parts.map((part, i) =>
    urlRegex.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 underline underline-offset-2 break-all">
        <MapPin className="w-3 h-3 shrink-0" />View on Maps
      </a>
    ) : (
      <span key={i}>{renderBold(part)}</span>
    )
  );
}

// Render **bold** markdown as <strong> elements
function renderBold(text: string): React.ReactNode {
  const boldRegex = /\*\*(.+?)\*\*/g;
  const parts = text.split(boldRegex);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="text-foreground font-semibold">{part}</strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function TripResult({ plan, destination, showHero = true }: TripResultProps) {
  if (!plan) return null;

  const verdictVariant = plan.verdict?.status === 'GOOD' ? 'green' : plan.verdict?.status === 'CONDITIONAL' ? 'yellow' : 'red';
  const destName = destination || plan.input_summary?.destination || '';
  const heroPhoto = useDestinationPhoto(destName, 1200);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">

      {/* Destination Hero Photo */}
      {showHero && destName && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative h-52 md:h-64 rounded-2xl overflow-hidden"
        >
          <img
            src={heroPhoto}
            alt={destName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#09090b] via-[#09090b]/40 to-transparent" />
          <div className="absolute bottom-5 left-6">
            <p className="text-xs text-indigo-300 font-medium uppercase tracking-wider mb-1">Your Destination</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">{destName}</h2>
          </div>
        </motion.div>
      )}

      {/* Verdict */}
      <SectionCard index={0}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <h2 className="text-2xl font-bold text-foreground">Trip Verdict</h2>
          <Badge label={plan.verdict?.status} variant={verdictVariant} />
        </div>
        <p className="text-sub-foreground leading-relaxed">{plan.verdict?.reasoning}</p>
        {plan.verdict?.required_changes && (
          <div className="mt-4 p-4 bg-red-500/5 border border-red-500/20 rounded-xl text-red-300 text-sm">
            <strong className="text-red-400">Required Changes:</strong> {plan.verdict.required_changes}
          </div>
        )}
      </SectionCard>

      {/* Trip Highlights */}
      <div id="highlights">
        <SectionCard index={1}>
          <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Info className="w-5 h-5 text-indigo-400" /> Trip Highlights
          </h2>
          {plan.trip_highlights?.title && (
            <h3 className="text-xl font-bold text-foreground mb-4">{plan.trip_highlights.title}</h3>
          )}
          {plan.trip_highlights?.narrative ? (
            <div className="space-y-4">
              {plan.trip_highlights.narrative.split('\n').filter(Boolean).map((para, i) => (
                <p key={i} className="text-sub-foreground text-[15px] leading-relaxed">{renderBold(para)}</p>
              ))}
            </div>
          ) : (
            /* Fallback: auto-generate a narrative from itinerary data */
            <div className="space-y-4">
              {(Array.isArray(plan.itinerary) ? plan.itinerary : []).map((day, i) => (
                <p key={i} className="text-sub-foreground text-[15px] leading-relaxed">
                  {day.narrative ? renderBold(day.narrative) : (
                    <>
                      <strong className="text-foreground font-semibold">Day {day.day}:</strong>{' '}
                      {day.morning} {day.afternoon} {day.evening}
                    </>
                  )}
                </p>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Intelligence / Weather */}
      <div id="weather">
        <SectionCard index={2}>
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-400" /> Real-World Intelligence
          </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plan.intelligence && Object.entries(plan.intelligence).map(([key, value]) => (
            <div key={key} className="bg-muted/50 rounded-xl p-4 border border-border">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">{key.replace(/_/g, ' ')}</p>
              <p className="text-sm text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </SectionCard>
      </div>

      {/* Cost Analysis */}
      <div id="budget">
      <SectionCard index={3}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" /> Cost Reality Check
          </h2>
          <Badge
            label={plan.cost_analysis?.classification}
            variant={plan.cost_analysis?.classification === 'UNDER_BUDGET' ? 'green' : plan.cost_analysis?.classification === 'ON_EDGE' ? 'yellow' : 'red'}
          />
        </div>
        <div className="space-y-2">
          {plan.cost_analysis?.per_person_breakdown && Object.entries(plan.cost_analysis.per_person_breakdown).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center py-3 border-b border-border last:border-0">
              <span className="text-muted-foreground text-sm capitalize">{key.replace(/_/g, ' ')}</span>
              <span className="text-foreground font-medium text-sm">{value}</span>
            </div>
          ))}
        </div>
      </SectionCard>
      </div>

      {/* Trip Score */}
      {plan.trip_score && (
        <SectionCard index={3}>
          <div className="flex items-center gap-6">
            <div className="shrink-0 w-20 h-20 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-3xl font-bold text-white">{plan.trip_score.score}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" /> Trip Score
              </h2>
              <p className="text-muted-foreground text-sm mt-1">{plan.trip_score.explanation}</p>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Itinerary */}
      <div id="itinerary">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2"
        >
          <Calendar className="w-5 h-5 text-blue-400" /> Day-by-Day Itinerary
        </motion.h2>

        <div className="space-y-5">
          {(Array.isArray(plan.itinerary) ? plan.itinerary : []).map((day, i) => (
            <motion.div
              key={day.day}
              custom={i + 5}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="bg-card/60 border border-border rounded-2xl overflow-hidden"
            >
              {/* Day header */}
              <div className="bg-linear-to-r from-indigo-500/10 to-purple-500/10 border-b border-border px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-base">
                    {day.day}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Day {day.day}</h3>
                    {day.travel_time && (
                      <p className="text-xs text-muted-foreground">{day.travel_time}</p>
                    )}
                  </div>
                </div>
                {day.maps_link && (
                  <a
                    href={day.maps_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-1.5 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Maps
                  </a>
                )}
              </div>

              <div className="p-6 space-y-5">
                {/* Narrative description */}
                {day.narrative && (
                  <p className="text-sub-foreground text-[15px] leading-relaxed">
                    {renderBold(day.narrative)}
                  </p>
                )}

                {/* Timeline */}
                <div className="relative pl-6 border-l-2 border-border space-y-4">
                  {[
                    { label: 'Morning', value: day.morning, color: 'bg-amber-400', textColor: 'text-amber-400', icon: '🌅' },
                    { label: 'Afternoon', value: day.afternoon, color: 'bg-blue-400', textColor: 'text-blue-400', icon: '☀️' },
                    { label: 'Evening', value: day.evening, color: 'bg-purple-400', textColor: 'text-purple-400', icon: '🌙' },
                  ].map((slot) => (
                    <div key={slot.label} className="relative">
                      <div className={`absolute -left-[calc(1.5rem+5px)] top-1.5 w-2.5 h-2.5 rounded-full ${slot.color} ring-2 ring-background`} />
                      <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${slot.textColor}`}>{slot.label}</p>
                      <p className="text-sub-foreground text-sm leading-relaxed">{renderBold(slot.value || '')}</p>
                    </div>
                  ))}
                </div>

                {/* Info cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-border">
                  {day.food_recommendation && (
                    <div className="flex items-start gap-3 bg-muted/40 rounded-xl p-3.5 border border-border/40">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                        <Utensils className="w-4 h-4 text-orange-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Where to Eat</p>
                        <p className="text-sm text-sub-foreground leading-relaxed">{renderWithLinks(day.food_recommendation)}</p>
                      </div>
                    </div>
                  )}
                  {day.hotel_recommendation && (
                    <div className="flex items-start gap-3 bg-muted/40 rounded-xl p-3.5 border border-border/40">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                        <Hotel className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Where to Stay</p>
                        <p className="text-sm text-sub-foreground leading-relaxed">{renderWithLinks(day.hotel_recommendation)}</p>
                      </div>
                    </div>
                  )}
                  {day.best_photo_timing && (
                    <div className="flex items-start gap-3 bg-muted/40 rounded-xl p-3.5 border border-border/40">
                      <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center shrink-0">
                        <Camera className="w-4 h-4 text-pink-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Best Photo Timing</p>
                        <p className="text-sm text-sub-foreground leading-relaxed">{day.best_photo_timing}</p>
                      </div>
                    </div>
                  )}
                  {day.booking_strategy && (
                    <div className="flex items-start gap-3 bg-muted/40 rounded-xl p-3.5 border border-border/40">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Pro Tip</p>
                        <p className="text-sm text-sub-foreground leading-relaxed">{day.booking_strategy}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Experience Optimization */}
      <SectionCard index={10}>
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Gem className="w-5 h-5 text-purple-400" /> Experience Optimization
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3">Tourist Traps to Avoid</h3>
            <ul className="space-y-2">
              {toArray(plan.experience_optimization?.tourist_traps_to_avoid).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-sub-foreground">
                  <XCircle className="w-4 h-4 text-red-500/60 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3">Hidden Gems</h3>
            <ul className="space-y-2">
              {toArray(plan.experience_optimization?.hidden_gems).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-sub-foreground">
                  <Gem className="w-4 h-4 text-emerald-500/60 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">Best Viewpoints</h3>
            <ul className="space-y-2">
              {toArray(plan.experience_optimization?.best_viewpoints).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-sub-foreground">
                  <Eye className="w-4 h-4 text-blue-500/60 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">High Value Experiences</h3>
            <ul className="space-y-2">
              {toArray(plan.experience_optimization?.high_value_experiences).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-sub-foreground">
                  <Star className="w-4 h-4 text-amber-500/60 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionCard>

      {/* Risks & Packing */}
      <div id="packing" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard index={11}>
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-400" /> Risks & Backups
          </h2>
          <div className="space-y-3">
            {plan.risks_and_backups && (() => {
              const r = plan.risks_and_backups as any;
              // Handle array of { risk, mitigation } objects
              if (Array.isArray(r)) {
                return r.map((item: any, i: number) => (
                  <div key={i} className="bg-muted/50 rounded-xl p-4 border border-border">
                    <p className="text-sm font-medium text-orange-300 mb-1">{typeof item === 'string' ? item : item.risk}</p>
                    {typeof item !== 'string' && item.mitigation && (
                      <p className="text-xs text-muted-foreground">{item.mitigation}</p>
                    )}
                  </div>
                ));
              }
              // Handle object with named keys (e.g. weather_backup_activities, transport_delay_strategy)
              if (typeof r === 'object') {
                return Object.entries(r).map(([key, val]) => (
                  <div key={key} className="bg-muted/50 rounded-xl p-4 border border-border">
                    <p className="text-sm font-medium text-orange-300 mb-1 capitalize">{key.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground">{String(val)}</p>
                  </div>
                ));
              }
              return null;
            })()}
          </div>
        </SectionCard>

        <SectionCard index={12}>
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Luggage className="w-5 h-5 text-teal-400" /> Packing & Preparation
          </h2>
          <div className="space-y-4">
            {plan.packing_and_preparation && (() => {
              const p = plan.packing_and_preparation as any;
              const PACKING_FIELDS = [
                { key: 'weather_based_packing', key2: 'weather_based_packing_list', label: 'Weather-Based Packing', icon: Shirt, color: 'text-sky-400' },
                { key: 'documents_checklist', key2: 'documents', label: 'Documents Checklist', icon: FileText, color: 'text-amber-400' },
                { key: 'fitness_altitude_prep', key2: 'health_prep', label: 'Fitness & Altitude Prep', icon: Dumbbell, color: 'text-rose-400' },
                { key: 'pre_booking_timeline', label: 'Pre-Booking Timeline', icon: CalendarClock, color: 'text-indigo-400' },
              ];

              // Check if any named field exists
              const hasNamedFields = PACKING_FIELDS.some(({ key, key2 }) => p[key] || (key2 && p[key2]));

              if (hasNamedFields) {
                return PACKING_FIELDS.map(({ key, key2, label, icon: Icon, color }) => {
                  const raw = p[key] ?? (key2 ? p[key2] : undefined);
                  if (!raw) return null;
                  const items = typeof raw === 'string'
                    ? raw.split(',').map((s: string) => s.trim()).filter(Boolean)
                    : toArray(raw);
                  if (items.length === 0) return null;
                  return (
                    <div key={key} className="bg-muted/40 rounded-xl p-4 border border-border/40">
                      <div className="flex items-center gap-2 mb-2.5">
                        <Icon className={`w-4 h-4 ${color}`} />
                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
                      </div>
                      <ul className="space-y-1.5">
                        {items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-sub-foreground">
                            <ChevronRight className="w-3 h-3 mt-1 text-teal-500/60 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                });
              }

              // Fallback: render as plain key-value pairs for any shape
              if (Array.isArray(p)) {
                return p.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-sub-foreground">
                    <ChevronRight className="w-3 h-3 mt-1 text-teal-500/60 shrink-0" />
                    {typeof item === 'string' ? item : JSON.stringify(item)}
                  </div>
                ));
              }

              return Object.entries(p).map(([key, val]) => (
                <div key={key} className="bg-muted/40 rounded-xl p-4 border border-border/40">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2.5">
                    {key.replace(/_/g, ' ')}
                  </p>
                  <ul className="space-y-1.5">
                    {toArray(val).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-sub-foreground">
                        <ChevronRight className="w-3 h-3 mt-1 text-teal-500/60 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ));
            })()}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
