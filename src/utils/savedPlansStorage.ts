import { isTobaItinerary } from '../../shared/itinerary';

export interface SavedPlan {
  id: string;
  savedAt: string;
  itinerary: {
    title: string;
    summary: string;
    days: {
      day: number;
      title: string;
      activities: {
        time: string;
        activity: string;
        location: string;
        description: string;
      }[];
    }[];
    recommendedPlaces: {
      name: string;
      description: string;
      location: {
        lat: number;
        lng: number;
      };
      category: string;
      bestTime: string;
    }[];
    travelTips: string[];
  };
}

const LOCAL_STORAGE_KEY = 'toba-discovery:saved-plans';
const COOKIE_STORAGE_KEY = 'toba-discovery-saved-plans';
const COOKIE_MAX_CHARS = 3500;
const MAX_SAVED_PLANS = 20;

export function loadSavedPlans(): SavedPlan[] {
  const localPlans = loadFromLocalStorage();
  if (localPlans.length > 0) {
    return localPlans;
  }

  return loadFromCookie();
}

export function persistSavedPlans(plans: SavedPlan[]) {
  if (typeof window === 'undefined') {
    return;
  }

  const normalizedPlans = normalizeSavedPlans(plans);
  const serialized = JSON.stringify(normalizedPlans);

  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, serialized);
  } catch {
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  const cookieBackup = createCookieBackup(normalizedPlans);
  writeCookie(COOKIE_STORAGE_KEY, encodeURIComponent(JSON.stringify(cookieBackup)));
}

function loadFromLocalStorage(): SavedPlan[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    return validateSavedPlans(JSON.parse(raw));
  } catch {
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    return [];
  }
}

function loadFromCookie(): SavedPlan[] {
  if (typeof document === 'undefined') {
    return [];
  }

  const cookieValue = readCookie(COOKIE_STORAGE_KEY);
  if (!cookieValue) {
    return [];
  }

  try {
    return validateSavedPlans(JSON.parse(decodeURIComponent(cookieValue)));
  } catch {
    writeCookie(COOKIE_STORAGE_KEY, '', -1);
    return [];
  }
}

function validateSavedPlans(value: unknown): SavedPlan[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isSavedPlan).slice(0, MAX_SAVED_PLANS);
}

function normalizeSavedPlans(plans: SavedPlan[]): SavedPlan[] {
  return plans.filter(isSavedPlan).slice(0, MAX_SAVED_PLANS);
}

function isSavedPlan(value: unknown): value is SavedPlan {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const plan = value as Record<string, unknown>;
  return (
    typeof plan.id === 'string' &&
    typeof plan.savedAt === 'string' &&
    isTobaItinerary(plan.itinerary)
  );
}

function createCookieBackup(plans: SavedPlan[]): SavedPlan[] {
  const backup: SavedPlan[] = [];

  for (const plan of plans) {
    const nextBackup = [...backup, plan];
    const serialized = JSON.stringify(nextBackup);

    if (serialized.length > COOKIE_MAX_CHARS) {
      break;
    }

    backup.push(plan);
  }

  return backup;
}

function readCookie(name: string): string | null {
  const prefix = `${name}=`;
  const cookie = document.cookie
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix));

  return cookie ? cookie.slice(prefix.length) : null;
}

function writeCookie(name: string, value: string, maxAgeDays = 30) {
  if (typeof document === 'undefined') {
    return;
  }

  const maxAge = maxAgeDays * 24 * 60 * 60;
  document.cookie = `${name}=${value}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}
