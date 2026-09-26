"use client";
import React, { useState, useEffect, useRef } from "react";
import { COUNTRIES, Country } from "@/lib/countries";

interface PhoneInputWithCountryProps {
  value?: string;
  onChange?: (val: string) => void;
  onEnter?: () => void;
  autoFocus?: boolean;
  compact?: boolean;
  className?: string;
}

export function PhoneInputWithCountry({
  value = "",
  onChange,
  onEnter,
  autoFocus = false,
  compact = false,
  className = "",
}: PhoneInputWithCountryProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]); // Default US
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Sync selected country if the phone number starts with a dial code
  useEffect(() => {
    if (value && value.trim().startsWith("+")) {
      const digits = value.replace(/\D/g, "");
      const match = COUNTRIES.find((c) => {
        const codeDigits = c.dial_code.replace(/\D/g, "");
        return digits.startsWith(codeDigits);
      });
      if (match && match.code !== selectedCountry.code) {
        setSelectedCountry(match);
      }
    }
  }, [value]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dial_code.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers, spaces, +, -, (, ), .
    const clean = e.target.value.replace(/[^0-9+\-()\s.]/g, "");
    onChange?.(clean);
  };

  return (
    <div className={`relative ${compact ? "w-full" : "max-w-xl"} ${className}`}>
      {/* Input container matching Typeform design */}
      <div
        className={`flex items-center gap-2.5 transition-colors ${
          compact
            ? "border-b border-gray-300 focus-within:border-black py-1.5"
            : "border-b-2 border-gray-300 focus-within:border-black py-2.5"
        }`}
      >
        {/* Country selector button: us ⌄ | */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            setSearch("");
          }}
          className={`flex items-center gap-1.5 text-gray-700 hover:text-black font-medium shrink-0 cursor-pointer select-none outline-none group ${
            compact ? "text-base" : "text-lg"
          }`}
          title="Select country code"
        >
          <span className="lowercase text-gray-700 font-normal tracking-wide">
            {selectedCountry.code}
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className={`text-gray-400 group-hover:text-gray-600 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
          <span className="text-gray-300 ml-0.5 font-light">|</span>
        </button>

        {/* Actual phone number input */}
        <input
          ref={phoneInputRef}
          type="tel"
          autoFocus={autoFocus}
          placeholder={selectedCountry.format || "(201) 555-0123"}
          value={value}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") onEnter?.();
          }}
          className={`w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-300 font-light ${
            compact ? "text-lg" : "text-2xl"
          }`}
        />
      </div>

      {/* Country Selection Dropdown Modal matching Image 2 */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200/90 p-3 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Search box with search icon */}
          <div className="relative mb-2">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search countries"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:border-gray-400 rounded-xl py-2 pl-3.5 pr-8 text-sm outline-none text-gray-800 placeholder:text-gray-400"
            />
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          {/* Countries list */}
          <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 select-none">
            {filteredCountries.length === 0 ? (
              <div className="text-center py-4 text-xs text-gray-400">No countries found</div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = selectedCountry.code === c.code;
                return (
                  <div
                    key={c.code}
                    onClick={() => {
                      setSelectedCountry(c);
                      setIsOpen(false);
                      setTimeout(() => phoneInputRef.current?.focus(), 50);
                    }}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? "border-2 border-black bg-white shadow-xs"
                        : "border border-transparent bg-gray-100/80 hover:bg-gray-200/70"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl shrink-0 leading-none">{c.flag}</span>
                      <span className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                        {c.name}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-gray-500 shrink-0 ml-2">
                      {c.dial_code}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
