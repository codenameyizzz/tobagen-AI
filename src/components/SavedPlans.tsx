import { Bookmark, CalendarDays, Clock3, MapPinned, Trash2 } from "lucide-react";
import type { TobaItinerary } from "../services/itineraryService";

export interface SavedPlan {
  id: string;
  savedAt: string;
  itinerary: TobaItinerary;
}

export default function SavedPlans({
  plans,
  onOpen,
  onDelete,
}: {
  plans: SavedPlan[];
  onOpen: (plan: SavedPlan) => void;
  onDelete: (planId: string) => void;
}) {
  return (
    <section id="saved-plans-section" className="max-w-6xl mx-auto py-20 px-8">
      <div className="flex items-center gap-3 mb-4 text-apple-blue">
        <Bookmark className="w-5 h-5" />
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Saved Plans</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
        <div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-3">Your saved Lake Toba plans</h2>
          <p className="text-apple-subtext max-w-2xl">
            Save the best itineraries from Gemini and reopen them anytime without generating from scratch.
          </p>
        </div>
        <div className="text-sm text-apple-subtext">{plans.length} plan{plans.length === 1 ? "" : "s"} saved</div>
      </div>

      {plans.length === 0 ? (
        <div className="apple-glass rounded-apple-lg p-10 border-apple-border text-center">
          <p className="text-lg font-semibold mb-2">No saved plans yet</p>
          <p className="text-sm text-apple-subtext">
            Generate an itinerary first, then save it to build your own collection of trip ideas.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <article key={plan.id} className="apple-card p-8 flex flex-col gap-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold leading-tight mb-2">{plan.itinerary.title}</h3>
                  <p className="text-sm text-apple-subtext leading-relaxed">{plan.itinerary.summary}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(plan.id)}
                  className="shrink-0 w-11 h-11 rounded-full border border-apple-border bg-white text-apple-subtext hover:text-red-600 hover:border-red-200 transition-colors flex items-center justify-center"
                  aria-label={`Delete saved plan ${plan.itinerary.title}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                <div className="bg-apple-bg rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2 text-apple-blue mb-1">
                    <CalendarDays className="w-4 h-4" />
                    <span className="font-semibold">Saved</span>
                  </div>
                  <p className="text-apple-secondary">{formatSavedDate(plan.savedAt)}</p>
                </div>

                <div className="bg-apple-bg rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2 text-apple-blue mb-1">
                    <Clock3 className="w-4 h-4" />
                    <span className="font-semibold">Days</span>
                  </div>
                  <p className="text-apple-secondary">{plan.itinerary.days.length} day plan</p>
                </div>

                <div className="bg-apple-bg rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2 text-apple-blue mb-1">
                    <MapPinned className="w-4 h-4" />
                    <span className="font-semibold">Places</span>
                  </div>
                  <p className="text-apple-secondary">{plan.itinerary.recommendedPlaces.length} spots</p>
                </div>
              </div>

              <button type="button" onClick={() => onOpen(plan)} className="apple-button-primary w-full py-4 text-base">
                Open Saved Plan
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function formatSavedDate(savedAt: string): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(savedAt));
}
