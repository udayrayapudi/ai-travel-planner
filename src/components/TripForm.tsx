'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Globe, Calendar, Landmark, Mountain, Compass, Palmtree,
  TreePine, PartyPopper, Camera, ShoppingBag, Coffee,
  Bike, Wind, Snowflake, CloudSun, CloudRain, Sun,
  Star, Hotel, Home, Building2,
  Leaf, Wheat, CandlestickChart, CircleDot,
  Plane, TrainFront, Bus, Car,
  ChevronLeft, ChevronRight, Loader2, Sparkles,
  Check, Users, BadgeInfo, MessageCircle, Search,
  Plus, Minus
} from 'lucide-react';

/* ───────────── Types ───────────── */
interface TripFormProps {
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

interface ChipOption {
  label: string;
  icon: React.ReactNode;
}

/* ───────────── Popular locations data ───────────── */
// Small fallback shown instantly while CSV loads
const FALLBACK_LOCATIONS = [
  'Paris, France', 'London, United Kingdom', 'New York, USA', 'Tokyo, Japan',
  'Dubai, UAE', 'Singapore', 'Rome, Italy', 'Barcelona, Spain',
  'Bangkok, Thailand', 'Mumbai, India', 'Delhi, India', 'Bengaluru, India',
  'Hyderabad, India', 'Goa, India', 'Bali, Indonesia', 'Sydney, Australia',
];

/* ───────────── Step metadata (sidebar) ───────────── */
const STEP_META = [
  { title: 'Destination & Dates', desc: 'Set the Course, Own the Journey', sub: 'Define your dream destination and chart the perfect path to make it a reality.' },
  { title: 'Travel Preferences', desc: 'Tailor Your Adventure', sub: 'Pick your pace, weather, stay, food, and how you want to get there.' },
  { title: 'Budget & Travelers', desc: 'Trip Budget & Travel Companions', sub: 'Add the final touches with local gems and hidden treasures for an unforgettable experience.' },
  { title: 'Review & Generate', desc: 'Confirm Your Dream Trip', sub: 'Review everything and let our AI craft the perfect itinerary.' },
];

/* ───────────── Chip options ───────────── */
const TRAVEL_THEMES: ChipOption[] = [
  { label: 'Historical Sites & Landmarks', icon: <Landmark className="w-4 h-4" /> },
  { label: 'Adventure', icon: <Mountain className="w-4 h-4" /> },
  { label: 'Local Culture', icon: <Compass className="w-4 h-4" /> },
  { label: 'Beaches', icon: <Palmtree className="w-4 h-4" /> },
  { label: 'Hills, Nature & Wildlife', icon: <TreePine className="w-4 h-4" /> },
  { label: 'Nightlife', icon: <PartyPopper className="w-4 h-4" /> },
  { label: 'For the Gram', icon: <Camera className="w-4 h-4" /> },
  { label: 'Shopping & Relaxation', icon: <ShoppingBag className="w-4 h-4" /> },
];

const PACE_OPTIONS: ChipOption[] = [
  { label: 'Slow and Easy', icon: <Coffee className="w-4 h-4" /> },
  { label: 'Balanced', icon: <Sun className="w-4 h-4" /> },
  { label: 'Fast', icon: <Bike className="w-4 h-4" /> },
];

const WEATHER_OPTIONS: ChipOption[] = [
  { label: 'Warm and Sunny', icon: <Sun className="w-4 h-4" /> },
  { label: 'Cool and Breezy', icon: <Wind className="w-4 h-4" /> },
  { label: 'Cold and Snowy', icon: <Snowflake className="w-4 h-4" /> },
  { label: 'Mild and Pleasant', icon: <CloudSun className="w-4 h-4" /> },
  { label: 'Rainy and Cozy', icon: <CloudRain className="w-4 h-4" /> },
];

const ACCOMMODATION_OPTIONS: ChipOption[] = [
  { label: '3 Star', icon: <Star className="w-4 h-4" /> },
  { label: '4 Star', icon: <Star className="w-4 h-4" /> },
  { label: '5 Star', icon: <Star className="w-4 h-4" /> },
  { label: 'Airbnb', icon: <Home className="w-4 h-4" /> },
  { label: 'Homestay', icon: <Building2 className="w-4 h-4" /> },
  { label: 'Hostel', icon: <Hotel className="w-4 h-4" /> },
];

const FOOD_OPTIONS: ChipOption[] = [
  { label: 'Vegetarian', icon: <Leaf className="w-4 h-4" /> },
  { label: 'Vegan', icon: <TreePine className="w-4 h-4" /> },
  { label: 'Gluten Free', icon: <Wheat className="w-4 h-4" /> },
  { label: 'Halal', icon: <CandlestickChart className="w-4 h-4" /> },
  { label: 'Kosher', icon: <CircleDot className="w-4 h-4" /> },
  { label: 'Local Cuisine', icon: <CircleDot className="w-4 h-4" /> },
];

const TRANSPORT_OPTIONS: ChipOption[] = [
  { label: 'Flights', icon: <Plane className="w-4 h-4" /> },
  { label: 'Trains', icon: <TrainFront className="w-4 h-4" /> },
  { label: 'Buses', icon: <Bus className="w-4 h-4" /> },
  { label: 'Road', icon: <Car className="w-4 h-4" /> },
];

const TRAVELER_TYPE_OPTIONS: ChipOption[] = [
  { label: 'Solo', icon: <Users className="w-4 h-4" /> },
  { label: 'Couple', icon: <Users className="w-4 h-4" /> },
  { label: 'Family', icon: <Users className="w-4 h-4" /> },
  { label: 'Friends', icon: <Users className="w-4 h-4" /> },
  { label: 'Students', icon: <BadgeInfo className="w-4 h-4" /> },
  { label: 'Business', icon: <Building2 className="w-4 h-4" /> },
];

/* ───────────── Avatar speech per step ───────────── */
const AVATAR_MESSAGES = [
  "Hey there, traveler! \u{1F44B} Let's start with the basics — where are you headed and when?",
  "Awesome! Now let's fine-tune your vibe. Pick your travel preferences below.",
  "Almost there! Let's sort out budget, who's coming along, and any special requests.",
  "Here's everything you've told me. Looks great — ready to generate your dream itinerary?",
];

/* ───────────── Chip selector component ───────────── */
function ChipGroup({
  label,
  options,
  selected,
  onToggle,
  multi = false,
}: {
  label: string;
  options: ChipOption[];
  selected: string | string[];
  onToggle: (val: string) => void;
  multi?: boolean;
}) {
  const isSelected = (val: string) =>
    Array.isArray(selected) ? selected.includes(val) : selected === val;

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-sub-foreground mb-3">
        {label} <span className="text-faint-foreground">(Optional)</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => onToggle(opt.label)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all ${
              isSelected(opt.label)
                ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400'
                : 'border-border bg-input text-muted-foreground hover:border-muted-foreground hover:text-sub-foreground'
            }`}
          >
            {opt.icon}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───────────── Main form component ───────────── */
export default function TripForm({ onSubmit, isLoading }: TripFormProps) {
  const [step, setStep] = useState(0);
  const [avatarText, setAvatarText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    startLocation: '',
    destination: '',
    startDate: '',
    endDate: '',
    themes: [] as string[],
    pace: '',
    weather: '',
    accommodation: '',
    foodType: [] as string[],
    transport: '',
    currency: 'INR',
    totalBudget: '',
    adults: 1,
    children: 0,
    seniors: 0,
    male: 0,
    female: 0,
    travelerType: '',
    additionalPreferences: '',
  });

  /* Typewriter avatar */
  useEffect(() => {
    setIsTyping(true);
    setAvatarText('');
    const msg = AVATAR_MESSAGES[step];
    let i = 0;
    const interval = setInterval(() => {
      setAvatarText(msg.slice(0, i + 1));
      i++;
      if (i >= msg.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 22);
    return () => clearInterval(interval);
  }, [step]);

  /* Scroll to top on step change */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  /* Helpers */
  const toggleChip = (key: string, val: string) => {
    setForm((prev) => {
      const current = prev[key as keyof typeof prev];
      if (Array.isArray(current)) {
        return {
          ...prev,
          [key]: current.includes(val)
            ? current.filter((v) => v !== val)
            : [...current, val],
        };
      }
      return { ...prev, [key]: current === val ? '' : val };
    });
  };

  const canNext = () => {
    if (step === 0) return form.startLocation.trim() && form.destination.trim() && form.startDate && form.endDate;
    return true;
  };

  const next = () => { if (step < 3 && canNext()) setStep(step + 1); };
  const back = () => { if (step > 0) setStep(step - 1); };

  const totalTravelers = form.adults + form.children + form.seniors;
  const dateDisplay = form.startDate && form.endDate
    ? `${new Date(form.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(form.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : '';

  const handleSubmit = () => {
    const travelersDesc = [
      form.adults > 0 ? `${form.adults} adult${form.adults > 1 ? 's' : ''}` : '',
      form.children > 0 ? `${form.children} child${form.children > 1 ? 'ren' : ''}` : '',
      form.seniors > 0 ? `${form.seniors} senior${form.seniors > 1 ? 's' : ''}` : '',
    ].filter(Boolean).join(', ');

    const genderDesc = [
      form.male > 0 ? `${form.male} male` : '',
      form.female > 0 ? `${form.female} female` : '',
    ].filter(Boolean).join(', ');

    const data = {
      startLocation: form.startLocation,
      destination: form.destination,
      dates: dateDisplay,
      totalBudget: form.totalBudget ? `₹${form.totalBudget}` : 'Flexible',
      travelers: `${totalTravelers} (${travelersDesc}${genderDesc ? '; ' + genderDesc : ''})`,
      travelStyle: form.accommodation || 'Medium',
      purpose: form.travelerType || 'Leisure',
      interests: form.themes.join(', '),
      preferences: [
        form.pace && `Pace: ${form.pace}`,
        form.weather && `Weather: ${form.weather}`,
        form.accommodation && `Stay: ${form.accommodation}`,
        form.foodType.length && `Food: ${form.foodType.join(', ')}`,
        form.transport && `Transport: ${form.transport}`,
        form.additionalPreferences,
      ].filter(Boolean).join('. '),
    };
    onSubmit(data);
  };

  /* ───────────── Render ───────────── */
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row bg-card border border-border rounded-2xl overflow-hidden min-h-[620px]">

        {/* ====== LEFT SIDEBAR ====== */}
        <div className="lg:w-[380px] shrink-0 bg-sidebar border-b lg:border-b-0 lg:border-r border-border p-8 flex flex-col">
          <h2 className="text-xl font-bold text-foreground mb-8">Create a Plan</h2>

          {/* Step indicator */}
          <div className="flex items-center gap-0 mb-10">
            {STEP_META.map((_, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 text-sm font-bold transition-all ${
                    i < step
                      ? 'border-indigo-500 bg-indigo-500 text-white'
                      : i === step
                      ? 'border-indigo-400 bg-transparent text-indigo-300'
                      : 'border-border bg-transparent text-faint-foreground'
                  }`}
                >
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                {i < STEP_META.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 rounded-full ${i < step ? 'bg-indigo-500' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Illustration area */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            {/* Avatar character */}
            <motion.div
              key={step}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="relative mb-6"
            >
              <div className="w-28 h-28 rounded-full bg-linear-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-2xl shadow-indigo-500/30 animate-float">
                <Globe className="w-14 h-14 text-white" />
              </div>
              {/* Speech bubble indicator */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute -right-4 -top-4 bg-indigo-500 rounded-full p-2 shadow-lg"
              >
                <MessageCircle className="w-4 h-4 text-white" />
              </motion.div>
            </motion.div>

            <h3 className="text-lg font-bold text-foreground mb-2">{STEP_META[step].desc}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px]">{STEP_META[step].sub}</p>
          </div>
        </div>

        {/* ====== RIGHT CONTENT ====== */}
        <div className="flex-1 flex flex-col">
          {/* Avatar speech bubble (top bar) */}
          <div className="border-b border-border px-8 py-4 flex items-start gap-3">
            <div className="shrink-0 w-9 h-9 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <div className="min-h-[40px] flex items-center">
              <p className="text-sm text-sub-foreground leading-relaxed">
                {avatarText}
                {isTyping && <span className="inline-block w-0.5 h-4 bg-indigo-400 ml-0.5 animate-pulse align-text-bottom" />}
              </p>
            </div>
          </div>

          {/* Form area — scrollable */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                {/* ──── STEP 0: Destination & Dates ──── */}
                {step === 0 && (
                  <div className="space-y-5">
                    <FormField label="Where are you starting your trip from?" required>
                      <LocationSearch
                        icon={<MapPin className="w-4 h-4" />}
                        placeholder="Search your city..."
                        value={form.startLocation}
                        onChange={(v) => setForm({ ...form, startLocation: v })}
                      />
                    </FormField>

                    <FormField label="Search for your destination country/city" required>
                      <LocationSearch
                        icon={<Globe className="w-4 h-4" />}
                        placeholder="Search for places..."
                        value={form.destination}
                        onChange={(v) => setForm({ ...form, destination: v })}
                      />
                    </FormField>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Start Date" required>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <input
                            type="date"
                            value={form.startDate}
                            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full bg-input border border-border rounded-xl pl-11 pr-4 py-3 text-foreground text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                          />
                        </div>
                      </FormField>

                      <FormField label="End Date" required>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <input
                            type="date"
                            value={form.endDate}
                            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                            min={form.startDate || new Date().toISOString().split('T')[0]}
                            className="w-full bg-input border border-border rounded-xl pl-11 pr-4 py-3 text-foreground text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                          />
                        </div>
                      </FormField>
                    </div>

                    <ChipGroup
                      label="Which of these travel themes best describes your dream getaway?"
                      options={TRAVEL_THEMES}
                      selected={form.themes}
                      onToggle={(v) => toggleChip('themes', v)}
                      multi
                    />
                  </div>
                )}

                {/* ──── STEP 1: Travel Preferences ──── */}
                {step === 1 && (
                  <div className="space-y-1">
                    <ChipGroup label="What pace of travel do you prefer?" options={PACE_OPTIONS} selected={form.pace} onToggle={(v) => toggleChip('pace', v)} />
                    <ChipGroup label="What kind of weather do you prefer for your trip?" options={WEATHER_OPTIONS} selected={form.weather} onToggle={(v) => toggleChip('weather', v)} />
                    <ChipGroup label="What type of accommodation would you prefer?" options={ACCOMMODATION_OPTIONS} selected={form.accommodation} onToggle={(v) => toggleChip('accommodation', v)} />
                    <ChipGroup label="What type of food would you like to enjoy during your trip?" options={FOOD_OPTIONS} selected={form.foodType} onToggle={(v) => toggleChip('foodType', v)} multi />
                    <ChipGroup label="How would you like to travel from departure to destination?" options={TRANSPORT_OPTIONS} selected={form.transport} onToggle={(v) => toggleChip('transport', v)} />
                  </div>
                )}

                {/* ──── STEP 2: Budget & Travelers ──── */}
                {step === 2 && (
                  <div className="space-y-5">
                    <FormField label="What is your estimated travel budget? (₹ INR)">
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="50000"
                          step="100"
                          value={form.totalBudget || '0'}
                          onChange={(e) => setForm({ ...form, totalBudget: e.target.value })}
                          className="flex-1 accent-indigo-500 h-2 bg-border rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex items-center gap-1 bg-input border border-border rounded-xl px-3 py-2">
                          <span className="text-muted-foreground text-sm font-medium">₹</span>
                          <input
                            type="number"
                            placeholder="e.g. 1000"
                            value={form.totalBudget}
                            onChange={(e) => setForm({ ...form, totalBudget: e.target.value })}
                            className="w-24 bg-transparent text-foreground text-sm focus:outline-none pl-2"
                          />
                        </div>
                      </div>
                    </FormField>

                    {/* Traveler counts */}
                    <FormField label="Travelers">
                      <div className="space-y-3">
                        <CounterRow label="Adults" sublabel="Age 13+" value={form.adults} min={1} max={20} onChange={(v) => setForm({ ...form, adults: v })} />
                        <CounterRow label="Children" sublabel="Age 2–12" value={form.children} min={0} max={10} onChange={(v) => setForm({ ...form, children: v })} />
                        <CounterRow label="Seniors" sublabel="Age 60+" value={form.seniors} min={0} max={10} onChange={(v) => setForm({ ...form, seniors: v })} />
                      </div>
                    </FormField>

                    {/* Gender split */}
                    <FormField label="Gender (optional — for room/activity planning)">
                      <div className="space-y-3">
                        <CounterRow label="Male" value={form.male} min={0} max={totalTravelers} onChange={(v) => setForm({ ...form, male: v })} />
                        <CounterRow label="Female" value={form.female} min={0} max={totalTravelers} onChange={(v) => setForm({ ...form, female: v })} />
                      </div>
                    </FormField>

                    <ChipGroup
                      label="Who are you traveling as?"
                      options={TRAVELER_TYPE_OPTIONS}
                      selected={form.travelerType}
                      onToggle={(v) => toggleChip('travelerType', v)}
                    />

                    <FormField label="Any additional preferences or specific places/activities you'd like to include?">
                      <textarea
                        value={form.additionalPreferences}
                        onChange={(e) => setForm({ ...form, additionalPreferences: e.target.value })}
                        placeholder="e.g., I want to visit the Eiffel Tower, go parasailing, or try local cooking classes..."
                        rows={4}
                        className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                      />
                    </FormField>
                  </div>
                )}

                {/* ──── STEP 3: Review ──── */}
                {step === 3 && (
                  <div className="space-y-4">
                    <ReviewRow label="Starting From" value={form.startLocation} />
                    <ReviewRow label="Destination" value={form.destination} />
                    <ReviewRow label="Dates" value={dateDisplay || '—'} />
                    <ReviewRow label="Travel Themes" value={form.themes.join(', ') || '—'} />
                    <ReviewRow label="Pace" value={form.pace || '—'} />
                    <ReviewRow label="Weather Preference" value={form.weather || '—'} />
                    <ReviewRow label="Accommodation" value={form.accommodation || '—'} />
                    <ReviewRow label="Food Preferences" value={form.foodType.join(', ') || '—'} />
                    <ReviewRow label="Transport" value={form.transport || '—'} />
                    <ReviewRow label="Budget" value={form.totalBudget ? `₹${form.totalBudget}` : 'Flexible'} />
                    <ReviewRow label="Travelers" value={
                      [
                        form.adults > 0 ? `${form.adults} adult${form.adults > 1 ? 's' : ''}` : '',
                        form.children > 0 ? `${form.children} child${form.children > 1 ? 'ren' : ''}` : '',
                        form.seniors > 0 ? `${form.seniors} senior${form.seniors > 1 ? 's' : ''}` : '',
                      ].filter(Boolean).join(', ') || '1 adult'
                    } />
                    {(form.male > 0 || form.female > 0) && (
                      <ReviewRow label="Gender Split" value={
                        [
                          form.male > 0 ? `${form.male} male` : '',
                          form.female > 0 ? `${form.female} female` : '',
                        ].filter(Boolean).join(', ')
                      } />
                    )}
                    <ReviewRow label="Travel Type" value={form.travelerType || '—'} />
                    {form.additionalPreferences && (
                      <ReviewRow label="Preferences" value={form.additionalPreferences} />
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation footer */}
          <div className="border-t border-border px-8 py-4 flex items-center justify-between">
            <button
              type="button"
              onClick={back}
              disabled={step === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sub-foreground text-sm hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={next}
                disabled={!canNext()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Itinerary
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────── Sub-components ───────────── */
function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-sub-foreground mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

function LocationSearch({
  icon,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const [allCities, setAllCities] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Load CSV once on mount
  useEffect(() => {
    let cancelled = false;
    fetch('/worldcities.csv')
      .then((r) => r.text())
      .then((text) => {
        if (cancelled) return;
        const lines = text.split('\n').slice(1); // skip header
        const cities: string[] = [];
        for (const line of lines) {
          if (!line.trim()) continue;
          // Parse CSV: "city","city_ascii","lat","lng","country",...
          const cols = line.match(/(?:^|,)("(?:[^"]*(?:""[^"]*)*)"|[^,]*)/g);
          if (!cols || cols.length < 5) continue;
          const clean = (s: string) => s.replace(/^,?"?|"?$/g, '').replace(/""/g, '"');
          const city = clean(cols[0]);
          const country = clean(cols[4]);
          if (city && country) {
            cities.push(`${city}, ${country}`);
          }
        }
        setAllCities([...new Set(cities)]);
      })
      .catch(() => {
        // Keep fallback on error
        setAllCities(FALLBACK_LOCATIONS);
      });
    return () => { cancelled = true; };
  }, []);

  const locations = allCities.length > 0 ? allCities : FALLBACK_LOCATIONS;

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInput = (val: string) => {
    setQuery(val);
    onChange(val);
    if (val.trim().length >= 1) {
      const q = val.toLowerCase();
      // Prioritize: starts-with matches first, then includes
      const startsWith: string[] = [];
      const includes: string[] = [];
      for (const loc of locations) {
        const lower = loc.toLowerCase();
        if (lower.startsWith(q)) {
          startsWith.push(loc);
        } else if (lower.includes(q)) {
          includes.push(loc);
        }
        if (startsWith.length + includes.length >= 10) break;
      }
      const matches = [...startsWith, ...includes].slice(0, 10);
      setFiltered(matches);
      setIsOpen(matches.length > 0);
    } else {
      setIsOpen(false);
    }
  };

  const handleSelect = (loc: string) => {
    setQuery(loc);
    onChange(loc);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>
      <input
        type="text"
        value={query}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => { if (filtered.length > 0) setIsOpen(true); }}
        placeholder={placeholder}
        className="w-full bg-input border border-border rounded-xl pl-11 pr-4 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
      />
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-xl shadow-2xl shadow-black/40 max-h-56 overflow-y-auto">
          {filtered.map((loc, idx) => {
            const parts = loc.split(', ');
            const city = parts[0];
            const country = parts.slice(1).join(', ');
            return (
              <button
                key={`${loc}-${idx}`}
                type="button"
                onClick={() => handleSelect(loc)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-500/10 hover:text-foreground transition-colors flex items-center gap-2"
              >
                <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-foreground">{city}</span>
                {country && <span className="text-muted-foreground text-xs">{country}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CounterRow({
  label,
  sublabel,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  sublabel?: string;
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
}) {
  return (
    <div className="flex items-center justify-between bg-input border border-border rounded-xl px-4 py-3">
      <div>
        <span className="text-sm text-foreground font-medium">{label}</span>
        {sublabel && <span className="text-xs text-muted-foreground ml-2">{sublabel}</span>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:border-indigo-500 hover:text-indigo-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="w-6 text-center text-sm text-foreground font-medium">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:border-indigo-500 hover:text-indigo-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function TextInput({
  icon,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-input border border-border rounded-xl pl-11 pr-4 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
      />
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm text-foreground text-right">{value}</span>
    </div>
  );
}
