export interface RecommendationRequest {
  duration: string;
  travelers: string;
  interests: string[];
  vibe: string;
}

export interface TobaPlace {
  name: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  category: string;
  bestTime: string;
}

export interface TobaItineraryDayActivity {
  time: string;
  activity: string;
  location: string;
  description: string;
}

export interface TobaItineraryDay {
  day: number;
  title: string;
  activities: TobaItineraryDayActivity[];
}

export interface TobaItinerary {
  title: string;
  summary: string;
  days: TobaItineraryDay[];
  recommendedPlaces: TobaPlace[];
  travelTips: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function isRecommendationRequest(value: unknown): value is RecommendationRequest {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.duration === 'string' &&
    typeof value.travelers === 'string' &&
    isStringArray(value.interests) &&
    typeof value.vibe === 'string'
  );
}

export function isTobaItinerary(value: unknown): value is TobaItinerary {
  if (!isRecord(value)) {
    return false;
  }

  const { title, summary, days, recommendedPlaces, travelTips } = value;

  return (
    typeof title === 'string' &&
    typeof summary === 'string' &&
    Array.isArray(days) &&
    days.every((day) => {
      if (!isRecord(day) || typeof day.day !== 'number' || typeof day.title !== 'string' || !Array.isArray(day.activities)) {
        return false;
      }

      return day.activities.every((activity) => (
        isRecord(activity) &&
        typeof activity.time === 'string' &&
        typeof activity.activity === 'string' &&
        typeof activity.location === 'string' &&
        typeof activity.description === 'string'
      ));
    }) &&
    Array.isArray(recommendedPlaces) &&
    recommendedPlaces.every((place) => (
      isRecord(place) &&
      typeof place.name === 'string' &&
      typeof place.description === 'string' &&
      isRecord(place.location) &&
      typeof place.location.lat === 'number' &&
      typeof place.location.lng === 'number' &&
      typeof place.category === 'string' &&
      typeof place.bestTime === 'string'
    )) &&
    isStringArray(travelTips)
  );
}
