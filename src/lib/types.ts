export interface TripInput {
    id: string; // Unique ID for keying
    startLocation: string;
    destination: string;
    dates: string;
    flexibility: string;
    duration: string;
    totalBudget: string;
    perPersonBudget: string;
    travelers: string;
    travelStyle: string;
    purpose: string;
    expectations: string;
    visitedPlaces: string;
    pacePreference: string;
    stayPreference: string;
    transportPreference: string;
    foodPreference: string;
    visaConstraints: string;
    dealBreakers: string;
  }
  
  export interface TripResponse {
    input_summary: Record<string, any>;
    verdict: {
        status: "GOOD" | "CONDITIONAL" | "NOT_RECOMMENDED";
        reasoning: string;
        required_changes?: string;
    };
    intelligence: {
        weather_pattern: string;
        rain_probability: string;
        temperature_range: string;
        crowd_density: string;
        price_seasonality: string;
        local_festivals: string;
        safety_conditions: string;
        scenic_quality: string;
        daylight_hours: string;
    };
    cost_analysis: {
        per_person_breakdown: {
            transport_to_destination: string;
            stay: string;
            food: string;
            internal_transport: string;
            activities: string;
            buffer: string;
        };
        classification: "UNDER_BUDGET" | "ON_EDGE" | "OVER_BUDGET";
    };
    alternatives: Array<{
        name: string;
        why_superior: string;
        experience_comparison: string;
        cost_difference: string;
        target_audience: string;
    }>;
    selected_plan: "original" | "alternative_1" | "alternative_2";
    trip_highlights?: {
        title: string;
        narrative: string;
    };
    itinerary: Array<{
        day: number;
        narrative?: string;
        morning: string;
        afternoon: string;
        evening: string;
        travel_time: string;
        why_optimal: string;
        food_recommendation: string;
        hotel_recommendation?: string;
        booking_strategy: string;
        best_photo_timing: string;
        maps_link?: string;
    }>;
    experience_optimization: {
        tourist_traps_to_avoid: string[];
        high_value_experiences: string[];
        hidden_gems: string[];
        best_viewpoints: string[];
        best_timing_for_attractions: string[];
    };
    risks_and_backups: Array<{
        risk: string;
        mitigation: string;
    }> | Record<string, string>;
    packing_and_preparation: {
        weather_based_packing?: string[];
        weather_based_packing_list?: string | string[];
        documents?: string[];
        documents_checklist?: string | string[];
        health_prep?: string[];
        fitness_altitude_prep?: string | string[];
        pre_booking_timeline?: string | string[];
    };
    trip_score: {
        score: number;
        explanation: string;
    };
  }
