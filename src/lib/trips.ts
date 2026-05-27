import { TripResponse } from "./types";

/* ───────────── Interfaces ───────────── */

export interface SavedTrip {
  id: string;
  destination: string;
  startLocation: string;
  dates: string;
  travelers: string;
  budget: string;
  formData: Record<string, any>;
  plan: TripResponse | null;
  status: "planning" | "generated";
  createdAt: string;
}

export interface Expense {
  id: string;
  tripId: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  paidBy: string;
}

export interface Collaborator {
  id: string;
  tripId: string;
  name: string;
  email: string;
  role: "owner" | "editor" | "viewer";
  addedAt: string;
}

export interface UserSettings {
  displayName: string;
  email: string;
  defaultCurrency: string;
  defaultTravelers: number;
  notifications: boolean;
  darkMode: boolean;
  language: string;
}

/* ───────────── Helpers ───────────── */

export function generateId(): string {
  return `trip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/* ───────────── Trips (async, MongoDB-backed) ───────────── */

export async function getTrips(): Promise<SavedTrip[]> {
  try {
    const res = await fetch("/api/trips");
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getTripById(id: string): Promise<SavedTrip | undefined> {
  try {
    const res = await fetch(`/api/trips?id=${encodeURIComponent(id)}`);
    if (!res.ok) return undefined;
    return await res.json();
  } catch {
    return undefined;
  }
}

export async function saveTrip(trip: SavedTrip): Promise<void> {
  const response = await fetch("/api/trips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trip),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Failed to save trip (${response.status})`);
  }
}

export async function deleteTrip(id: string): Promise<void> {
  const response = await fetch(`/api/trips?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Failed to delete trip (${response.status})`);
  }
}

/* ───────────── Expenses (async, MongoDB-backed) ───────────── */

export async function getExpenses(): Promise<Expense[]> {
  try {
    const res = await fetch("/api/expenses");
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getExpensesByTrip(tripId: string): Promise<Expense[]> {
  try {
    const res = await fetch(
      `/api/expenses?tripId=${encodeURIComponent(tripId)}`,
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function saveExpense(expense: Expense): Promise<void> {
  const response = await fetch("/api/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      data.error || `Failed to save expense (${response.status})`,
    );
  }
}

export async function deleteExpense(id: string): Promise<void> {
  const response = await fetch(`/api/expenses?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      data.error || `Failed to delete expense (${response.status})`,
    );
  }
}

/* ───────────── Collaborators (async, MongoDB-backed) ───────────── */

export async function getCollaborators(): Promise<Collaborator[]> {
  try {
    const res = await fetch("/api/collaborators");
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getCollaboratorsByTrip(
  tripId: string,
): Promise<Collaborator[]> {
  try {
    const res = await fetch(
      `/api/collaborators?tripId=${encodeURIComponent(tripId)}`,
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function saveCollaborator(collab: Collaborator): Promise<void> {
  const response = await fetch("/api/collaborators", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(collab),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      data.error || `Failed to save collaborator (${response.status})`,
    );
  }
}

export async function deleteCollaborator(id: string): Promise<void> {
  const response = await fetch(
    `/api/collaborators?id=${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      data.error || `Failed to delete collaborator (${response.status})`,
    );
  }
}

/* ───────────── Settings (async, MongoDB-backed) ───────────── */

const DEFAULT_SETTINGS: UserSettings = {
  displayName: "",
  email: "",
  defaultCurrency: "INR",
  defaultTravelers: 1,
  notifications: true,
  darkMode: true,
  language: "en",
};

export async function getSettings(): Promise<UserSettings> {
  try {
    const res = await fetch("/api/settings");
    if (!res.ok) return DEFAULT_SETTINGS;
    return await res.json();
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  await fetch("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
}
