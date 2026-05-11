/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import type { TobaItinerary } from "../services/itineraryService";
import { BookmarkPlus, Calendar, MapPin, Sparkles, Clock, Globe } from "lucide-react";

export default function ItineraryView({
  itinerary,
  onSave,
  isSaved,
}: {
  itinerary: TobaItinerary;
  onSave: () => void;
  isSaved: boolean;
}) {
  return (
    <motion.div
      id="generated-plan-section"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto py-20 px-8"
    >
      <div className="mb-20 text-center max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-4 text-apple-blue">
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">AI Intelligence</span>
        </div>
        <h2 className="text-5xl font-semibold tracking-tight mb-6 leading-tight">{itinerary.title}</h2>
        <p className="text-lg text-apple-subtext font-normal leading-relaxed mb-8">{itinerary.summary}</p>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaved}
          className={`inline-flex items-center gap-3 rounded-full px-7 py-4 font-semibold transition-all ${
            isSaved
              ? "bg-apple-blue/10 text-apple-blue border border-apple-blue/20 cursor-default"
              : "bg-apple-blue text-white hover:bg-blue-700 shadow-xl shadow-apple-blue/15"
          }`}
        >
          <BookmarkPlus className="w-5 h-5" />
          {isSaved ? "Saved to your plans" : "Save this recommendation"}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {itinerary.days.map((day) => (
            <div key={day.day} className="apple-glass p-10 rounded-apple-lg border-apple-border">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-apple-blue mb-1 block">Day {day.day}</span>
                  <h3 className="text-2xl font-bold">{day.title}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-apple-bg flex items-center justify-center text-apple-blue shadow-inner border border-apple-border">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-6">
                {day.activities.map((activity, idx) => (
                  <motion.div
                    key={`${day.day}-${idx}-${activity.activity}`}
                    whileHover={{ scale: 1.01 }}
                    className="bg-apple-bg/40 p-6 rounded-2xl border border-apple-border/50 group"
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                      <div className="min-w-[100px]">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-apple-subtext uppercase tracking-wider mb-2">
                          <Clock className="w-3.5 h-3.5" />
                          {activity.time}
                        </div>
                        <div className="text-[10px] bg-apple-blue/5 text-apple-blue px-2 py-0.5 rounded inline-block font-bold">Planned</div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base font-bold mb-2 group-hover:text-apple-blue transition-colors">{activity.activity}</h4>
                        <div className="flex items-center gap-1 text-[11px] text-apple-secondary mb-4">
                          <MapPin className="w-3 h-3 text-apple-blue" />
                          {activity.location}
                        </div>
                        <p className="text-sm text-apple-secondary leading-relaxed font-normal">{activity.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-8">
          <div className="apple-card p-10 relative overflow-hidden group">
            <Globe className="absolute -right-12 -bottom-12 w-48 h-48 text-apple-bg group-hover:rotate-12 transition-transform duration-1000" />
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3 relative z-10">
              <MapPin className="w-5 h-5 text-apple-blue" />
              Proximity Insights
            </h3>
            <div className="space-y-8 relative z-10">
              {itinerary.recommendedPlaces.map((place) => (
                <div key={place.name} className="group/item pb-6 border-b border-apple-bg last:border-0 last:pb-0">
                  <h4 className="font-bold text-base mb-1 group-hover/item:text-apple-blue transition-colors">{place.name}</h4>
                  <p className="text-[11px] text-apple-subtext uppercase tracking-tighter mb-2">
                    {place.location.lat.toFixed(2)}° N, {place.location.lng.toFixed(2)}° E
                  </p>
                  <p className="text-xs text-apple-secondary leading-relaxed mb-4">{place.description}</p>
                  <div className="flex items-center gap-3 text-[9px] uppercase font-bold tracking-widest">
                    <span className="bg-apple-bg px-2 py-1 rounded text-apple-subtext">{place.category}</span>
                    <span className="text-apple-blue">98% Match</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="apple-glass p-10 rounded-apple-lg border-apple-border">
            <h3 className="text-xs uppercase tracking-widest font-bold text-apple-subtext mb-6">Discovery Notes</h3>
            <div className="space-y-4">
              {itinerary.travelTips.map((tip) => (
                <div key={tip} className="flex gap-4 p-4 bg-white rounded-xl border border-apple-border shadow-sm">
                  <div className="w-1.5 h-1.5 bg-apple-blue rounded-full mt-1.5 shrink-0"></div>
                  <p className="text-xs text-apple-secondary leading-snug">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
