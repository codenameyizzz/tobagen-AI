/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NavItem {
  label: string;
  href: string;
}

export interface HeroPanoramaImage {
  src: string;
  alt: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Plan Builder", href: "#planning-section" },
  { label: "Saved Plans", href: "#saved-plans-section" },
];

export const HERO_PANORAMA_IMAGES: HeroPanoramaImage[] = [
  {
    src: "https://paketwisataliburan.com/wp-content/uploads/2021/05/samosir-island-inside-the-lake-toba.jpg",
    alt: "Samosir Island panorama inside Lake Toba",
  },
  {
    src: "https://regalsprings.co.id/wp-content/uploads/2023/05/Danau-Toba.png",
    alt: "Wide view of Lake Toba shoreline and hills",
  },
  {
    src: "https://static.tripzilla.id/media/244649/conversions/01JTJ1JMQTSPY9XRFSS15DVM46-w1024.webp",
    alt: "Lake Toba highland panorama at golden light",
  },
];

export const VIBE_OPTIONS = [
  "Adventurous",
  "Relaxing",
  "Cultural",
  "Romantic",
  "Family-Friendly"
];

export const INTEREST_OPTIONS = [
  "Nature & Hiking",
  "Water Sports",
  "Batak Culture",
  "Coffee Tasting",
  "Photography",
  "Local Markets",
  "Hidden Waterfalls"
];

export const STAY_DURATION_OPTIONS = [
  "1 Day",
  "2 Days",
  "3 Days",
  "4 Days",
  "5 Days",
  "7 Days",
  "10 Days",
  "14 Days",
];
