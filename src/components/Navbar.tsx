/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NAV_ITEMS } from "../constants";

export default function Navbar({ onNavigate }: { onNavigate: (href: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onNavigate(href);
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between apple-glass rounded-full px-6 py-3 border-[#D2D2D7]">
        <a href="/" onClick={handleNavigation("/")} className="flex items-center gap-2">
          <div className="w-6 h-6 bg-apple-blue rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <span className="text-lg font-semibold tracking-tight text-apple-text">
            TobaRecs
            <span className="font-light text-apple-subtext ml-1 text-sm uppercase tracking-tighter">AI Discovery</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={handleNavigation(item.href)}
              className="text-sm font-medium text-apple-secondary hover:text-black transition-colors"
            >
              {item.label}
            </a>
          ))}
          <a href="/saved-plans" onClick={handleNavigation("/saved-plans")} className="apple-button-primary">
            Open Saved Plans
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-apple-text"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          type="button"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden mt-4 apple-glass rounded-[28px] p-6 flex flex-col gap-4 shadow-xl border-[#D2D2D7]"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-lg font-medium text-apple-text"
              onClick={handleNavigation(item.href)}
            >
              {item.label}
            </a>
          ))}
          <a
            href="/saved-plans"
            className="apple-button-primary w-full py-4 text-base text-center"
            onClick={handleNavigation("/saved-plans")}
          >
            Open Saved Plans
          </a>
        </motion.div>
      )}
    </nav>
  );
}
