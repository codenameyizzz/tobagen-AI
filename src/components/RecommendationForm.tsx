/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion } from "motion/react";
import { INTEREST_OPTIONS, STAY_DURATION_OPTIONS, VIBE_OPTIONS } from "../constants";
import type { RecommendationRequest } from "../services/itineraryService";
import { Check } from "lucide-react";

export default function RecommendationForm({ 
  onSubmit,
  onChatSubmit,
  isLoading 
}: { 
  onSubmit: (req: RecommendationRequest) => void;
  onChatSubmit: (query: string) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<RecommendationRequest>({
    duration: "1 Day",
    travelers: "2 People",
    interests: [],
    vibe: "Adventurous"
  });

  const [chatQuery, setChatQuery] = useState("");

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleChatSubmit = () => {
    if (chatQuery.trim()) {
      onChatSubmit(chatQuery);
    }
  };

  return (
    <motion.section 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-6xl mx-auto py-20 px-8"
      id="planning-section"
    >
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column: Generative Input & Preferences */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <section className="apple-glass p-8 rounded-apple-md">
            <h1 className="text-3xl font-semibold tracking-tight leading-tight mb-2">Where to, <br/><span className="text-apple-blue font-bold tracking-tighter">Lake Toba?</span></h1>
            <p className="text-sm text-apple-subtext mb-6">Describe your ideal escape and our AI will map it out using geospatial intelligence.</p>
            
            <div className="relative mb-8">
              <textarea 
                value={chatQuery}
                onChange={(e) => setChatQuery(e.target.value)}
                disabled={isLoading}
                className="w-full h-40 apple-input ring-1 ring-apple-border focus:ring-apple-blue/20 resize-none transition-all placeholder:text-apple-subtext/50"
                placeholder="e.g., I want a 4-day peaceful stay near the water with local Batak culture and hidden waterfalls..."
              ></textarea>
              <button 
                onClick={handleChatSubmit}
                disabled={isLoading || !chatQuery.trim()}
                type="button"
                className="absolute bottom-3 right-3 apple-button-secondary disabled:opacity-30"
              >
                {isLoading ? "..." : "Generate"}
              </button>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest font-bold text-apple-subtext">Stay Duration</label>
              <div className="grid grid-cols-2 gap-2">
                {STAY_DURATION_OPTIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => setFormData({ ...formData, duration: d })}
                    type="button"
                    className={`py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                      formData.duration === d 
                        ? "bg-apple-blue text-white border-apple-blue shadow-md" 
                        : "bg-apple-bg text-apple-text border-apple-border hover:bg-white hover:border-apple-subtext"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="apple-glass p-8 rounded-apple-md flex-1">
            <h2 className="text-[10px] uppercase tracking-widest font-bold text-apple-subtext mb-6">Your Travelers</h2>
            <div className="space-y-4">
              <select 
                value={formData.travelers}
                onChange={(e) => setFormData({ ...formData, travelers: e.target.value })}
                className="w-full apple-input ring-1 ring-apple-border focus:ring-apple-blue/10"
              >
                <option>Solo Traveler</option>
                <option>2 People</option>
                <option>Family (3-5)</option>
                <option>Large Group (6+)</option>
              </select>

              <div className="pt-4">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-2 text-apple-subtext">
                  <span>Adventure Vibe</span>
                  <span className="text-apple-blue">{formData.vibe}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {VIBE_OPTIONS.map(v => (
                    <button
                      key={v}
                      onClick={() => setFormData({ ...formData, vibe: v })}
                      type="button"
                      className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                        formData.vibe === v 
                          ? "bg-apple-blue/10 text-apple-blue border border-apple-blue/20" 
                          : "bg-white text-apple-secondary border border-apple-border hover:border-apple-subtext"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Results & Mapping */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          <div className="apple-card flex-1 flex flex-col">
            <div className="p-8 border-b border-apple-bg flex justify-between items-center">
              <h3 className="text-xl font-semibold">Points of Interest</h3>
              <span className="text-[10px] bg-green-50 text-green-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-green-100 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                Geospatial Sync
              </span>
            </div>
            
            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {INTEREST_OPTIONS.map(interest => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  type="button"
                  className={`group p-5 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                    formData.interests.includes(interest)
                      ? "bg-apple-blue/5 border-apple-blue ring-1 ring-apple-blue/20 shadow-sm"
                      : "bg-apple-bg border-transparent hover:border-apple-blue/30"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-sm font-bold ${formData.interests.includes(interest) ? "text-apple-blue" : "text-apple-text"}`}>
                      {interest}
                    </span>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      formData.interests.includes(interest) 
                        ? "bg-apple-blue text-white" 
                        : "bg-white border border-apple-border"
                    }`}>
                      {formData.interests.includes(interest) && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                  <p className="text-[10px] text-apple-subtext uppercase tracking-widest font-medium opacity-60">Add to journey</p>
                </button>
              ))}
            </div>

            <div className="mt-auto p-8 bg-apple-bg/50 border-t border-apple-bg">
              <button
                disabled={isLoading || formData.interests.length === 0}
                onClick={() => onSubmit(formData)}
                type="button"
                className={`w-full py-4 rounded-full font-bold text-lg shadow-xl shadow-apple-blue/10 transition-all flex items-center justify-center gap-3 ${
                  isLoading || formData.interests.length === 0
                    ? "bg-apple-blue/30 text-white cursor-not-allowed shadow-none"
                    : "apple-button-primary scale-100 hover:scale-[1.01]"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Mapping Discovery...
                  </div>
                ) : (
                  "Generate Discovery"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
