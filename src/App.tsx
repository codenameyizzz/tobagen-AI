/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import RecommendationForm from './components/RecommendationForm';
import ItineraryView from './components/ItineraryView';
import SavedPlans, { type SavedPlan } from './components/SavedPlans';
import Footer from './components/Footer';
import {
  generateChatRecommendation,
  generateTobaRecommendations,
  type RecommendationRequest,
  type TobaItinerary,
} from './services/itineraryService';

const SAVED_PLANS_STORAGE_KEY = 'toba-discovery:saved-plans';

export default function App() {
  const [itinerary, setItinerary] = useState<TobaItinerary | null>(null);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SAVED_PLANS_STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as SavedPlan[];
      if (Array.isArray(parsed)) {
        setSavedPlans(parsed);
      }
    } catch {
      window.localStorage.removeItem(SAVED_PLANS_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SAVED_PLANS_STORAGE_KEY, JSON.stringify(savedPlans));
  }, [savedPlans]);

  const scrollToResults = () => {
    window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleGenerate = async (req: RecommendationRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateTobaRecommendations(req);
      setItinerary(result);
      scrollToResults();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatGenerate = async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateChatRecommendation(query);
      setItinerary(result);
      scrollToResults();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePlan = () => {
    if (!itinerary || isCurrentPlanSaved) {
      return;
    }

    const nextPlan: SavedPlan = {
      id: `plan-${Date.now()}`,
      savedAt: new Date().toISOString(),
      itinerary,
    };

    setSavedPlans((currentPlans) => [nextPlan, ...currentPlans]);
  };

  const handleExportPdf = async () => {
    if (!itinerary) {
      return;
    }

    const { exportItineraryPdf } = await import('./utils/exportItineraryPdf');
    exportItineraryPdf(itinerary);
  };

  const handleOpenSavedPlan = (plan: SavedPlan) => {
    setItinerary(plan.itinerary);
    setError(null);
    scrollToResults();
  };

  const handleDeleteSavedPlan = (planId: string) => {
    setSavedPlans((currentPlans) => currentPlans.filter((plan) => plan.id !== planId));
  };

  const isCurrentPlanSaved = Boolean(
    itinerary &&
      savedPlans.some((plan) => JSON.stringify(plan.itinerary) === JSON.stringify(itinerary)),
  );

  return (
    <div className="min-h-screen">
      <Navbar />

      <main>
        <Hero />

        <RecommendationForm
          onSubmit={handleGenerate}
          onChatSubmit={handleChatGenerate}
          isLoading={isLoading}
        />

        <SavedPlans
          plans={savedPlans}
          onOpen={handleOpenSavedPlan}
          onDelete={handleDeleteSavedPlan}
        />

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto px-6 mb-10"
            >
              <div className="flex items-center gap-4 bg-red-50 text-red-600 p-6 rounded-[2rem] border border-red-100">
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            </motion.div>
          )}

          {itinerary && (
            <div ref={resultsRef}>
              <ItineraryView
                itinerary={itinerary}
                onSave={handleSavePlan}
                onExportPdf={handleExportPdf}
                isSaved={isCurrentPlanSaved}
              />
            </div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
