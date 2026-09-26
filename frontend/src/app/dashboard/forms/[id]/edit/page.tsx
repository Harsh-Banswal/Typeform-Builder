"use client";
import React, { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { toast, Toaster } from "sonner";
import { useParams, useRouter } from "next/navigation";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragOverlay
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LivePreviewModal } from "@/components/LivePreviewModal";

// ─── Icon components (inline SVGs for exact Typeform look) ───────────────────
const IconShortText = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/></svg>
);
const IconLongText = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="15" y2="18"/></svg>
);
const IconMultiChoice = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="8 12 11 15 16 10"/></svg>
);
const IconDropdown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
);
const IconEmail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>
);
const IconNumber = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="3" x2="12" y2="21"/><path d="M6 9l6-6 6 6"/><path d="M6 15l6 6 6-6"/></svg>
);
const IconYesNo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg>
);
const IconRating = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);
const IconWebsite = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
);

const IconLegal = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
    <path d="M7 21h10"/>
    <path d="M12 3v18"/>
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
  </svg>
);

const IconNPS = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.34 17a10 10 0 1 1 17.32 0" />
    <path d="m14 12-4-2" />
    <circle cx="12" cy="14" r="1.5" />
  </svg>
);

const IconOpinionScale = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 20V10M12 20V4M6 20v-8" />
    <line x1="3" y1="20" x2="21" y2="20" />
  </svg>
);

const IconRanking = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7h1v3M4 10h2" />
    <path d="M4 14h2l-2 3h2" />
    <line x1="11" y1="8" x2="19" y2="8" />
    <line x1="11" y1="16" x2="19" y2="16" />
  </svg>
);

const IconMatrix = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="1.5" />
    <circle cx="12" cy="6" r="1.5" />
    <circle cx="18" cy="6" r="1.5" />
    <circle cx="6" cy="12" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="18" cy="12" r="1.5" />
    <circle cx="6" cy="18" r="1.5" />
    <circle cx="12" cy="18" r="1.5" />
    <circle cx="18" cy="18" r="1.5" />
  </svg>
);

const renderRatingShape = (shape: string, filled = false, size = 34) => {
  switch (shape) {
    case "heart":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      );
    case "thumb_up":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 10v12M15 10.5a3 3 0 0 0-3-3l-2-5-2 2v6H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h13.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4" />
        </svg>
      );
    case "crown":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
        </svg>
      );
    case "circle":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
    case "star":
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
  }
};

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  short_text:         { label: "Short Text",          icon: <IconShortText />,   color: "#3B82F6", bg: "#EFF6FF" },
  long_text:          { label: "Long Text",           icon: <IconLongText />,    color: "#8B5CF6", bg: "#F5F3FF" },
  multiple_choice:    { label: "Multiple Choice",     icon: <IconMultiChoice />, color: "#10B981", bg: "#ECFDF5" },
  dropdown:           { label: "Dropdown",            icon: <IconDropdown />,    color: "#7C3AED", bg: "#EDE9FE" },
  email:              { label: "Email",               icon: <IconEmail />,       color: "#F59E0B", bg: "#FFFBEB" },
  number:             { label: "Number",              icon: <IconNumber />,      color: "#EF4444", bg: "#FEF2F2" },
  yes_no:             { label: "Yes/No",              icon: <IconYesNo />,       color: "#14B8A6", bg: "#F0FDFA" },
  legal:              { label: "Legal",               icon: <IconLegal />,       color: "#7C3AED", bg: "#EDE9FE" },
  rating:             { label: "Rating",              icon: <IconRating />,      color: "#15803D", bg: "#DCFCE7" },
  phone_number:       { label: "Phone Number",        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.94-1.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>, color: "#F97316", bg: "#FFF7ED" },
  address:            { label: "Address",             icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7l-6 10h12z"/></svg>, color: "#0043CE", bg: "#D0E2FF" },
  website:            { label: "Website",             icon: <IconWebsite />,     color: "#BE185D", bg: "#FCE7F3" },
  picture_choice:     { label: "Picture Choice",      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>, color: "#10B981", bg: "#ECFDF5" },
  checkbox:           { label: "Checkbox",            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>, color: "#10B981", bg: "#ECFDF5" },
  net_promoter_score: { label: "Net Promoter Score®", icon: <IconNPS />,         color: "#15803D", bg: "#DCFCE7" },
  opinion_scale:      { label: "Opinion Scale",       icon: <IconOpinionScale />, color: "#15803D", bg: "#DCFCE7" },
  ranking:            { label: "Ranking",             icon: <IconRanking />,      color: "#15803D", bg: "#DCFCE7" },
  matrix:             { label: "Matrix",              icon: <IconMatrix />,       color: "#15803D", bg: "#DCFCE7" },
  contact_info:       { label: "Contact Info",        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><circle cx="12" cy="10" r="3"/><path d="M7 20v-2a5 5 0 0 1 10 0v2"/></svg>, color: "#FFFFFF", bg: "#111827" },
};

// ─── Add Content Modal ───────────────────────────────────────────────────────
const MODAL_TABS = ["Add form elements", "Import questions"] as const;

const RECOMMENDED = ["short_text", "multiple_choice", "email"];

// Full Typeform-style category map. Functional ones map to a backend type, others are "pro"
const CATEGORIES: { label: string; items: { label: string; type?: string; icon: React.ReactNode; pro?: boolean }[] }[] = [
  {
    label: "Contact info",
    items: [
      { label: "Contact Info", type: "contact_info", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2.5"/><path d="M5 16v-.5a3.5 3.5 0 0 1 7 0v.5"/><line x1="14" y1="9" x2="19" y2="9"/><line x1="14" y1="13" x2="17" y2="13"/></svg> },
      { label: "Email", type: "email", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg> },
      { label: "Short Text", type: "short_text", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/></svg> },
      { label: "Phone Number", type: "phone_number", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.94-1.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> },
      { label: "Address", type: "address", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7l-6 10h12z"/></svg> },
      { label: "Website", type: "website", icon: <IconWebsite /> },
    ],
  },
  {
    label: "Choice",
    items: [
      { label: "Multiple Choice", type: "multiple_choice", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="8 12 11 15 16 10"/></svg> },
      { label: "Dropdown", type: "dropdown", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg> },
      { label: "Yes/No", type: "yes_no", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg> },
      { label: "Legal", type: "legal", icon: <IconLegal /> },
      { label: "Picture Choice", type: "picture_choice", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> },
      { label: "Checkbox", type: "checkbox", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
    ],
  },
  {
    label: "Rating & ranking",
    items: [
      { label: "Net Promoter Score®", type: "net_promoter_score", icon: <IconNPS /> },
      { label: "Opinion Scale", type: "opinion_scale", icon: <IconOpinionScale /> },
      { label: "Rating", type: "rating", icon: <IconRating /> },
      { label: "Ranking", type: "ranking", icon: <IconRanking /> },
      { label: "Matrix", type: "matrix", icon: <IconMatrix /> },
    ],
  },
];

// Color per category
const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  "Contact info":     { color: "#F97316", bg: "#FFF7ED" },
  "Choice":           { color: "#10B981", bg: "#ECFDF5" },
  "Rating & ranking": { color: "#15803D", bg: "#DCFCE7" },
};

function AddContentModal({ onClose, onAdd, onImport }: { onClose: () => void; onAdd: (type: string) => void; onImport: (lines: string[]) => void }) {
  const [activeTab, setActiveTab] = React.useState<typeof MODAL_TABS[number]>("Add form elements");
  const [search, setSearch] = React.useState("");

  // Flatten all items for search
  const allItems = CATEGORIES.flatMap(cat => cat.items.map(it => ({ ...it, category: cat.label })));
  const filtered = search
    ? allItems.filter(it => it.label.toLowerCase().includes(search.toLowerCase()))
    : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-[820px] max-h-[580px] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal tabs header */}
        <div className="flex items-center border-b border-gray-200 px-6 pt-4 gap-1">
          {MODAL_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-t border-b-2 transition-colors -mb-px ${
                activeTab === tab
                  ? "text-gray-900 border-gray-900"
                  : "text-gray-400 border-transparent hover:text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
          <button onClick={onClose} className="ml-auto mb-2 p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {activeTab === "Add form elements" ? (
          <div className="flex flex-1 overflow-hidden">
            {/* Left sidebar */}
            <div className="w-52 border-r border-gray-100 p-4 shrink-0 flex flex-col gap-4 overflow-y-auto">
              {/* Search */}
              <div className="relative">
                <svg className="absolute left-2.5 top-2.5 text-gray-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search form elements"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors"
                />
              </div>

              {!search && (
                <>
                  {/* Recommended */}
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-2">Recommended</div>
                    <div className="space-y-1">
                      {RECOMMENDED.map(typeId => {
                        const cfg = TYPE_CONFIG[typeId];
                        return (
                          <button
                            key={typeId}
                            onClick={() => { onAdd(typeId); onClose(); }}
                            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="w-6 h-6 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                              {cfg.icon}
                            </div>
                            <span className="text-sm text-gray-700">{cfg.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Connect to apps removed */}
                </>
              )}

              {/* Search results in sidebar */}
              {filtered && (
                <div>
                  <div className="text-xs font-semibold text-gray-400 mb-2">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</div>
                  <div className="space-y-1">
                    {filtered.map((it, i) => {
                      const catColor = CATEGORY_COLORS[it.category] || { color: "#6B7280", bg: "#F3F4F6" };
                      return (
                        <button
                          key={i}
                          onClick={() => { if (it.type) { onAdd(it.type); onClose(); } }}
                          disabled={!it.type}
                          className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors text-left ${it.type ? "hover:bg-gray-50 cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
                        >
                          <div className="w-6 h-6 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: catColor.bg, color: catColor.color }}>
                            {it.icon}
                          </div>
                          <span className="text-sm text-gray-700">{it.label}</span>
                          {it.pro && <span className="ml-auto text-[9px] font-bold bg-gray-200 text-gray-500 px-1 py-0.5 rounded uppercase shrink-0">Pro</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right content — categorized grid */}
            {!search && (
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-3 gap-x-8 gap-y-6">
                  {CATEGORIES.map(cat => {
                    const catColor = CATEGORY_COLORS[cat.label] || { color: "#6B7280", bg: "#F3F4F6" };
                    return (
                      <div key={cat.label}>
                        <div className="text-xs font-semibold text-gray-500 mb-2.5 uppercase tracking-wide">{cat.label}</div>
                        <div className="space-y-0.5">
                          {cat.items.map((item, i) => (
                            <button
                              key={i}
                              onClick={() => { if (item.type) { onAdd(item.type); onClose(); } }}
                              disabled={!item.type}
                              className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors ${
                                item.type
                                  ? "hover:bg-gray-50 cursor-pointer"
                                  : "opacity-40 cursor-not-allowed"
                              }`}
                            >
                              <div
                                className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                                style={{ backgroundColor: catColor.bg, color: catColor.color }}
                              >
                                {item.icon}
                              </div>
                              <span className="text-sm text-gray-700">{item.label}</span>
                              {item.pro && (
                                <span className="ml-auto text-[9px] font-bold bg-gray-100 text-gray-400 px-1 py-0.5 rounded uppercase shrink-0">Pro</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : activeTab === "Import questions" ? (
          <div className="flex-1 flex flex-col p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Import Questions</h3>
            <p className="text-sm text-gray-500 mb-4">Paste your questions below, one per line. They will be imported as Short Text questions.</p>
            <textarea
              className="flex-1 w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-blue-400 outline-none resize-none"
              placeholder="What is your name?&#10;How old are you?"
              id="import-text"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  const text = (document.getElementById("import-text") as HTMLTextAreaElement)?.value;
                  if (text) {
                    const lines = text.split("\n").filter(l => l.trim().length > 0);
                    if (lines.length > 0) {
                      onImport(lines);
                      onClose();
                    }
                  }
                }}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Import
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ─── Three-dots Popup Menu ───────────────────────────────────────────────────
function QuestionActionsMenu({
  index,
  totalQuestions,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete
}: any) {
  const isFirst = index === 0;
  const isLast = index === totalQuestions - 1;
  const isNearBottom = totalQuestions > 3 && index >= totalQuestions - 2;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className={`absolute right-1 ${isNearBottom ? "bottom-8" : "top-8"} z-50 min-w-[148px] bg-white rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.14),0_2px_6px_rgba(0,0,0,0.06)] border border-gray-200/90 p-1.5 flex flex-col gap-0.5 text-xs font-medium text-gray-700 animate-in fade-in zoom-in-95 duration-100`}
    >
      <button
        type="button"
        disabled={isFirst}
        onClick={(e) => {
          e.stopPropagation();
          onMoveUp();
        }}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100/80 disabled:opacity-30 disabled:hover:bg-transparent text-left transition-colors cursor-pointer"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m18 15-6-6-6 6"/></svg>
        <span>Move up</span>
      </button>

      <button
        type="button"
        disabled={isLast}
        onClick={(e) => {
          e.stopPropagation();
          onMoveDown();
        }}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100/80 disabled:opacity-30 disabled:hover:bg-transparent text-left transition-colors cursor-pointer"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
        <span>Move down</span>
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate();
        }}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100/80 text-left transition-colors cursor-pointer"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect width="11" height="11" x="9" y="9" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          <line x1="14.5" y1="12" x2="14.5" y2="17"/>
          <line x1="12" y1="14.5" x2="17" y2="14.5"/>
        </svg>
        <span>Duplicate</span>
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-50 text-[#C2410C] text-left transition-colors cursor-pointer"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          <line x1="10" y1="11" x2="10" y2="17"/>
          <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
        <span>Delete</span>
      </button>
    </div>
  );
}

// ─── Sortable question item (left sidebar) ───────────────────────────────────
function QuestionSidebarItem({
  id,
  question,
  index,
  totalQuestions,
  isSelected,
  selectedSubField,
  onSelectSubField,
  onClick,
  menuOpen,
  onToggleMenu,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete
}: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const cfg = TYPE_CONFIG[question.type] || TYPE_CONFIG.short_text;

  const isContact = question.type === "contact_info";
  const isAddress = question.type === "address";

  if (isAddress) {
    const addressSubFields = [
      { id: "address", key: "A", label: "Address", placeholder: "65 Hansen Way" },
      { id: "address_line_2", key: "B", label: "Address line 2", placeholder: "Apartment 4" },
      { id: "city", key: "C", label: "City/Town", placeholder: "Palo Alto" },
      { id: "state", key: "D", label: "State/Region/Provi...", placeholder: "California" },
      { id: "zip", key: "E", label: "Zip/Post code", placeholder: "94304" },
      { id: "country", key: "F", label: "Country", placeholder: "United States" },
    ];

    if (isDragging) {
      return (
        <div ref={setNodeRef} style={style} className="my-1.5 relative w-full">
          <div className="h-[1.5px] bg-gray-500 rounded-full w-full mb-1 opacity-70" />
          <div className="min-h-[44px] rounded-xl bg-[#ECECEF] border border-gray-200/50 w-full" />
        </div>
      );
    }

    return (
      <div className="mb-2 relative">
        <div 
          ref={setNodeRef} 
          style={style} 
          {...attributes}
          {...listeners}
          className="bg-[#F8F9FA] border border-gray-200/90 rounded-2xl p-2 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)] cursor-pointer"
        >
          {/* Parent Address row */}
          <div 
            onClick={onClick}
            className="group flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer bg-[#ECECEF] hover:bg-[#E4E4E7] transition-colors relative"
          >
            <div className="flex items-center gap-2.5">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" className="text-gray-600">
                <path d="M12 7l-6 10h12z"/>
              </svg>
              <span className="text-[13px] font-medium text-gray-800 truncate">
                {question.title || "Address"}
              </span>
            </div>
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onToggleMenu?.();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
              </svg>
            </div>

            {menuOpen && (
              <QuestionActionsMenu
                index={index}
                totalQuestions={totalQuestions}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
              />
            )}
          </div>

          {/* 6 sub-fields list */}
          <div className="mt-1 space-y-1">
            {addressSubFields.map(field => {
              const active = isSelected && (selectedSubField === field.id || (!selectedSubField && field.id === "address"));
              return (
                <div
                  key={field.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                    onSelectSubField?.(field.id);
                  }}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer transition-all duration-100 text-xs font-medium ${
                    active
                      ? "border border-[#262627] bg-[#F4F4F5] text-gray-900 shadow-sm"
                      : "border border-transparent hover:bg-gray-100/70 text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1.5 shrink-0 bg-[#D0E2FF] text-[#0043CE]">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="4" y1="9" x2="20" y2="9"/>
                        <line x1="4" y1="15" x2="20" y2="15"/>
                      </svg>
                      <span>{field.key}</span>
                    </div>
                    <span className="truncate">{field.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (isContact) {
    const subFields = [
      { id: "first_name", key: "A", label: "First name", color: "#0043CE", bg: "#D0E2FF", type: "text" },
      { id: "last_name", key: "B", label: "Last name", color: "#0043CE", bg: "#D0E2FF", type: "text" },
      { id: "phone_number", key: "C", label: "Phone number", color: "#9F1853", bg: "#FFD6E8", type: "phone" },
      { id: "email", key: "D", label: "Email", color: "#9F1853", bg: "#FFD6E8", type: "email" },
      { id: "company", key: "E", label: "Company", color: "#0043CE", bg: "#D0E2FF", type: "text" },
    ];

    if (isDragging) {
      return (
        <div ref={setNodeRef} style={style} className="my-1.5 relative w-full">
          <div className="h-[1.5px] bg-gray-500 rounded-full w-full mb-1 opacity-70" />
          <div className="min-h-[44px] rounded-xl bg-[#ECECEF] border border-gray-200/50 w-full" />
        </div>
      );
    }

    return (
      <div className="mb-2 relative">
        <div 
          ref={setNodeRef} 
          style={style} 
          {...attributes}
          {...listeners}
          className="bg-[#F8F9FA] border border-gray-200/90 rounded-2xl p-2 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)] cursor-pointer"
        >
          {/* Parent Contact Info row */}
          <div 
            onClick={onClick}
            className="group flex items-center justify-between px-1.5 py-1.5 rounded-lg cursor-pointer hover:bg-gray-100/70 transition-colors relative"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex items-center gap-1.5 bg-[#E4E4E7] text-gray-700 px-2 py-0.5 rounded-md text-[11px] font-bold shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 6h2v2H4zm0 5h2v2H4zm0 5h2v2H4zm0 5h2v2H4zm6-5h10v2H10zm0-5h10v2H10zm0 10h10v2H10z"/>
                </svg>
                <span>{index + 1}</span>
              </div>
              <span className="text-[13px] font-medium text-gray-800 truncate">
                {question.title || "Contact Info"}
              </span>
            </div>

            <div 
              onClick={(e) => {
                e.stopPropagation();
                onToggleMenu?.();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
              </svg>
            </div>

            {menuOpen && (
              <QuestionActionsMenu
                index={index}
                totalQuestions={totalQuestions}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
              />
            )}
          </div>

          {/* 5 sub-fields list */}
          <div className="mt-1 space-y-1">
            {subFields.map(field => {
              const active = isSelected && (selectedSubField === field.id || (!selectedSubField && field.id === "phone_number"));
              return (
                <div
                  key={field.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                    onSelectSubField?.(field.id);
                  }}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl cursor-pointer transition-all duration-100 text-xs font-medium ${
                    active
                      ? "border border-[#262627] bg-[#F4F4F5] text-gray-900 shadow-sm"
                      : "border border-transparent hover:bg-gray-100/70 text-gray-700"
                  }`}
                >
                  <div
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1.5 shrink-0"
                    style={{ backgroundColor: field.bg, color: field.color }}
                  >
                    {field.type === "text" && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="4" y1="9" x2="20" y2="9"/>
                        <line x1="4" y1="15" x2="20" y2="15"/>
                      </svg>
                    )}
                    {field.type === "phone" && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.94-1.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    )}
                    {field.type === "email" && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <path d="m22 7-10 7L2 7"/>
                      </svg>
                    )}
                    <span>{field.key}</span>
                  </div>
                  <span className="truncate">{field.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (isDragging) {
    return (
      <div ref={setNodeRef} style={style} className="my-1.5 relative w-full">
        <div className="h-[1.5px] bg-gray-500 rounded-full w-full mb-1 opacity-70" />
        <div className="min-h-[42px] rounded-xl bg-[#EDEDEF] border border-gray-200/50 w-full" />
      </div>
    );
  }

  return (
    <div className="mb-1 relative">
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={onClick}
        className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-100 min-h-[42px] ${
          isSelected
            ? "bg-[#ECECEF] border border-gray-300/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            : "hover:bg-gray-100/70 border border-transparent"
        }`}
      >
        {/* Number badge with icon */}
        <div
          className="px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1.5 shrink-0"
          style={{ backgroundColor: cfg.bg, color: cfg.color }}
        >
          <div className="shrink-0">{cfg.icon}</div>
          <span>{index + 1}</span>
        </div>

        {/* Title */}
        <div className="flex-1 truncate text-xs text-gray-700 min-w-0 font-medium">
          {question.title || "..."}
        </div>

        {/* Three dots menu button */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleMenu?.();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="text-gray-400 hover:text-gray-600 cursor-pointer p-0.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity ml-auto"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
          </svg>
        </div>

        {menuOpen && (
          <QuestionActionsMenu
            index={index}
            totalQuestions={totalQuestions}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        )}
      </div>
    </div>
  );
}

// ─── Center canvas — question preview ────────────────────────────────────────
function QuestionCanvas({ question, index, onUpdate, previewMode, selectedSubField, onSelectSubField, onOpenDropdownModal }: any) {
  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4 opacity-30"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
        <p className="text-sm">Select a question to preview</p>
      </div>
    );
  }

  const cfg = TYPE_CONFIG[question.type] || TYPE_CONFIG.short_text;
  const isContact = question.type === "contact_info";
  const isAddress = question.type === "address";

  const isMobile = previewMode === "mobile";

  const content = (
    <div className={`w-full mx-auto my-auto flex flex-col justify-center transition-all duration-300 ${isMobile ? "px-2 py-4" : "min-h-full py-12 px-6 max-w-2xl"}`}>
      {/* Question header with number */}
      <div className="flex items-start gap-3.5 mb-8">
        <div className="w-5 h-5 rounded bg-[#18181B] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-1">
          {index + 1}
        </div>
        <div className="flex-1">
          <div className="flex items-center">
            <input 
              type="text"
              value={question.title ?? (isContact ? "Contact Info" : isAddress ? "Address" : "")}
              onChange={e => onUpdate({ title: e.target.value })}
              placeholder={isContact ? "Contact Info" : isAddress ? "Address" : "Your question here. Recall information with @"}
              className="text-2xl font-light text-gray-900 leading-snug mb-1 bg-transparent outline-none w-full placeholder-gray-400 placeholder:italic italic"
            />
            {question.required && <span className="text-red-500 ml-2 text-xl">*</span>}
          </div>
          <input 
            type="text"
            value={question.help_text || ""}
            onChange={e => onUpdate({ help_text: e.target.value })}
            placeholder="Description (optional)"
            className="text-gray-500 text-base mt-1 bg-transparent outline-none w-full placeholder-gray-300 italic"
          />
        </div>
      </div>

      {/* Answer area */}
      <div className="ml-9">
        {(question.type === "short_text" || question.type === "email" || question.type === "number") && (
          <div className="border-b-2 border-gray-300 pb-1">
            <input
              readOnly
              placeholder={
                question.type === "email" ? "name@example.com" :
                question.type === "number" ? "Type a number..." :
                "Type your answer here..."
              }
              className="w-full text-xl bg-transparent outline-none text-gray-400 placeholder-gray-300 cursor-default"
            />
          </div>
        )}

        {question.type === "website" && (
          <div className="w-full max-w-xl">
            <div className="border-b border-gray-300 pb-2">
              <input
                readOnly
                placeholder={question.config?.custom_placeholder_text || "https://"}
                className="w-full text-2xl font-light bg-transparent outline-none text-gray-400 placeholder-gray-400 cursor-default"
              />
            </div>
          </div>
        )}

        {question.type === "long_text" && (
          <div className="border-b-2 border-gray-300 pb-1">
            <textarea
              readOnly
              placeholder="Type your answer here..."
              rows={3}
              className="w-full text-xl bg-transparent outline-none resize-none text-gray-400 placeholder-gray-300 cursor-default"
            />
          </div>
        )}

        {isAddress && (
          <div className="space-y-8 mt-6">
            {[
              { id: "address", label: "Address", placeholder: "65 Hansen Way" },
              { id: "address_line_2", label: "Address line 2", placeholder: "Apartment 4" },
              { id: "city", label: "City/Town", placeholder: "Palo Alto" },
              { id: "state", label: "State/Region/Province", placeholder: "California" },
              { id: "zip", label: "Zip/Post code", placeholder: "94304" },
              { id: "country", label: "Country", placeholder: "United States" },
            ].map(field => {
              const active = selectedSubField === field.id || (!selectedSubField && field.id === "address");
              return (
                <div 
                  key={field.id}
                  onClick={() => onSelectSubField?.(field.id)}
                  className="cursor-pointer"
                >
                  <label className="text-xs font-semibold text-gray-500 mb-2 block">{field.label}</label>
                  <div className={`border-b-2 pb-1.5 transition-colors ${active ? "border-gray-900" : "border-gray-200"}`}>
                    <input
                      readOnly
                      placeholder={field.placeholder}
                      className="w-full text-xl bg-transparent outline-none text-gray-400 placeholder-gray-400 cursor-default font-light"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {question.type === "phone_number" && (
          <div className="border-b-2 border-gray-300 pb-2 flex items-center gap-2 max-w-xl">
            <div className="flex items-center gap-1.5 text-gray-700 pr-2">
              <span className="text-lg lowercase font-normal text-gray-700">us</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400"><path d="m6 9 6 6 6-6"/></svg>
              <span className="text-gray-300 ml-1 font-light">|</span>
            </div>
            <input
              readOnly
              placeholder="(201) 555-0123"
              className="w-full text-2xl bg-transparent outline-none text-gray-400 placeholder-gray-300 cursor-default font-light"
            />
          </div>
        )}

        {isContact && (
          <div className="space-y-8 mt-6">
            <div 
              onClick={() => onSelectSubField?.("first_name")}
              className="cursor-pointer"
            >
              <label className="text-xs font-semibold text-gray-500 mb-2 block">First name</label>
              <div className={`border-b-2 pb-1.5 transition-colors ${selectedSubField === "first_name" ? "border-gray-900" : "border-gray-200"}`}>
                <input
                  readOnly
                  placeholder="Jane"
                  className="w-full text-xl bg-transparent outline-none text-gray-400 placeholder-gray-300 cursor-default font-light"
                />
              </div>
            </div>
            <div 
              onClick={() => onSelectSubField?.("last_name")}
              className="cursor-pointer"
            >
              <label className="text-xs font-semibold text-gray-500 mb-2 block">Last name</label>
              <div className={`border-b-2 pb-1.5 transition-colors ${selectedSubField === "last_name" ? "border-gray-900" : "border-gray-200"}`}>
                <input
                  readOnly
                  placeholder="Smith"
                  className="w-full text-xl bg-transparent outline-none text-gray-400 placeholder-gray-300 cursor-default font-light"
                />
              </div>
            </div>
            <div 
              onClick={() => onSelectSubField?.("phone_number")}
              className="cursor-pointer"
            >
              <label className="text-xs font-semibold text-gray-500 mb-2 block">Phone number</label>
              <div className={`border-b-2 pb-2 flex items-center gap-2 transition-colors ${selectedSubField === "phone_number" ? "border-gray-900" : "border-gray-200"}`}>
                <div className="flex items-center gap-1.5 text-gray-700 pr-2">
                  <span className="text-lg lowercase font-normal text-gray-700">us</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400"><path d="m6 9 6 6 6-6"/></svg>
                  <span className="text-gray-300 ml-1 font-light">|</span>
                </div>
                <input
                  readOnly
                  placeholder="(201) 555-0123"
                  className="w-full text-2xl bg-transparent outline-none text-gray-400 placeholder-gray-300 cursor-default font-light"
                />
              </div>
            </div>
            <div 
              onClick={() => onSelectSubField?.("email")}
              className="cursor-pointer"
            >
              <label className="text-xs font-semibold text-gray-500 mb-2 block">Email</label>
              <div className={`border-b-2 pb-1.5 transition-colors ${selectedSubField === "email" ? "border-gray-900" : "border-gray-200"}`}>
                <input
                  readOnly
                  placeholder="name@example.com"
                  className="w-full text-xl bg-transparent outline-none text-gray-400 placeholder-gray-300 cursor-default font-light"
                />
              </div>
            </div>
            <div 
              onClick={() => onSelectSubField?.("company")}
              className="cursor-pointer"
            >
              <label className="text-xs font-semibold text-gray-500 mb-2 block">Company</label>
              <div className={`border-b-2 pb-1.5 transition-colors ${selectedSubField === "company" ? "border-gray-900" : "border-gray-200"}`}>
                <input
                  readOnly
                  placeholder="Acme Corporation"
                  className="w-full text-xl bg-transparent outline-none text-gray-400 placeholder-gray-300 cursor-default font-light"
                />
              </div>
            </div>
          </div>
        )}

        {question.type === "multiple_choice" && (
          <div className="space-y-2 mt-4">
            {(question.options || []).map((opt: string, i: number) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-[#F3F3F3] rounded-lg group relative max-w-md">
                <div className="absolute -left-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    className="text-gray-400 hover:text-red-500 p-1"
                    onClick={() => onUpdate({ options: question.options.filter((_: any, idx: number) => idx !== i) })}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                </div>
                <div className="w-6 h-6 rounded border border-gray-300 bg-white flex items-center justify-center text-[11px] font-semibold text-gray-500 shrink-0 shadow-sm">
                  {String.fromCharCode(65 + i)}
                </div>
                <input 
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...question.options];
                    newOpts[i] = e.target.value;
                    onUpdate({ options: newOpts });
                  }}
                  placeholder="choice"
                  className="bg-transparent outline-none flex-1 text-sm text-gray-800 placeholder-gray-400 font-medium"
                />
              </div>
            ))}
            <div className="pt-1 pl-1">
              <button 
                className="text-xs text-gray-500 underline hover:text-gray-700"
                onClick={() => onUpdate({ options: [...(question.options || []), ""] })}
              >
                Add choice
              </button>
            </div>
          </div>
        )}

        {question.type === "checkbox" && (
          <div className="space-y-2.5 mt-2">
            {(question.options || []).map((opt: string, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors">
                <div className="w-7 h-7 rounded border border-gray-300 bg-white flex items-center justify-center text-xs font-semibold text-gray-500">
                  {String.fromCharCode(65 + i)}
                </div>
                <span className="text-gray-700">{opt || `Option ${i + 1}`}</span>
              </div>
            ))}
            {(!question.options || question.options.length === 0) && (
              <div className="text-gray-400 italic text-sm">No choices added yet</div>
            )}
          </div>
        )}

        {question.type === "picture_choice" && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-3">
              {(question.options && question.options.length > 0 ? question.options : [""]).map((opt: string, i: number) => {
                const imgUrl = question.config?.pictures?.[i];
                return (
                  <div key={i} className="relative group w-44 bg-[#ECECEC] hover:bg-[#E5E5E5] rounded-xl p-2 pb-2.5 transition-all shadow-2xs">
                    {/* Delete choice button */}
                    <button
                      type="button"
                      onClick={() => {
                        const newOpts = [...(question.options || [""])];
                        newOpts.splice(i, 1);
                        const newPics = { ...(question.config?.pictures || {}) };
                        delete newPics[i];
                        const reindexedPics: Record<string, string> = {};
                        Object.keys(newPics).forEach(key => {
                          const num = parseInt(key);
                          if (num < i) reindexedPics[num] = newPics[key];
                          else if (num > i) reindexedPics[num - 1] = newPics[key];
                        });
                        onUpdate({ options: newOpts, config: { ...question.config, pictures: reindexedPics } });
                      }}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gray-700 hover:bg-red-500 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow"
                      title="Remove choice"
                    >
                      ×
                    </button>

                    {/* Picture upload area */}
                    <label className="block w-full aspect-square rounded-lg bg-[#D4D4D8] hover:bg-[#CBCBD0] transition-colors cursor-pointer relative overflow-hidden group/img">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const base64 = event.target?.result as string;
                              const newPics = { ...(question.config?.pictures || {}), [i]: base64 };
                              onUpdate({ config: { ...question.config, pictures: newPics } });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      {imgUrl ? (
                        <>
                          <img src={imgUrl} alt={`Choice ${String.fromCharCode(65 + i)}`} className="w-full h-full object-cover rounded-lg" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium rounded-lg">
                            Change
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-700">
                          {/* Exact Typeform mountain + sun + plus icon */}
                          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="8" cy="8" r="1.5" />
                            <path d="M4 17l4.5-5 3.5 3.5 3-3.5 5 5H4z" />
                            <path d="M17 3v4M15 5h4" />
                          </svg>
                        </div>
                      )}
                    </label>

                    {/* Badge + Label */}
                    <div className="flex items-center gap-2 mt-2 px-0.5">
                      <div className="w-5 h-5 rounded border border-gray-300 bg-white flex items-center justify-center text-[10px] font-bold text-gray-700 shadow-2xs shrink-0">
                        {String.fromCharCode(65 + i)}
                      </div>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...(question.options || [""])];
                          newOpts[i] = e.target.value;
                          onUpdate({ options: newOpts });
                        }}
                        placeholder="Label (optional)"
                        className="bg-transparent outline-none text-xs text-gray-800 placeholder-gray-400 font-medium w-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add choice link */}
            <div className="mt-3">
              <button
                type="button"
                onClick={() => {
                  const currentOpts = question.options && question.options.length > 0 ? question.options : [""];
                  onUpdate({ options: [...currentOpts, ""] });
                }}
                className="text-[#1A73E8] underline text-xs font-normal hover:text-blue-800"
              >
                Add choice
              </button>
            </div>
          </div>
        )}



        {question.type === "dropdown" && (
          <div className="w-full max-w-xl">
            <div 
              onClick={() => onOpenDropdownModal?.()}
              className="border-b border-gray-300 pb-2.5 flex items-center justify-between cursor-pointer group"
            >
              <span className="text-2xl font-light text-gray-400 group-hover:text-gray-600 transition-colors">
                {question.config?.custom_placeholder_text || "Type or select an option"}
              </span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 group-hover:text-gray-600 transition-colors">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>

            <div className="flex items-center justify-between mt-2.5 text-xs">
              <button
                type="button"
                onClick={() => onOpenDropdownModal?.()}
                className="underline text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                {(question.options || []).length === 0 ? "Add choices" : "Edit choices"}
              </button>

              <span className="text-gray-400 font-normal">
                {(question.options || []).length} options in list
              </span>
            </div>
          </div>
        )}

        {question.type === "yes_no" && (
          <div className="flex flex-col gap-2 mt-4 max-w-[260px]">
            <div className="flex items-center gap-3 px-3.5 py-2.5 bg-[#ECECEC] hover:bg-[#E5E5E5] rounded-lg transition-colors cursor-default select-none">
              <div className="w-5 h-5 rounded border border-gray-300 bg-white flex items-center justify-center text-[10px] font-bold text-gray-600 shadow-2xs shrink-0">
                Y
              </div>
              <span className="text-gray-800 text-sm font-normal">Yes</span>
            </div>
            <div className="flex items-center gap-3 px-3.5 py-2.5 bg-[#ECECEC] hover:bg-[#E5E5E5] rounded-lg transition-colors cursor-default select-none">
              <div className="w-5 h-5 rounded border border-gray-300 bg-white flex items-center justify-center text-[10px] font-bold text-gray-600 shadow-2xs shrink-0">
                N
              </div>
              <span className="text-gray-800 text-sm font-normal">No</span>
            </div>
          </div>
        )}

        {question.type === "legal" && (
          <div className="flex flex-col gap-2 mt-4 max-w-[240px]">
            <div className="flex items-center gap-3 px-3.5 py-2.5 bg-[#EAEAEA] hover:bg-[#E2E2E2] rounded-lg transition-colors cursor-default select-none">
              <div className="w-5 h-5 rounded border border-gray-300 bg-white flex items-center justify-center text-[10px] font-bold text-gray-700 shadow-2xs shrink-0">
                A
              </div>
              <span className="text-gray-800 text-sm font-normal">{(question.options && question.options[0]) || "I accept"}</span>
            </div>
            <div className="flex items-center gap-3 px-3.5 py-2.5 bg-[#EAEAEA] hover:bg-[#E2E2E2] rounded-lg transition-colors cursor-default select-none">
              <div className="w-5 h-5 rounded border border-gray-300 bg-white flex items-center justify-center text-[10px] font-bold text-gray-700 shadow-2xs shrink-0">
                B
              </div>
              <span className="text-gray-800 text-sm font-normal">{(question.options && question.options[1]) || "I don’t accept"}</span>
            </div>
          </div>
        )}

        {question.type === "net_promoter_score" && (
          <div className="mt-5 max-w-[500px]">
            <div className="flex gap-1.5 sm:gap-2">
              {Array.from({ length: 11 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 aspect-square max-w-[40px] rounded-md bg-[#ECECEC] hover:bg-[#E0E0E0] text-gray-700 text-xs font-semibold flex items-center justify-center transition-colors cursor-default select-none shadow-2xs"
                >
                  {i}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2.5 text-xs text-gray-400 font-normal select-none">
              <span>{question.config?.left_label || "Not likely at all"}</span>
              <span>{question.config?.right_label || "Extremely likely"}</span>
            </div>
          </div>
        )}

        {question.type === "opinion_scale" && (() => {
          const startAt = question.config?.start_at !== undefined ? Number(question.config.start_at) : 0;
          const endAt = question.config?.end_at !== undefined ? Number(question.config.end_at) : (question.config?.scale !== undefined ? Number(question.config.scale) - 1 : 10);
          const steps = Array.from({ length: Math.max(1, endAt - startAt + 1) }, (_, i) => startAt + i);
          const startLabel = question.config?.start_label;
          const midLabel = question.config?.middle_label;
          const endLabel = question.config?.end_label;
          const hasLabels = Boolean(startLabel || midLabel || endLabel);

          return (
            <div className="mt-5 max-w-[560px]">
              <div className="flex gap-1.5 sm:gap-2">
                {steps.map((val) => (
                  <div
                    key={val}
                    className="flex-1 aspect-square max-w-[42px] rounded-md bg-[#ECECEC] text-gray-700 text-xs sm:text-sm font-medium flex items-center justify-center select-none shadow-2xs"
                  >
                    {val}
                  </div>
                ))}
              </div>
              {hasLabels && (
                <div className="flex justify-between mt-2.5 text-xs text-gray-500 font-normal select-none px-0.5">
                  <span className="text-left flex-1">{startLabel || ""}</span>
                  <span className="text-center flex-1">{midLabel || ""}</span>
                  <span className="text-right flex-1">{endLabel || ""}</span>
                </div>
              )}
            </div>
          );
        })()}

        {question.type === "rating" && (() => {
          const count = question.config?.steps || question.config?.scale || 3;
          const shape = question.config?.shape || "star";

          return (
            <div className="mt-6 flex items-center gap-4 sm:gap-6 select-none">
              {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="text-gray-700 hover:text-black transition-colors cursor-default">
                    {renderRatingShape(shape, false, 36)}
                  </div>
                  <span className="text-xs text-gray-500 font-normal">{i + 1}</span>
                </div>
              ))}
            </div>
          );
        })()}

        {question.type === "ranking" && (
          <div className="mt-5 max-w-sm">
            <div className="space-y-2">
              {(question.options && question.options.length > 0 ? question.options : ["", ""]).map((opt: string, idx: number) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between px-3 py-2 bg-[#ECECEC] hover:bg-[#E5E5E5] rounded-lg transition-colors group select-none"
                >
                  <div className="flex items-center gap-1 text-xs text-gray-500 font-medium px-2 py-0.5 rounded bg-white/70 border border-gray-200/50 shadow-2xs">
                    <span>-</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                  <input
                    type="text"
                    value={opt}
                    placeholder="choice"
                    className="bg-transparent text-sm text-gray-800 placeholder-gray-400 font-normal italic flex-1 px-3 outline-none"
                    onChange={(e) => {
                      const newOpts = [...(question.options && question.options.length > 0 ? question.options : ["", ""])];
                      newOpts[idx] = e.target.value;
                      onUpdate({ options: newOpts });
                    }}
                  />
                  <div className="flex items-center gap-1.5 text-gray-400">
                    {(question.options || []).length > 2 && (
                      <button
                        onClick={() => {
                          const newOpts = question.options.filter((_: any, i: number) => i !== idx);
                          onUpdate({ options: newOpts });
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity p-0.5"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                      </button>
                    )}
                    <div className="cursor-grab hover:text-gray-600">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                const cur = question.options && question.options.length > 0 ? question.options : ["", ""];
                onUpdate({ options: [...cur, ""] });
              }}
              className="text-xs text-gray-600 hover:text-black font-medium mt-2.5 block transition-colors"
            >
              Add choice
            </button>
          </div>
        )}

        {question.type === "matrix" && (
          <div className="mt-8 w-full">
            {previewMode === "mobile" ? (
              <div className="space-y-3">
                <div className="flex justify-end mb-2">
                  <button 
                    className="text-xs text-[#1A73E8] underline hover:text-blue-800"
                    onClick={() => onUpdate({ config: { ...question.config, columns: [...(question.config?.columns || []), `Col ${(question.config?.columns?.length || 0) + 1}`] }})}
                  >
                    Add column
                  </button>
                </div>
                {(question.options || []).map((row: string, rIdx: number) => (
                  <div key={rIdx} className="bg-[#F3F3F3] rounded-lg p-4 relative group">
                    <div className="absolute -left-6 opacity-0 group-hover:opacity-100 transition-opacity top-1/2 -translate-y-1/2">
                      <button 
                        className="text-gray-400 hover:text-red-500"
                        onClick={() => onUpdate({ options: question.options.filter((_: any, i: number) => i !== rIdx) })}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>
                      </button>
                    </div>
                    <div className="text-gray-800 font-medium text-sm mb-3">{row}</div>
                    <div className="space-y-2.5">
                      {(question.config?.columns || []).map((col: string, cIdx: number) => (
                        <div key={cIdx} className="flex items-center gap-3">
                          <div className="w-[18px] h-[18px] rounded-full border border-gray-400 bg-transparent shrink-0" />
                          <span className="text-sm text-gray-600 italic">{col}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="mt-3 pl-2">
                  <button 
                    className="text-xs text-gray-500 underline hover:text-gray-700"
                    onClick={() => onUpdate({ options: [...(question.options || []), `Row ${(question.options?.length || 0) + 1}`] })}
                  >
                    Add row
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Top row: columns + Add column */}
                <div className="flex mb-2">
                  <div className="w-40 shrink-0" />
                  <div className="flex-1 flex justify-between relative">
                    {(question.config?.columns || []).map((col: string, i: number) => (
                      <div key={i} className="flex-1 text-center text-sm italic text-gray-500 font-medium">
                        {col}
                      </div>
                    ))}
                    <div className="absolute -top-6 right-0">
                      <button 
                        className="text-xs text-[#1A73E8] underline hover:text-blue-800"
                        onClick={() => onUpdate({ config: { ...question.config, columns: [...(question.config?.columns || []), `Col ${(question.config?.columns?.length || 0) + 1}`] }})}
                      >
                        Add column
                      </button>
                    </div>
                  </div>
                </div>

                {/* Rows */}
                <div className="space-y-1.5">
                  {(question.options || []).map((row: string, rIdx: number) => (
                    <div key={rIdx} className="flex items-center bg-[#F3F3F3] rounded p-2.5 group relative">
                      {/* Delete row button (hover) */}
                      <div className="absolute -left-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="text-gray-400 hover:text-red-500"
                          onClick={() => onUpdate({ options: question.options.filter((_: any, i: number) => i !== rIdx) })}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>
                        </button>
                      </div>
                      
                      <div className="w-40 shrink-0 text-gray-600 text-sm font-medium pl-2">
                        {row}
                      </div>
                      <div className="flex-1 flex justify-between items-center">
                        {(question.config?.columns || []).map((_: any, cIdx: number) => (
                          <div key={cIdx} className="flex-1 flex justify-center">
                            <div className="w-[18px] h-[18px] rounded-full border border-gray-400 bg-transparent" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add row */}
                <div className="mt-3 pl-2">
                  <button 
                    className="text-xs text-gray-500 underline hover:text-gray-700"
                    onClick={() => onUpdate({ options: [...(question.options || []), `Row ${(question.options?.length || 0) + 1}`] })}
                  >
                    Add row
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* OK button preview (only for website) */}
        {question.type === "website" && (
          <div className="mt-8 flex items-center gap-3">
            <button className="bg-[#1A1A2E] text-white px-5 py-2 rounded text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors">
              OK <span className="text-xs">✓</span>
            </button>
            <span className="text-xs text-gray-400">press <kbd className="bg-gray-100 border border-gray-300 px-1.5 py-0.5 rounded text-[10px]">Enter ↵</kbd></span>
          </div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4 select-none">
        <div className="relative">
          <div className="hidden sm:block absolute -left-1 top-24 w-1 h-7 bg-gray-700 rounded-l" />
          <div className="hidden sm:block absolute -left-1 top-36 w-1 h-11 bg-gray-700 rounded-l" />
          <div className="hidden sm:block absolute -left-1 top-52 w-1 h-11 bg-gray-700 rounded-l" />
          <div className="hidden sm:block absolute -right-1 top-32 w-1 h-14 bg-gray-700 rounded-r" />

          <div className="w-[375px] max-w-[92vw] h-[720px] max-h-[82vh] bg-white rounded-[46px] border-[11px] border-[#18181B] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.08)] flex flex-col relative overflow-hidden ring-1 ring-black/5">
            {/* Top Status Bar */}
            <div className="w-full pt-3 px-6 pb-1 flex items-center justify-between text-xs font-semibold text-gray-900 shrink-0 z-30 select-none bg-white">
              <span className="font-semibold tracking-tight text-[12px]">9:41</span>
              <div className="w-24 h-5 bg-black rounded-full flex items-center justify-between px-2 shrink-0 shadow-2xs">
                <div className="w-2 h-2 rounded-full bg-[#1c2a44] border border-[#222]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#111]" />
              </div>
              <div className="flex items-center gap-1.5 text-gray-900">
                <svg width="13" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="14" width="3" height="8" rx="1"/><rect x="7" y="10" width="3" height="12" rx="1"/><rect x="12" y="6" width="3" height="16" rx="1"/><rect x="17" y="2" width="3" height="20" rx="1"/></svg>
                <div className="w-5 h-2.5 border border-gray-900 rounded-[3px] p-0.5 flex items-center"><div className="w-full h-full bg-gray-900 rounded-[1px]"/></div>
              </div>
            </div>

            {/* In-Phone Top Progress Line */}
            <div className="w-full h-1 bg-gray-100 shrink-0">
              <div className="h-full bg-black w-1/3" />
            </div>

            {/* Phone Screen Area */}
            <div className="flex-1 w-full overflow-y-auto px-4 py-4 pb-10 flex flex-col justify-center">
              {content}
            </div>

            {/* Bottom iOS Home Indicator */}
            <div className="w-32 h-1 bg-black/25 rounded-full mx-auto my-2 shrink-0 z-30 pointer-events-none" />
          </div>
        </div>
      </div>
    );
  }

  return content;
}

// ─── Right panel — Question properties ───────────────────────────────────────
function QuestionPanel({ question, onUpdate, onDelete, onAddQuestion, onOpenDropdownModal }: any) {
  const [typeSearch, setTypeSearch] = useState("");
  const [showTypePicker, setShowTypePicker] = useState(false);

  const filteredTypes = Object.entries(TYPE_CONFIG).filter(([, cfg]) =>
    cfg.label.toLowerCase().includes(typeSearch.toLowerCase())
  );

  if (!question) {
    // No question selected — show type picker to add
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b bg-white">
          <p className="text-xs text-gray-500 mb-3">Select a question from the left, or add one:</p>
          <div className="relative">
            <svg className="absolute left-3 top-2.5 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              value={typeSearch}
              onChange={e => setTypeSearch(e.target.value)}
              placeholder="Search question types..."
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {filteredTypes.map(([typeId, cfg]) => (
            <button
              key={typeId}
              onClick={() => onAddQuestion(typeId)}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                {cfg.icon}
              </div>
              <span className="text-sm text-gray-700 font-medium">{cfg.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const cfg = TYPE_CONFIG[question.type] || TYPE_CONFIG.short_text;
  const isContact = question.type === "contact_info";
  const isAddress = question.type === "address";

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Question section header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-700">Question</span>
            <span className="text-gray-400 text-xs cursor-help" title="Question settings">ⓘ</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 mb-4 bg-gray-100 p-0.5 rounded-lg border border-gray-200/50">
          <button className="py-1.5 text-xs font-semibold text-gray-900 bg-white shadow-sm rounded-md flex items-center justify-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/></svg>
            Text
          </button>
          <button className="py-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 rounded-md flex items-center justify-center gap-1.5 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            Video
          </button>
        </div>

        {/* Answer type picker */}
        <div className="mb-1">
          <label className="text-xs text-gray-500 font-medium mb-2 block">Answer</label>
          {!isContact && !isAddress && (
            <>
              <button
                onClick={() => setShowTypePicker(!showTypePicker)}
                className="w-full flex items-center gap-2.5 p-2.5 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white text-left"
              >
                <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                  {cfg.icon}
                </div>
                <span className="flex-1 text-sm text-gray-700 font-medium">{cfg.label}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><path d="m6 9 6 6 6-6"/></svg>
              </button>

              {showTypePicker && (
                <div className="mt-1 border border-gray-200 rounded-lg bg-white shadow-lg overflow-hidden">
                  <div className="p-2 border-b">
                    <div className="relative">
                      <svg className="absolute left-2.5 top-2 text-gray-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                      <input
                        value={typeSearch}
                        onChange={e => setTypeSearch(e.target.value)}
                        placeholder="Search..."
                        className="w-full pl-7 pr-2 py-1.5 text-sm outline-none"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-56 overflow-y-auto p-1">
                    {filteredTypes.map(([typeId, c]) => (
                      <button
                        key={typeId}
                        onClick={() => { onUpdate({ type: typeId }); setShowTypePicker(false); setTypeSearch(""); }}
                        className="w-full flex items-center gap-2.5 p-2 rounded hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="w-6 h-6 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: c.bg, color: c.color }}>
                          {c.icon}
                        </div>
                        <span className="text-sm text-gray-700">{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Properties */}
      <div className="p-4 space-y-4 flex-1">

        <div className="space-y-3">
          {/* Required toggle (for questions other than dropdown/address/website/opinion_scale/rating/ranking, which have their own ordered position) */}
          {!isContact && !isAddress && question.type !== "dropdown" && question.type !== "website" && question.type !== "opinion_scale" && question.type !== "rating" && question.type !== "ranking" && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Required</span>
              <button
                onClick={() => onUpdate({ required: !question.required })}
                className={`w-8 h-4 rounded-full relative transition-colors ${question.required ? "bg-gray-800" : "bg-gray-200"}`}
              >
                <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 shadow transition-transform" style={{ transform: question.required ? "translateX(16px)" : "translateX(2px)" }} />
              </button>
            </div>
          )}

          {/* Website specific toggles matching Typeform Screenshot */}
          {question.type === "website" && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-gray-700">Map to contacts</span>
                  <span className="text-gray-400 text-xs cursor-help" title="Map response to a contact field">ⓘ</span>
                </div>
                <button
                  onClick={() => onUpdate({ config: { ...question.config, map_to_contacts: !question.config?.map_to_contacts } })}
                  className={`w-8 h-4 rounded-full relative transition-colors ${question.config?.map_to_contacts ? "bg-gray-800" : "bg-gray-200"}`}
                >
                  <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 shadow transition-transform" style={{ transform: question.config?.map_to_contacts ? "translateX(16px)" : "translateX(2px)" }} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Required</span>
                <button
                  onClick={() => onUpdate({ required: !question.required })}
                  className={`w-8 h-4 rounded-full relative transition-colors ${question.required ? "bg-gray-800" : "bg-gray-200"}`}
                >
                  <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 shadow transition-transform" style={{ transform: question.required ? "translateX(16px)" : "translateX(2px)" }} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-gray-700">Custom placeholder text</span>
                  <span className="text-gray-400 text-xs cursor-help" title="Change the default placeholder text">ⓘ</span>
                </div>
                <button
                  onClick={() => onUpdate({ config: { ...question.config, has_custom_placeholder: !question.config?.has_custom_placeholder } })}
                  className={`w-8 h-4 rounded-full relative transition-colors ${question.config?.has_custom_placeholder ? "bg-gray-800" : "bg-gray-200"}`}
                >
                  <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 shadow transition-transform" style={{ transform: question.config?.has_custom_placeholder ? "translateX(16px)" : "translateX(2px)" }} />
                </button>
              </div>

              {question.config?.has_custom_placeholder && (
                <div className="mt-1">
                  <input
                    type="text"
                    value={question.config?.custom_placeholder_text || ""}
                    onChange={e => onUpdate({ config: { ...question.config, custom_placeholder_text: e.target.value } })}
                    placeholder="https://"
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-gray-400 outline-none"
                  />
                </div>
              )}
            </>
          )}

          {/* Address specific toggles */}
          {isAddress && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-gray-700">Map to contacts</span>
                  <span className="text-gray-400 text-xs cursor-help" title="Map response to a contact field">ⓘ</span>
                </div>
                <button
                  onClick={() => onUpdate({ config: { ...question.config, map_to_contacts: !question.config?.map_to_contacts } })}
                  className={`w-8 h-4 rounded-full relative transition-colors ${question.config?.map_to_contacts ? "bg-gray-800" : "bg-gray-200"}`}
                >
                  <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 shadow transition-transform" style={{ transform: question.config?.map_to_contacts ? "translateX(16px)" : "translateX(2px)" }} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Required</span>
                <button
                  onClick={() => onUpdate({ required: !question.required })}
                  className={`w-8 h-4 rounded-full relative transition-colors ${question.required ? "bg-gray-800" : "bg-gray-200"}`}
                >
                  <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 shadow transition-transform" style={{ transform: question.required ? "translateX(16px)" : "translateX(2px)" }} />
                </button>
              </div>
            </>
          )}

          {/* Yes/No & Legal specific toggles matching Typeform */}
          {(question.type === "yes_no" || question.type === "legal") && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-gray-700">Map to contacts</span>
                  <span className="text-gray-400 text-xs cursor-help" title="Map response to a contact field">ⓘ</span>
                </div>
                <button
                  onClick={() => onUpdate({ config: { ...question.config, map_to_contacts: !question.config?.map_to_contacts } })}
                  className={`w-8 h-4 rounded-full relative transition-colors ${question.config?.map_to_contacts ? "bg-gray-800" : "bg-gray-200"}`}
                >
                  <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 shadow transition-transform" style={{ transform: question.config?.map_to_contacts ? "translateX(16px)" : "translateX(2px)" }} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Required</span>
                <button
                  onClick={() => onUpdate({ required: !question.required })}
                  className={`w-8 h-4 rounded-full relative transition-colors ${question.required ? "bg-gray-800" : "bg-gray-200"}`}
                >
                  <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 shadow transition-transform" style={{ transform: question.required ? "translateX(16px)" : "translateX(2px)" }} />
                </button>
              </div>
            </>
          )}

          {/* Opinion Scale specific controls matching Typeform */}
          {question.type === "opinion_scale" && (() => {
            const startAt = question.config?.start_at !== undefined ? Number(question.config.start_at) : 0;
            const endAt = question.config?.end_at !== undefined ? Number(question.config.end_at) : (question.config?.scale !== undefined ? Number(question.config.scale) - 1 : 10);
            const midAt = Math.round((startAt + endAt) / 2);
            const startLabel = question.config?.start_label || "";
            const midLabel = question.config?.middle_label || "";
            const endLabel = question.config?.end_label || "";

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-gray-700">Map to contacts</span>
                    <span className="text-gray-400 text-xs cursor-help" title="Map response to a contact field">ⓘ</span>
                  </div>
                  <button
                    onClick={() => onUpdate({ config: { ...question.config, map_to_contacts: !question.config?.map_to_contacts } })}
                    className={`w-8 h-4 rounded-full relative transition-colors ${question.config?.map_to_contacts ? "bg-gray-800" : "bg-gray-200"}`}
                  >
                    <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 shadow transition-transform" style={{ transform: question.config?.map_to_contacts ? "translateX(16px)" : "translateX(2px)" }} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Required</span>
                  <button
                    onClick={() => onUpdate({ required: !question.required })}
                    className={`w-8 h-4 rounded-full relative transition-colors ${question.required ? "bg-gray-800" : "bg-gray-200"}`}
                  >
                    <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 shadow transition-transform" style={{ transform: question.required ? "translateX(16px)" : "translateX(2px)" }} />
                  </button>
                </div>

                {/* Range: [ 0 ▾ ] to [ 10 ▾ ] */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="relative flex-1">
                    <select
                      value={startAt}
                      onChange={(e) => onUpdate({ config: { ...question.config, start_at: parseInt(e.target.value) } })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white text-gray-700 appearance-none focus:border-gray-400 outline-none pr-8 cursor-pointer"
                    >
                      <option value={0}>0</option>
                      <option value={1}>1</option>
                    </select>
                    <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                  <span className="text-sm text-gray-500 font-normal">to</span>
                  <div className="relative flex-1">
                    <select
                      value={endAt}
                      onChange={(e) => onUpdate({ config: { ...question.config, end_at: parseInt(e.target.value) } })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white text-gray-700 appearance-none focus:border-gray-400 outline-none pr-8 cursor-pointer"
                    >
                      {[3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                    <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>

                {/* Start label */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-gray-600 font-normal">{startAt} label</label>
                    <span className="text-xs text-gray-400">{startLabel.length}/24</span>
                  </div>
                  <input
                    type="text"
                    maxLength={24}
                    value={startLabel}
                    onChange={(e) => onUpdate({ config: { ...question.config, start_label: e.target.value } })}
                    placeholder=""
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-gray-400 outline-none bg-white"
                  />
                </div>

                {/* Middle label */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-gray-600 font-normal">{midAt} label</label>
                    <span className="text-xs text-gray-400">{midLabel.length}/24</span>
                  </div>
                  <input
                    type="text"
                    maxLength={24}
                    value={midLabel}
                    onChange={(e) => onUpdate({ config: { ...question.config, middle_label: e.target.value } })}
                    placeholder=""
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-gray-400 outline-none bg-white"
                  />
                </div>

                {/* End label */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-gray-600 font-normal">{endAt} label</label>
                    <span className="text-xs text-gray-400">{endLabel.length}/24</span>
                  </div>
                  <input
                    type="text"
                    maxLength={24}
                    value={endLabel}
                    onChange={(e) => onUpdate({ config: { ...question.config, end_label: e.target.value } })}
                    placeholder=""
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-gray-400 outline-none bg-white"
                  />
                </div>
              </div>
            );
          })()}

          {/* Rating specific controls matching Typeform Image 1 */}
          {question.type === "rating" && (() => {
            const steps = question.config?.steps || question.config?.scale || 3;
            const shape = question.config?.shape || "star";

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-gray-700">Map to contacts</span>
                    <span className="text-gray-400 text-xs cursor-help" title="Map response to a contact field">ⓘ</span>
                  </div>
                  <button
                    onClick={() => onUpdate({ config: { ...question.config, map_to_contacts: !question.config?.map_to_contacts } })}
                    className={`w-8 h-4 rounded-full relative transition-colors ${question.config?.map_to_contacts ? "bg-gray-800" : "bg-gray-200"}`}
                  >
                    <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 shadow transition-transform" style={{ transform: question.config?.map_to_contacts ? "translateX(16px)" : "translateX(2px)" }} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Required</span>
                  <button
                    onClick={() => onUpdate({ required: !question.required })}
                    className={`w-8 h-4 rounded-full relative transition-colors ${question.required ? "bg-gray-800" : "bg-gray-200"}`}
                  >
                    <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 shadow transition-transform" style={{ transform: question.required ? "translateX(16px)" : "translateX(2px)" }} />
                  </button>
                </div>

                {/* Steps and Shape row */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="relative flex-1">
                    <select
                      value={steps}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        onUpdate({ config: { ...question.config, steps: val, scale: val } });
                      }}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white text-gray-700 appearance-none focus:border-gray-400 outline-none pr-8 cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                    <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                  </div>

                  <div className="relative flex-1">
                    <select
                      value={shape}
                      onChange={(e) => onUpdate({ config: { ...question.config, shape: e.target.value } })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white text-gray-700 appearance-none focus:border-gray-400 outline-none pr-8 cursor-pointer"
                    >
                      <option value="star">★ Star</option>
                      <option value="heart">♥ Heart</option>
                      <option value="thumb_up">👍 Thumb</option>
                      <option value="crown">👑 Crown</option>
                      <option value="circle">● Circle</option>
                    </select>
                    <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Ranking specific controls matching Typeform Image 2 */}
          {question.type === "ranking" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-gray-700">Map to contacts</span>
                  <span className="text-gray-400 text-xs cursor-help" title="Map response to a contact field">ⓘ</span>
                </div>
                <button
                  onClick={() => onUpdate({ config: { ...question.config, map_to_contacts: !question.config?.map_to_contacts } })}
                  className={`w-8 h-4 rounded-full relative transition-colors ${question.config?.map_to_contacts ? "bg-gray-800" : "bg-gray-200"}`}
                >
                  <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 shadow transition-transform" style={{ transform: question.config?.map_to_contacts ? "translateX(16px)" : "translateX(2px)" }} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Required</span>
                <button
                  onClick={() => onUpdate({ required: !question.required })}
                  className={`w-8 h-4 rounded-full relative transition-colors ${question.required ? "bg-gray-800" : "bg-gray-200"}`}
                >
                  <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 shadow transition-transform" style={{ transform: question.required ? "translateX(16px)" : "translateX(2px)" }} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Randomize</span>
                <button
                  onClick={() => onUpdate({ config: { ...question.config, randomize: !question.config?.randomize } })}
                  className={`w-8 h-4 rounded-full relative transition-colors ${question.config?.randomize ? "bg-gray-800" : "bg-gray-200"}`}
                >
                  <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 shadow transition-transform" style={{ transform: question.config?.randomize ? "translateX(16px)" : "translateX(2px)" }} />
                </button>
              </div>
            </div>
          )}

          {/* Dropdown specific toggles matching Typeform Image 1 */}
          {question.type === "dropdown" && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-gray-700">Map to contacts</span>
                  <span className="text-gray-400 text-xs cursor-help" title="Map response to a contact field">ⓘ</span>
                </div>
                <button
                  onClick={() => onUpdate({ config: { ...question.config, map_to_contacts: !question.config?.map_to_contacts } })}
                  className={`w-8 h-4 rounded-full relative transition-colors ${question.config?.map_to_contacts ? "bg-gray-800" : "bg-gray-200"}`}
                >
                  <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 shadow transition-transform" style={{ transform: question.config?.map_to_contacts ? "translateX(16px)" : "translateX(2px)" }} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Required</span>
                <button
                  onClick={() => onUpdate({ required: !question.required })}
                  className={`w-8 h-4 rounded-full relative transition-colors ${question.required ? "bg-gray-800" : "bg-gray-200"}`}
                >
                  <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 shadow transition-transform" style={{ transform: question.required ? "translateX(16px)" : "translateX(2px)" }} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Randomize</span>
                <button
                  onClick={() => onUpdate({ config: { ...question.config, randomize: !question.config?.randomize } })}
                  className={`w-8 h-4 rounded-full relative transition-colors ${question.config?.randomize ? "bg-gray-800" : "bg-gray-200"}`}
                >
                  <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 shadow transition-transform" style={{ transform: question.config?.randomize ? "translateX(16px)" : "translateX(2px)" }} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Alphabetical order</span>
                <button
                  onClick={() => {
                    const nextVal = !question.config?.alphabetical_order;
                    let newOpts = [...(question.options || [])];
                    if (nextVal) {
                      newOpts = newOpts.sort((a, b) => a.localeCompare(b));
                    }
                    onUpdate({ 
                      options: newOpts,
                      config: { ...question.config, alphabetical_order: nextVal } 
                    });
                  }}
                  className={`w-8 h-4 rounded-full relative transition-colors ${question.config?.alphabetical_order ? "bg-gray-800" : "bg-gray-200"}`}
                >
                  <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 shadow transition-transform" style={{ transform: question.config?.alphabetical_order ? "translateX(16px)" : "translateX(2px)" }} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-gray-700">Custom placeholder text</span>
                  <span className="text-gray-400 text-xs cursor-help" title="Change the default placeholder text">ⓘ</span>
                </div>
                <button
                  onClick={() => onUpdate({ config: { ...question.config, has_custom_placeholder: !question.config?.has_custom_placeholder } })}
                  className={`w-8 h-4 rounded-full relative transition-colors ${question.config?.has_custom_placeholder ? "bg-gray-800" : "bg-gray-200"}`}
                >
                  <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 shadow transition-transform" style={{ transform: question.config?.has_custom_placeholder ? "translateX(16px)" : "translateX(2px)" }} />
                </button>
              </div>

              {question.config?.has_custom_placeholder && (
                <div className="mt-1">
                  <input
                    type="text"
                    value={question.config?.custom_placeholder_text || ""}
                    onChange={e => onUpdate({ config: { ...question.config, custom_placeholder_text: e.target.value } })}
                    placeholder="Type or select an option"
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-gray-400 outline-none"
                  />
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={() => onOpenDropdownModal?.()}
                  className="w-full py-2 px-3 text-sm font-medium border border-gray-300 rounded-lg hover:border-gray-400 text-gray-700 bg-white flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit choices ({(question.options || []).length})
                </button>
              </div>
            </>
          )}

          {/* MCQ & Picture Choice specific toggles */}
          {(question.type === "multiple_choice" || question.type === "picture_choice") && [
            { id: "multiple_selection", label: "Multiple selection" },
            { id: "randomize", label: "Randomize" },
            ...(question.type === "multiple_choice" ? [
              { id: "allow_other", label: '"Other" option' },
              { id: "allow_none", label: '"None" option' },
              { id: "vertical_alignment", label: "Vertical alignment" },
            ] : []),
          ].map(toggle => (
            <div key={toggle.id} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{toggle.label}</span>
              <button
                onClick={() => onUpdate({ config: { ...question.config, [toggle.id]: !question.config?.[toggle.id] } })}
                className={`w-8 h-4 rounded-full relative transition-colors ${question.config?.[toggle.id] ? "bg-gray-800" : "bg-gray-200"}`}
              >
                <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 shadow transition-transform" style={{ transform: question.config?.[toggle.id] ? "translateX(16px)" : "translateX(2px)" }} />
              </button>
            </div>
          ))}
        </div>

        {/* Choices / Rows for non-dropdown questions */}
        {(question.type === "checkbox" || question.type === "picture_choice" || question.type === "matrix") && (
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
              {question.type === "matrix" ? "Rows" : "Choices"}
            </label>
            <div className="space-y-1.5">
              {(question.options || []).map((opt: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  {question.type !== "matrix" && (
                    <div className="w-5 h-5 border border-gray-300 rounded text-[10px] font-semibold text-gray-400 flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </div>
                  )}
                  <input
                    type="text"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-blue-400 outline-none bg-white"
                    value={opt}
                    onChange={e => {
                      const newOpts = [...question.options];
                      newOpts[idx] = e.target.value;
                      onUpdate({ options: newOpts });
                    }}
                  />
                  <button
                    onClick={() => onUpdate({ options: question.options.filter((_: any, i: number) => i !== idx) })}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => onUpdate({ options: [...(question.options || []), question.type === "matrix" ? `Row ${(question.options?.length || 0) + 1}` : `Option ${(question.options?.length || 0) + 1}`] })}
                className="flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:text-blue-700 mt-2 block"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                {question.type === "matrix" ? "Add row" : "Add choice"}
              </button>
            </div>
          </div>
        )}

        {/* Matrix Columns */}
        {question.type === "matrix" && (
          <div className="mt-6">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Columns</label>
            <div className="space-y-1.5">
              {(question.config?.columns || []).map((col: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-blue-400 outline-none bg-white"
                    value={col}
                    onChange={(e) => {
                      const newCols = [...(question.config?.columns || [])];
                      newCols[idx] = e.target.value;
                      onUpdate({ config: { ...question.config, columns: newCols } });
                    }}
                  />
                  <button
                    onClick={() => {
                      const newCols = [...(question.config?.columns || [])];
                      newCols.splice(idx, 1);
                      onUpdate({ config: { ...question.config, columns: newCols } });
                    }}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => onUpdate({ config: { ...question.config, columns: [...(question.config?.columns || []), `Col ${(question.config?.columns?.length || 0) + 1}`] } })}
                className="flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:text-blue-700 mt-2 block"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                Add column
              </button>
            </div>
          </div>
        )}

        {/* NPS specific settings */}
        {question.type === "net_promoter_score" && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Left label</label>
              <input
                type="text"
                value={question.config?.left_label ?? "Not likely at all"}
                onChange={e => onUpdate({ config: { ...question.config, left_label: e.target.value } })}
                placeholder="Not likely at all"
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-gray-400 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Right label</label>
              <input
                type="text"
                value={question.config?.right_label ?? "Extremely likely"}
                onChange={e => onUpdate({ config: { ...question.config, right_label: e.target.value } })}
                placeholder="Extremely likely"
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-gray-400 outline-none"
              />
            </div>
          </div>
        )}



        {/* Image or video, Logic, Comments */}
        <div className="border-t pt-3 space-y-1">
          <div className="flex items-center justify-between py-2 px-1 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
            <span className="text-xs font-medium text-gray-700">Image or video</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          </div>
          <div className="flex items-center justify-between py-2 px-1 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
            <span className="text-xs font-medium text-gray-700">Logic</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          </div>
          <div className="flex items-center justify-between py-2 px-1 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
            <span className="text-xs font-medium text-gray-700">Comments</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
        </div>

        {/* Delete */}
        <button
          onClick={onDelete}
          className="w-full mt-4 py-2 text-sm text-red-500 hover:bg-red-50 border border-red-200 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          Delete question
        </button>
      </div>
    </div>
  );
}

// ─── Dropdown Choices Modal (Typeform style) ──────────────────────────────────
function DropdownChoicesModal({
  isOpen,
  initialChoices = [],
  onClose,
  onSave,
}: {
  isOpen: boolean;
  initialChoices?: string[];
  onClose: () => void;
  onSave: (choices: string[]) => void;
}) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setText((initialChoices || []).join("\n"));
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialChoices]);

  if (!isOpen) return null;

  const handleSave = () => {
    const lines = text
      .split("\n")
      .map(s => s.trim())
      .filter(s => s.length > 0);
    onSave(lines);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[0.5px] animate-in fade-in duration-150">
      {/* Click outside backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-[440px] w-full mx-4 p-6 border border-gray-100 z-10 animate-in zoom-in-95 duration-150">
        {/* Close X button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors p-1"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Modal Title */}
        <h2 className="text-xl font-medium text-[#262627]">Add choices</h2>
        <p className="text-xs text-gray-600 mt-2 mb-4 leading-normal">
          Write or paste your choices below. Each choice must be on a separate line.
        </p>

        {/* Choices Textarea */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={"Your choices go here\nOne per line\nLike this\n:-)"}
            rows={6}
            className="w-full border border-gray-800 rounded-xl p-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black resize-none font-normal leading-relaxed"
          />
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#262627] hover:bg-black rounded-lg transition-colors shadow-sm"
          >
            Save choices
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Builder Page ────────────────────────────────────────────────────────
export default function Builder() {
  const params = useParams();
  const router = useRouter();
  const [form, setForm] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);
  const [selectedContactSubField, setSelectedContactSubField] = useState<string>("phone_number");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDropdownModal, setShowDropdownModal] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [showLivePreview, setShowLivePreview] = useState(false);

  useEffect(() => { fetchForm(); }, [params.id]);

  const fetchForm = async () => {
    try {
      const data = await api.get(`/forms/${params.id}`);
      setForm(data);
      setQuestions(data.questions || []);
      if (data.questions?.length > 0 && !activeQuestionId) {
        setActiveQuestionId(data.questions[0].id);
      }
    } catch (e) {
      toast.error("Failed to load form");
    }
  };

  const [activeDragId, setActiveDragId] = useState<number | null>(null);
  const [menuQuestionId, setMenuQuestionId] = useState<number | null>(null);

  useEffect(() => {
    const handleOutsideClick = () => {
      setMenuQuestionId(null);
    };
    if (menuQuestionId !== null) {
      window.addEventListener("pointerdown", handleOutsideClick);
      return () => window.removeEventListener("pointerdown", handleOutsideClick);
    }
  }, [menuQuestionId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: any) => {
    setActiveDragId(event.active.id);
    setMenuQuestionId(null);
  };

  const handleDragEnd = async (event: any) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = questions.findIndex(q => q.id === active.id);
      const newIdx = questions.findIndex(q => q.id === over.id);
      const reordered = arrayMove(questions, oldIdx, newIdx);
      setQuestions(reordered);
      try {
        await api.put(`/forms/${form.id}/questions/reorder`, { question_ids: reordered.map(q => q.id) });
      } catch {
        toast.error("Reorder failed"); fetchForm();
      }
    }
  };

  const handleDragCancel = () => {
    setActiveDragId(null);
  };

  const moveQuestion = async (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= questions.length) return;
    const reordered = arrayMove(questions, fromIdx, toIdx);
    setQuestions(reordered);
    setMenuQuestionId(null);
    try {
      await api.put(`/forms/${form.id}/questions/reorder`, {
        question_ids: reordered.map(q => q.id)
      });
    } catch {
      toast.error("Failed to move question");
      fetchForm();
    }
  };

  const duplicateQuestion = async (q: any, index: number) => {
    setMenuQuestionId(null);
    try {
      const data = await api.post(`/forms/${form.id}/questions`, {
        title: q.title ? `${q.title} (copy)` : "",
        type: q.type,
        help_text: q.help_text,
        required: q.required,
        options: q.options || [],
        config: q.config || {},
      });

      const currentQuestions = [...questions];
      currentQuestions.splice(index + 1, 0, data);
      setQuestions(currentQuestions);
      setActiveQuestionId(data.id);

      await api.put(`/forms/${form.id}/questions/reorder`, {
        question_ids: currentQuestions.map(item => item.id)
      });
      toast.success("Question duplicated");
    } catch {
      toast.error("Failed to duplicate question");
      fetchForm();
    }
  };

  const deleteQuestionById = async (qId: number) => {
    setMenuQuestionId(null);
    try {
      await api.delete(`/questions/${qId}`);
      const remaining = questions.filter(q => q.id !== qId);
      setQuestions(remaining);
      if (activeQuestionId === qId) {
        setActiveQuestionId(remaining[0]?.id || null);
      }
      toast.success("Question deleted");
    } catch {
      toast.error("Failed to delete question");
      fetchForm();
    }
  };

  const addQuestion = async (type: string) => {
    try {
      const isContact = type === "contact_info";
      const isAddress = type === "address";
      const finalType = type;
      const initialTitle = isContact 
        ? "Contact Info" 
        : isAddress 
        ? "Address" 
        : type === "net_promoter_score"
        ? "How likely are you to recommend us to a friend or colleague?"
        : "";

      const data = await api.post(`/forms/${form.id}/questions`, {
        title: initialTitle,
        type: finalType,
        options: type === "picture_choice" ? [""] : type === "legal" ? ["I accept", "I don't accept"] : type === "ranking" ? ["", ""] : type === "matrix" ? ["Row 1", "Row 2", "Row 3"] : (type === "multiple_choice" || type === "dropdown" || type === "checkbox") ? ["Option 1", "Option 2"] : [],
        config: type === "net_promoter_score" ? { left_label: "Not likely at all", right_label: "Extremely likely", scale: 11 } : type === "opinion_scale" ? { start_at: 0, end_at: 10, start_label: "", middle_label: "", end_label: "" } : type === "rating" ? { steps: 3, shape: "star" } : type === "ranking" ? { randomize: false } : type === "matrix" ? { columns: ["Col 1", "Col 2", "Col 3"] } : {},
      });
      await fetchForm();
      setActiveQuestionId(data.id);
      if (isContact) setSelectedContactSubField("first_name");
      if (isAddress) setSelectedContactSubField("address");
      toast.success("Question added");
    } catch { toast.error("Failed to add question"); }
  };

  const updateQuestion = async (updates: any) => {
    if (!activeQuestionId) return;
    setQuestions(qs => qs.map(q => q.id === activeQuestionId ? { ...q, ...updates } : q));
    try { await api.patch(`/questions/${activeQuestionId}`, updates); }
    catch { toast.error("Failed to update"); }
  };

  const deleteQuestion = async () => {
    if (!activeQuestionId) return;
    try {
      await api.delete(`/questions/${activeQuestionId}`);
      toast.success("Question deleted");
      setActiveQuestionId(null);
      fetchForm();
    } catch { toast.error("Failed to delete"); }
  };

  if (!form) return (
    <div className="h-screen flex items-center justify-center text-gray-400 text-sm">Loading...</div>
  );

  const activeQuestion = questions.find(q => q.id === activeQuestionId);
  const activeIndex = questions.findIndex(q => q.id === activeQuestionId);

  return (
    <div className="flex flex-col h-screen font-sans bg-white text-gray-900 overflow-hidden">
      <Toaster richColors />

      {/* ── Add Content Modal ──────────────────────────────────────────────── */}
      {showAddModal && (
        <AddContentModal
          onClose={() => setShowAddModal(false)}
          onAdd={async (type) => {
            setShowAddModal(false);
            await addQuestion(type);
          }}
          onImport={async (lines) => {
            setShowAddModal(false);
            for (const title of lines) {
              try {
                await api.post(`/forms/${form.id}/questions`, {
                  title,
                  type: "short_text",
                  options: [],
                  config: {},
                });
              } catch {
                toast.error(`Failed to import: ${title}`);
              }
            }
            await fetchForm();
            toast.success(`${lines.length} questions imported`);
          }}
        />
      )}

      {/* ── Toolbar (matches Typeform top secondary bar) ──────────────────── */}
      <div className="h-10 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-2 shrink-0">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Add content
        </button>
        <div className="w-px h-5 bg-gray-300 mx-1" />
        {/* Design button */}
        <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 px-2 py-1.5 rounded hover:bg-gray-200 transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
          Design
        </button>

        {/* Device Toggles */}
        <button 
          onClick={() => setPreviewMode("desktop")}
          className={`p-1.5 rounded transition-colors ${previewMode === "desktop" ? "bg-white shadow text-gray-800" : "text-gray-500 hover:bg-gray-200"}`}
          title="Desktop view"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        </button>
        <button 
          onClick={() => setPreviewMode("mobile")}
          className={`p-1.5 rounded transition-colors ${previewMode === "mobile" ? "bg-white shadow text-gray-800" : "text-gray-500 hover:bg-gray-200"}`}
          title="Mobile view"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
        </button>

        {/* Play / Live Preview button */}
        <button 
          type="button"
          onClick={() => setShowLivePreview(true)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-all cursor-pointer ml-1"
          title="Live Preview"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          <span>Preview</span>
        </button>

        {/* Eye icon Preview */}
        <button 
          type="button"
          onClick={() => setShowLivePreview(true)}
          className="p-1.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          title="Live Preview"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>

        <div className="w-px h-5 bg-gray-300 mx-1" />
        {/* Info/Reload secondary icons */}
        <button type="button" className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors" title="Info">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        </button>
        <button type="button" onClick={() => fetchForm()} className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors" title="Reload form">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        </button>
      </div>

      {/* ── Top navigation bar ─────────────────────────────────────────────── */}
      <header className="h-12 bg-white border-b border-gray-200 flex items-center px-4 shrink-0 z-10">
        {/* Left: breadcrumb */}
        <div className="flex items-center gap-2 flex-1">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Forms
          </button>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300"><path d="m9 18 6-6-6-6"/></svg>
          <span className="text-sm font-semibold text-gray-900">{form.title}</span>
        </div>

        {/* Center: tabs */}
        <div className="flex items-center gap-1">
          <button className="px-4 py-1.5 text-sm font-medium text-gray-900 border-b-2 border-gray-900">Content</button>
          <button className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700 border-b-2 border-transparent">Workflow</button>
          <button className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700 border-b-2 border-transparent">Connect</button>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <button
            onClick={() => router.push(`/dashboard/forms/${form.id}/responses`)}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Results
          </button>
          <button
            onClick={() => setShowLivePreview(true)}
            className="text-sm text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer font-medium"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Preview
          </button>
          {form.status === "published" ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const url = `${window.location.origin}/f/${form.slug}`;
                  navigator.clipboard.writeText(url);
                  toast.success("Link copied to clipboard!");
                }}
                className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                title="Copy shareable link"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                Copy Link
              </button>
              <button
                onClick={async () => {
                  await api.post(`/forms/${form.id}/unpublish`);
                  toast.success("Unpublished");
                  fetchForm();
                }}
                className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Unpublish
              </button>
            </div>
          ) : (
            <button
              onClick={async () => {
                try {
                  const res = await api.post(`/forms/${form.id}/publish`);
                  const url = `${window.location.origin}/f/${res.slug}`;
                  navigator.clipboard.writeText(url);
                  toast.success("Published & link copied!");
                  fetchForm();
                } catch {
                  toast.error("Failed to publish");
                }
              }}
              className="bg-[#1A73E8] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Publish
            </button>
          )}
        </div>
      </header>

      {/* ── Main 3-pane area ────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT — question list sidebar */}
        <div className="w-[220px] bg-gray-50 border-r border-gray-200 flex flex-col shrink-0">
          {/* Pages header */}
          <div className="px-3 pt-4 pb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Pages</span>
          </div>

          <div className="flex-1 overflow-y-auto px-2">
            <DndContext 
              sensors={sensors} 
              collisionDetection={closestCenter} 
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                {questions.map((q, i) => (
                  <QuestionSidebarItem
                    key={q.id}
                    id={q.id}
                    question={q}
                    index={i}
                    totalQuestions={questions.length}
                    isSelected={activeQuestionId === q.id}
                    selectedSubField={selectedContactSubField}
                    onSelectSubField={(fieldId: string) => {
                      setActiveQuestionId(q.id);
                      setSelectedContactSubField(fieldId);
                    }}
                    onClick={() => {
                      setActiveQuestionId(q.id);
                    }}
                    menuOpen={menuQuestionId === q.id}
                    onToggleMenu={() => setMenuQuestionId(menuQuestionId === q.id ? null : q.id)}
                    onMoveUp={() => moveQuestion(i, i - 1)}
                    onMoveDown={() => moveQuestion(i, i + 1)}
                    onDuplicate={() => duplicateQuestion(q, i)}
                    onDelete={() => deleteQuestionById(q.id)}
                  />
                ))}
              </SortableContext>

              <DragOverlay dropAnimation={null}>
                {activeDragId ? (() => {
                  const draggedQ = questions.find(q => q.id === activeDragId);
                  if (!draggedQ) return null;
                  const cfg = TYPE_CONFIG[draggedQ.type] || TYPE_CONFIG.short_text;
                  const activeIdx = questions.findIndex(q => q.id === draggedQ.id);
                  return (
                    <div className="relative flex items-center w-[204px] pointer-events-none select-none">
                      {/* Horizontal guide line cutting across behind the dragged card */}
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-gray-500 z-0" />

                      {/* Lifted question card */}
                      <div className="relative z-10 w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 shadow-xl flex items-center gap-2 text-xs font-medium text-gray-800">
                        <div
                          className="px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1.5 shrink-0"
                          style={{ backgroundColor: cfg.bg, color: cfg.color }}
                        >
                          <div className="shrink-0">{cfg.icon}</div>
                          <span>{activeIdx + 1}</span>
                        </div>
                        <span className="truncate flex-1 font-medium text-gray-800">{draggedQ.title || "..."}</span>
                        <div className="text-gray-400 p-0.5 shrink-0 ml-auto">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  );
                })() : null}
              </DragOverlay>
            </DndContext>

            {/* Add Welcome Screen button (matches Typeform in Image 1) */}
            <div className="mt-2.5 mb-2">
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-dashed border-gray-300 bg-white/50 hover:bg-white text-gray-700 hover:text-gray-900 transition-colors text-xs font-medium cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500 group-hover:text-gray-800">
                    <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3A7 7 0 0 0 12 2z"/>
                  </svg>
                  <span>Add Welcome Screen</span>
                </div>
                <div className="w-5 h-5 rounded-md border border-gray-300 flex items-center justify-center text-gray-400 group-hover:text-gray-700 group-hover:border-gray-400 transition-colors">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                </div>
              </button>
            </div>

            {/* Divider handle */}
            <div className="w-8 h-1 bg-gray-300 rounded-full mx-auto my-2" />
          </div>

          {/* Endings section */}
          <div className="border-t border-gray-200/90 pt-3 pb-4 px-2">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-xs font-semibold text-gray-800 tracking-tight">Endings</span>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="w-5 h-5 rounded-md border border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-400 transition-colors cursor-pointer"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              </button>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-600 bg-white border border-gray-200/80 shadow-xs">
              <div className="w-5 h-5 rounded-md bg-green-100 flex items-center justify-center shrink-0">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <span className="font-medium text-gray-700">Thank you screen</span>
            </div>
          </div>
        </div>

        {/* CENTER — canvas preview */}
        <div className="flex-1 bg-white overflow-y-auto flex flex-col min-h-0">
          <QuestionCanvas 
            question={activeQuestion} 
            index={activeIndex} 
            onUpdate={updateQuestion} 
            previewMode={previewMode}
            selectedSubField={selectedContactSubField}
            onSelectSubField={setSelectedContactSubField}
            onOpenDropdownModal={() => setShowDropdownModal(true)}
          />
        </div>

        {/* RIGHT — question properties */}
        <div className="w-[280px] bg-white border-l border-gray-200 flex flex-col shrink-0">
          <QuestionPanel
            question={activeQuestion}
            onUpdate={updateQuestion}
            onDelete={deleteQuestion}
            onAddQuestion={addQuestion}
            onOpenDropdownModal={() => setShowDropdownModal(true)}
          />
        </div>
      </div>

      {/* ── Dropdown Choices Modal ─────────────────────────────────────────── */}
      {showDropdownModal && activeQuestion && (
        <DropdownChoicesModal
          isOpen={showDropdownModal}
          initialChoices={activeQuestion.options || []}
          onClose={() => setShowDropdownModal(false)}
          onSave={async (newChoices: string[]) => {
            let finalChoices = newChoices;
            if (activeQuestion.config?.alphabetical_order) {
              finalChoices = [...finalChoices].sort((a, b) => a.localeCompare(b));
            }
            await updateQuestion({ options: finalChoices });
            setShowDropdownModal(false);
            toast.success("Choices saved");
          }}
        />
      )}

      {/* ── Live Preview Modal (Interactive Test Player) ───────────────────── */}
      {showLivePreview && (
        <LivePreviewModal
          form={form}
          questions={questions}
          initialQuestionIndex={activeIndex >= 0 ? activeIndex : 0}
          initialMode={previewMode}
          onClose={() => setShowLivePreview(false)}
        />
      )}
    </div>
  );
}
