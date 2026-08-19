"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Filter, RotateCcw, Sparkles } from "lucide-react";

export function QuickFilterBar() {
  const router = useRouter();
  const [activePopover, setActivePopover] = useState<string | null>(null);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [selectedRating, setSelectedRating] = useState("");

  const togglePopover = (name: string) => {
    setActivePopover(activePopover === name ? null : name);
  };

  const applyFilters = () => {
    setActivePopover(null);
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedPrice) {
      const [min, max] = selectedPrice.split("-");
      if (min) params.set("minPrice", min);
      if (max) params.set("maxPrice", max);
    }
    if (selectedCondition) params.set("condition", selectedCondition);
    if (selectedRating) params.set("minRating", selectedRating);
    router.push(`/books?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedPrice("");
    setSelectedCondition("");
    setSelectedRating("");
    setActivePopover(null);
    router.push("/books");
  };

  return (
    <div className="w-full bg-background/95 backdrop-blur-md border-b border-border/80 py-2.5 px-3 sm:px-6 lg:px-8 transition-colors font-sans shadow-2xs">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-3">
        {/* Desktop Filter Pills */}
        <div className="hidden sm:flex items-center space-x-3 overflow-x-auto no-scrollbar">
          <span className="text-xs font-extrabold uppercase tracking-wider text-text-muted shrink-0 mr-1 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-secondary" /> Quick Filter:
          </span>

          {/* Category Filter */}
          <div className="relative">
            <button
              onClick={() => togglePopover("category")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center space-x-1.5 ${
                selectedCategory
                  ? "border-secondary bg-secondary/10 text-secondary"
                  : "border-border bg-card text-text-secondary hover:bg-background-subtle"
              }`}
            >
              <span>
                {selectedCategory
                  ? `Category: ${selectedCategory}`
                  : "Category"}
              </span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {activePopover === "category" && (
              <div className="absolute top-full left-0 mt-2 w-52 p-3.5 bg-card border border-border rounded-2xl shadow-xl z-50 space-y-2">
                <div className="text-[10px] font-extrabold uppercase text-text-muted">
                  Select Subject
                </div>
                {[
                  { label: "Engineering & CS", val: "engineering-cs" },
                  { label: "Exams & Study", val: "competitive-exams" },
                  { label: "Medical & Health", val: "medical-healthcare" },
                  { label: "Management & Biz", val: "management-business" },
                  { label: "School Books", val: "school-textbooks" },
                  { label: "Literature & Fiction", val: "indian-literature" },
                ].map((c) => (
                  <label
                    key={c.val}
                    className="flex items-center space-x-2 text-xs font-semibold cursor-pointer hover:text-secondary"
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === c.val}
                      onChange={() => setSelectedCategory(c.val)}
                      className="text-secondary focus:ring-secondary accent-secondary"
                    />
                    <span>{c.label}</span>
                  </label>
                ))}
                <button
                  onClick={applyFilters}
                  className="w-full mt-2 py-2 bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider rounded-xl shadow-2xs"
                >
                  Apply Filter
                </button>
              </div>
            )}
          </div>

          {/* Price Range Filter */}
          <div className="relative">
            <button
              onClick={() => togglePopover("price")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center space-x-1.5 ${
                selectedPrice
                  ? "border-secondary bg-secondary/10 text-secondary"
                  : "border-border bg-card text-text-secondary hover:bg-background-subtle"
              }`}
            >
              <span>
                {selectedPrice
                  ? `Price: ${
                      selectedPrice === "0-200"
                        ? "Under ₹200"
                        : selectedPrice === "200-500"
                          ? "₹200 - ₹500"
                          : "Over ₹500"
                    }`
                  : "Price Range"}
              </span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {activePopover === "price" && (
              <div className="absolute top-full left-0 mt-2 w-48 p-3.5 bg-card border border-border rounded-2xl shadow-xl z-50 space-y-2">
                <div className="text-[10px] font-extrabold uppercase text-text-muted">
                  Select Price Range
                </div>
                {[
                  { label: "Under ₹200", val: "0-200" },
                  { label: "₹200 to ₹500", val: "200-500" },
                  { label: "Over ₹500", val: "500-2000" },
                ].map((p) => (
                  <label
                    key={p.val}
                    className="flex items-center space-x-2 text-xs font-semibold cursor-pointer hover:text-secondary"
                  >
                    <input
                      type="radio"
                      name="price"
                      checked={selectedPrice === p.val}
                      onChange={() => setSelectedPrice(p.val)}
                      className="text-secondary focus:ring-secondary accent-secondary"
                    />
                    <span>{p.label}</span>
                  </label>
                ))}
                <button
                  onClick={applyFilters}
                  className="w-full mt-2 py-2 bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider rounded-xl shadow-2xs"
                >
                  Apply Filter
                </button>
              </div>
            )}
          </div>

          {/* Reset button */}
          {(selectedCategory ||
            selectedPrice ||
            selectedCondition ||
            selectedRating) && (
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-text-muted hover:text-danger flex items-center space-x-1 underline pl-2"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Mobile Horizontal App-like Filter Bar */}
        <div className="sm:hidden w-full flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => router.push("/books")}
            className="px-3 py-1.5 bg-secondary text-secondary-foreground text-xs font-extrabold rounded-full flex items-center space-x-1 shrink-0 shadow-2xs"
          >
            <Filter className="h-3 w-3" />
            <span>All Catalog Filters</span>
          </button>

          <button
            onClick={() => router.push("/books?category=engineering-cs")}
            className="px-3 py-1.5 bg-card border border-border text-text-primary text-xs font-bold rounded-full shrink-0"
          >
            Engineering
          </button>
          <button
            onClick={() => router.push("/books?search=NEET")}
            className="px-3 py-1.5 bg-card border border-border text-text-primary text-xs font-bold rounded-full shrink-0"
          >
            NEET
          </button>
          <button
            onClick={() => router.push("/books?maxPrice=200")}
            className="px-3 py-1.5 bg-card border border-border text-text-primary text-xs font-bold rounded-full shrink-0"
          >
            Under ₹200
          </button>
          <button
            onClick={() => router.push("/books?discount=50")}
            className="px-3 py-1.5 bg-card border border-border text-secondary text-xs font-bold rounded-full shrink-0 flex items-center gap-1"
          >
            <Sparkles className="h-3 w-3 text-secondary" />
            <span>50% Off</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuickFilterBar;
