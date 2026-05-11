/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import RecommendationForm from './components/RecommendationForm';
import ItineraryView from './components/ItineraryView';
import Footer from './components/Footer';
import {
  generateChatRecommendation,
  generateTobaRecommendations,
  type RecommendationRequest,
  type TobaItinerary,
} from './services/itineraryService';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [itinerary, setItinerary] = useState<TobaItinerary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

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

  const scrollToPlan = () => {
    document.getElementById('planning-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <Hero onStart={scrollToPlan} />
        
        <RecommendationForm 
          onSubmit={handleGenerate} 
          onChatSubmit={handleChatGenerate}
          isLoading={isLoading} 
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
              <ItineraryView itinerary={itinerary} />
            </div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
