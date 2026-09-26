"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneInputWithCountry } from "@/components/PhoneInputWithCountry";
import { validateAnswer } from "@/lib/validation";

interface LivePreviewModalProps {
  form: any;
  questions: any[];
  initialQuestionIndex?: number;
  initialMode?: "desktop" | "mobile";
  onClose: () => void;
}

export function LivePreviewModal({
  form,
  questions,
  initialQuestionIndex = 0,
  initialMode = "desktop",
  onClose,
}: LivePreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(
    Math.max(0, Math.min(initialQuestionIndex, (questions?.length || 1) - 1))
  );
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">(initialMode);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const activeQuestion = questions && questions.length > 0 ? questions[currentIndex] : null;
  const isLastQuestion = currentIndex === (questions?.length || 1) - 1;

  const currentAnswer = activeQuestion ? answers[activeQuestion.id] : undefined;

  const setAnswer = (val: any) => {
    if (!activeQuestion) return;
    setValidationError(null);
    setAnswers((prev) => ({ ...prev, [activeQuestion.id]: val }));
  };

  const handleNext = () => {
    if (activeQuestion) {
      const err = validateAnswer(activeQuestion, currentAnswer);
      if (err) {
        setValidationError(err);
        return;
      }
    }
    setValidationError(null);

    if (isLastQuestion) {
      handleSubmit();
      return;
    }
    setDirection(1);
    setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
    setDropdownOpen(false);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setValidationError(null);
      setDirection(-1);
      setCurrentIndex((prev) => Math.max(0, prev - 1));
      setDropdownOpen(false);
    }
  };

  const handleSubmit = () => {
    if (activeQuestion) {
      const err = validateAnswer(activeQuestion, currentAnswer);
      if (err) {
        setValidationError(err);
        return;
      }
    }
    setValidationError(null);
    setIsCompleted(true);
    setShowToast(true);
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentIndex(0);
    setIsCompleted(false);
    setShowToast(false);
    setDirection(1);
  };

  // Keyboard navigation: Enter advances, arrows move up/down
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted) return;
      if (e.key === "Enter") {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag === "textarea" && e.shiftKey) return;
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowDown") {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag !== "input" && tag !== "textarea") {
          handleNext();
        }
      } else if (e.key === "ArrowUp") {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag !== "input" && tag !== "textarea") {
          handlePrev();
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, isLastQuestion, isCompleted, questions]);

  const progressPercentage =
    questions && questions.length > 0
      ? ((currentIndex + 1) / questions.length) * 100
      : 100;

  const variants: any = {
    enter: (dir: number) => ({
      y: dir > 0 ? 55 : -55,
      opacity: 0,
      scale: 0.99,
    }),
    center: {
      zIndex: 1,
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        y: { type: "spring", stiffness: 320, damping: 30 },
        opacity: { duration: 0.28 },
        scale: { duration: 0.28 },
      },
    },
    exit: (dir: number) => ({
      zIndex: 0,
      y: dir > 0 ? -55 : 55,
      opacity: 0,
      scale: 0.99,
      transition: {
        y: { type: "spring", stiffness: 320, damping: 30 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
      },
    }),
  };

  // ── Helper to render Question Screen or Endings Screen ─────────────────────
  function renderScreenContent(isMobile: boolean) {
    if (isCompleted) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`flex-1 flex flex-col items-center justify-center text-center ${
            isMobile ? "px-5 py-6" : "px-6 py-12"
          } relative w-full h-full`}
        >
          {/* Checkmark circle */}
          <div
            className={`${
              isMobile ? "w-12 h-12" : "w-16 h-16"
            } rounded-full border-2 border-black flex items-center justify-center mb-5 text-black shadow-xs`}
          >
            <svg
              width={isMobile ? "20" : "26"}
              height={isMobile ? "20" : "26"}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h2
            className={`${
              isMobile ? "text-xl" : "text-2xl sm:text-3xl"
            } font-normal text-gray-900 mb-2 tracking-tight`}
          >
            Thanks for completing this typeform
          </h2>
          <p className={`${isMobile ? "text-sm" : "text-base sm:text-lg"} text-gray-700`}>
            Now <strong className="font-bold text-gray-900">create your own</strong> — it's free, easy &amp; beautiful
          </p>

          <div className="mt-7 flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleRestart}
              className="px-3.5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-xs font-semibold text-gray-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Restart
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg bg-gray-900 hover:bg-black text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs"
            >
              Back to editor
            </button>
          </div>

          {/* Bottom footer text */}
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2 text-[11px] text-gray-500 font-light select-none">
            <span>How you ask is everything</span>
          </div>
        </motion.div>
      );
    }

    if (!activeQuestion) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <p className="text-sm">No questions in this form yet.</p>
        </div>
      );
    }

    return (
      <div
        className={`flex-1 w-full h-full flex flex-col justify-center overflow-y-auto relative ${
          isMobile ? "px-5 py-4 pb-20" : "px-10 sm:px-16 md:px-24 py-12"
        }`}
      >
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={activeQuestion.id || currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full max-w-xl mx-auto flex flex-col justify-center"
          >
            {/* Question header */}
            <div className={`flex items-start ${isMobile ? "gap-2.5 mb-4" : "gap-3 mb-6"}`}>
              <span
                className={`bg-[#262627] text-white ${
                  isMobile ? "text-[11px] px-1.5 py-0.5 mt-0.5" : "text-xs px-2 py-0.5 mt-1"
                } font-bold rounded shrink-0`}
              >
                {currentIndex + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h1
                  className={`${
                    isMobile ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"
                  } font-medium text-gray-900 leading-snug`}
                >
                  {activeQuestion.title || "..."}
                  {activeQuestion.required && <span className="text-red-500 ml-1 font-bold">*</span>}
                </h1>
                {activeQuestion.help_text && (
                  <p className={`${isMobile ? "text-xs" : "text-sm"} text-gray-500 mt-1`}>
                    {activeQuestion.help_text}
                  </p>
                )}
              </div>
            </div>

            {/* Question Interactive Content */}
            <div className="mt-2 select-text">
              {renderInteractiveInput({
                question: activeQuestion,
                answer: currentAnswer,
                setAnswer,
                onNext: handleNext,
                dropdownOpen,
                setDropdownOpen,
                isMobile,
              })}
            </div>

            {/* Validation Error Message */}
            {validationError && (
              <div className="mt-3.5 flex items-center gap-2 text-xs font-semibold text-[#C2410C] bg-[#FFF7ED] border border-[#FDBA74] px-3.5 py-2 rounded-xl w-fit animate-in fade-in slide-in-from-top-1 shadow-2xs">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{validationError}</span>
              </div>
            )}

            {/* OK / Submit Button */}
            <div className={`${isMobile ? "mt-6" : "mt-8"} flex items-center gap-3`}>
              {isLastQuestion ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-[#262627] hover:bg-black text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <span>Submit</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-[#262627] hover:bg-black text-white px-5 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span>OK</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
              )}
              {!isMobile && (
                <span className="text-xs text-gray-400 font-light hidden sm:inline">
                  press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[11px] font-mono text-gray-600">Enter ↵</kbd>
                </span>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ── Helper to render Bottom Navigation Widget ─────────────────────────────
  function renderBottomNav(isMobile: boolean) {
    return (
      <div
        className={`absolute ${
          isMobile ? "bottom-3 right-3 gap-1.5" : "bottom-4 right-4 gap-2"
        } flex items-center z-30 select-none`}
      >
        <div className="flex rounded-md overflow-hidden bg-[#262627] shadow-md border border-gray-800">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`${
              isMobile ? "w-7 h-7" : "w-8 h-8"
            } flex items-center justify-center text-white hover:bg-black disabled:opacity-30 disabled:hover:bg-[#262627] transition-colors cursor-pointer`}
            aria-label="Previous question"
          >
            <svg width={isMobile ? "12" : "14"} height={isMobile ? "12" : "14"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m18 15-6-6-6 6" />
            </svg>
          </button>
          <div className={`w-px ${isMobile ? "h-7" : "h-8"} bg-gray-700`} />
          <button
            type="button"
            onClick={handleNext}
            disabled={currentIndex === (questions?.length || 1) - 1}
            className={`${
              isMobile ? "w-7 h-7" : "w-8 h-8"
            } flex items-center justify-center text-white hover:bg-black disabled:opacity-30 disabled:hover:bg-[#262627] transition-colors cursor-pointer`}
            aria-label="Next question"
          >
            <svg width={isMobile ? "12" : "14"} height={isMobile ? "12" : "14"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* Powered by Typeform badge */}
        <div
          className={`flex items-center gap-1 rounded-md bg-[#262627] text-white font-medium shadow-md ${
            isMobile ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-xs"
          }`}
        >
          <span className="text-gray-300">Powered by</span>
          <span className="font-bold flex items-center gap-1">
            <span className="w-2 h-2 bg-white rounded-xs inline-block" />
            Typeform
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#F4F4F5] flex flex-col font-sans select-none overflow-hidden animate-in fade-in duration-200">
      {/* ── Top Bar ───────────────────────────────────────────────────────── */}
      <header className="h-11 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-30">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-bold text-gray-700 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
            Live Preview
          </span>
          <span className="text-xs text-gray-500 font-medium truncate max-w-[200px] sm:max-w-xs">
            {form?.title || "Form Preview"}
          </span>
          <span className="text-[11px] text-gray-400 hidden md:inline">
            • Dummy test mode (responses will not be saved)
          </span>
        </div>

        {/* Center device toggles */}
        <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg border border-gray-200/60">
          <button
            type="button"
            onClick={() => setViewMode("desktop")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "desktop"
                ? "bg-white text-gray-900 shadow-xs font-medium"
                : "text-gray-500 hover:text-gray-800"
            }`}
            title="Desktop view"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("mobile")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "mobile"
                ? "bg-white text-gray-900 shadow-xs font-medium"
                : "text-gray-500 hover:text-gray-800"
            }`}
            title="Mobile view"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          </button>
        </div>

        {/* Right action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRestart}
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 px-2.5 py-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
            title="Restart test preview"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span className="hidden sm:inline">Restart</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-900 hover:bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
            Exit preview
          </button>
        </div>
      </header>

      {/* ── Outer Modal Progress Bar (Desktop view only) ─────────────────── */}
      {!isCompleted && viewMode === "desktop" && (
        <div className="w-full h-1 bg-gray-200 shrink-0">
          <motion.div
            className="h-full bg-black"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        </div>
      )}

      {/* ── Main Preview Canvas ───────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden relative">
        {viewMode === "mobile" ? (
          /* ── Authentic Smartphone Device Mockup (Mobile View) ────────────── */
          <div className="relative flex items-center justify-center h-full max-h-[820px] py-2 select-none">
            {/* Subtle physical side buttons */}
            <div className="hidden sm:block absolute -left-1 top-24 w-1 h-7 bg-gray-700 rounded-l" />
            <div className="hidden sm:block absolute -left-1 top-36 w-1 h-11 bg-gray-700 rounded-l" />
            <div className="hidden sm:block absolute -left-1 top-52 w-1 h-11 bg-gray-700 rounded-l" />
            <div className="hidden sm:block absolute -right-1 top-32 w-1 h-14 bg-gray-700 rounded-r" />

            {/* Smartphone Chassis */}
            <div className="w-[375px] max-w-[92vw] h-[720px] max-h-[82vh] bg-white rounded-[46px] border-[11px] border-[#18181B] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.08)] flex flex-col relative overflow-hidden ring-1 ring-black/5">
              {/* Top Status Bar */}
              <div className="w-full pt-3 px-6 pb-1 flex items-center justify-between text-xs font-semibold text-gray-900 shrink-0 z-30 select-none bg-white">
                <span className="font-semibold tracking-tight text-[12px]">9:41</span>
                {/* Dynamic Island pill */}
                <div className="w-24 h-5 bg-black rounded-full flex items-center justify-between px-2 shrink-0 shadow-2xs">
                  <div className="w-2 h-2 rounded-full bg-[#1c2a44] border border-[#222]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#111]" />
                </div>
                {/* Battery & Signals */}
                <div className="flex items-center gap-1.5 text-gray-900">
                  <svg width="13" height="11" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="2" y="14" width="3" height="8" rx="1" />
                    <rect x="7" y="10" width="3" height="12" rx="1" />
                    <rect x="12" y="6" width="3" height="16" rx="1" />
                    <rect x="17" y="2" width="3" height="20" rx="1" />
                  </svg>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4c-5 0-9.27 3.11-11 7.5.58.55 1.22 1.03 1.9 1.43C4.24 9.1 7.84 6.5 12 6.5s7.76 2.6 9.1 6.43c.68-.4 1.32-.88 1.9-1.43C21.27 7.11 17 4 12 4zm0 5c-3.1 0-5.75 1.94-6.83 4.67.62.5 1.32.92 2.08 1.23C7.94 13.56 9.8 12.5 12 12.5s4.06 1.06 4.75 2.4c.76-.31 1.46-.73 2.08-1.23C17.75 10.94 15.1 9 12 9zm0 5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z"/>
                  </svg>
                  <div className="w-5 h-2.5 border border-gray-900 rounded-[3px] p-0.5 flex items-center">
                    <div className="w-full h-full bg-gray-900 rounded-[1px]" />
                  </div>
                </div>
              </div>

              {/* In-Phone Top Progress Bar */}
              {!isCompleted && (
                <div className="w-full h-1 bg-gray-100 shrink-0 z-20">
                  <motion.div
                    className="h-full bg-black"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  />
                </div>
              )}

              {/* Phone Screen Contents */}
              <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col justify-center">
                {renderScreenContent(true)}
                {!isCompleted && renderBottomNav(true)}
              </div>

              {/* Bottom iOS Home Indicator */}
              <div className="w-32 h-1 bg-black/25 rounded-full mx-auto my-2 shrink-0 z-30 pointer-events-none" />
            </div>
          </div>
        ) : (
          /* ── Desktop Browser Viewport ──────────────────────────────────── */
          <div className="w-full h-full max-w-4xl bg-white rounded-2xl shadow-xl border border-gray-200/80 relative flex flex-col justify-center overflow-hidden">
            {renderScreenContent(false)}
            {!isCompleted && renderBottomNav(false)}
          </div>
        )}
      </div>

      {/* ── Test Successful Toast (Image 5) ─────────────────────────────────── */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white border border-emerald-400 rounded-lg shadow-xl px-4 py-3.5 flex items-start gap-3 max-w-sm">
            <div className="text-emerald-500 mt-0.5 shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="flex-1 text-xs text-gray-700 leading-relaxed">
              Test successful! View your published typeform to submit a real response.
            </div>
            <button
              type="button"
              onClick={() => setShowToast(false)}
              className="text-gray-400 hover:text-gray-600 cursor-pointer p-0.5 shrink-0"
              aria-label="Close notification"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Input renderers for all question types ───────────────────────────────────
function renderInteractiveInput({
  question,
  answer,
  setAnswer,
  onNext,
  dropdownOpen,
  setDropdownOpen,
  isMobile = false,
}: any) {
  const type = question.type;

  // 1. Contact Info
  if (type === "contact_info") {
    let parsed: any = {};
    try {
      parsed = typeof answer === "string" ? JSON.parse(answer || "{}") : answer || {};
    } catch {
      parsed = {};
    }

    const updateField = (field: string, val: string) => {
      const next = { ...parsed, [field]: val };
      setAnswer(JSON.stringify(next));
    };

    return (
      <div className={`${isMobile ? "space-y-3" : "space-y-4"} max-w-xl`}>
        {/* On desktop: 2 cols for first and last name. On mobile: stacked cleanly */}
        <div className={`grid ${isMobile ? "grid-cols-1 gap-2.5" : "grid-cols-2 gap-4"}`}>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">First name</label>
            <input
              type="text"
              placeholder="Jane"
              value={parsed.firstName || ""}
              onChange={(e) => updateField("firstName", e.target.value)}
              className={`w-full border-b border-gray-300 focus:border-black outline-none ${
                isMobile ? "text-base py-1" : "text-lg py-1.5"
              } bg-transparent placeholder:text-gray-300 font-light transition-colors`}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Last name</label>
            <input
              type="text"
              placeholder="Smith"
              value={parsed.lastName || ""}
              onChange={(e) => updateField("lastName", e.target.value)}
              className={`w-full border-b border-gray-300 focus:border-black outline-none ${
                isMobile ? "text-base py-1" : "text-lg py-1.5"
              } bg-transparent placeholder:text-gray-300 font-light transition-colors`}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone number</label>
          <PhoneInputWithCountry
            value={parsed.phone || ""}
            onChange={(val) => updateField("phone", val)}
            onEnter={onNext}
            compact={isMobile}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</label>
          <input
            type="email"
            placeholder="name@example.com"
            value={parsed.email || ""}
            onChange={(e) => updateField("email", e.target.value)}
            className={`w-full border-b border-gray-300 focus:border-black outline-none ${
              isMobile ? "text-base py-1" : "text-lg py-1.5"
            } bg-transparent placeholder:text-gray-300 font-light transition-colors`}
          />
        </div>
      </div>
    );
  }

  // 2. Dropdown
  if (type === "dropdown") {
    const options = question.options && question.options.length > 0 ? question.options : ["Option 1", "Option 2"];
    return (
      <div className="relative max-w-xl">
        <div
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`w-full border-b border-gray-300 focus-within:border-black ${
            isMobile ? "py-2" : "py-2.5"
          } flex items-center justify-between cursor-pointer transition-colors`}
        >
          <span className={`${isMobile ? "text-base" : "text-xl"} ${answer ? "text-gray-900 font-normal" : "text-gray-400 font-light"}`}>
            {answer || question.config?.custom_placeholder_text || "Type or select an option"}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>

        {dropdownOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-40 max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
            {options.map((opt: string, i: number) => (
              <div
                key={i}
                onClick={() => {
                  setAnswer(opt);
                  setDropdownOpen(false);
                }}
                className={`px-4 py-2 ${isMobile ? "text-sm" : "text-base"} cursor-pointer transition-colors ${
                  answer === opt ? "bg-gray-100 font-semibold text-gray-900" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 3. Multiple Choice
  if (type === "multiple_choice" || type === "checkbox") {
    const options = question.options && question.options.length > 0 ? question.options : ["choice 1"];
    return (
      <div className={`space-y-2.5 max-w-xl`}>
        {options.map((opt: string, i: number) => {
          const isSelected = answer === opt;
          return (
            <div
              key={i}
              onClick={() => setAnswer(opt)}
              className={`flex items-center justify-between ${
                isMobile ? "px-3.5 py-2.5 rounded-xl" : "px-4 py-3 rounded-xl"
              } border transition-all cursor-pointer select-none ${
                isSelected
                  ? "border-[#262627] bg-white shadow-xs"
                  : "border-gray-200/90 bg-[#F8F9FA] hover:bg-gray-100/70"
              }`}
            >
              <span className={`${isMobile ? "text-sm" : "text-base"} font-normal text-gray-800`}>
                {opt || `Choice ${i + 1}`}
              </span>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                  isSelected ? "border-gray-900" : "border-gray-300"
                }`}
              >
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-gray-900" />}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // 4. Short Text
  if (type === "short_text") {
    return (
      <input
        type="text"
        autoFocus
        placeholder="Type your answer here..."
        value={answer || ""}
        onChange={(e) => setAnswer(e.target.value)}
        className={`w-full border-b border-gray-300 focus:border-black outline-none ${
          isMobile ? "text-xl py-1.5" : "text-2xl py-2"
        } bg-transparent placeholder:text-gray-300 font-light transition-colors`}
      />
    );
  }

  // 5. Long Text
  if (type === "long_text") {
    return (
      <textarea
        autoFocus
        rows={isMobile ? 3 : 4}
        placeholder="Type your answer here..."
        value={answer || ""}
        onChange={(e) => setAnswer(e.target.value)}
        className={`w-full border-b border-gray-300 focus:border-black outline-none ${
          isMobile ? "text-base py-1.5" : "text-xl py-2"
        } bg-transparent placeholder:text-gray-300 font-light transition-colors resize-none`}
      />
    );
  }

  // 6. Email
  if (type === "email") {
    return (
      <input
        type="email"
        autoFocus
        placeholder="name@example.com"
        value={answer || ""}
        onChange={(e) => setAnswer(e.target.value)}
        className={`w-full border-b border-gray-300 focus:border-black outline-none ${
          isMobile ? "text-xl py-1.5" : "text-2xl py-2"
        } bg-transparent placeholder:text-gray-300 font-light transition-colors`}
      />
    );
  }

  // 7. Number
  if (type === "number") {
    return (
      <input
        type="number"
        autoFocus
        placeholder="0"
        value={answer || ""}
        onChange={(e) => setAnswer(e.target.value)}
        className={`w-full border-b border-gray-300 focus:border-black outline-none ${
          isMobile ? "text-xl py-1.5" : "text-2xl py-2"
        } bg-transparent placeholder:text-gray-300 font-light transition-colors`}
      />
    );
  }

  // 8. Phone Number
  if (type === "phone_number") {
    return (
      <PhoneInputWithCountry
        value={answer || ""}
        onChange={(val) => setAnswer(val)}
        onEnter={onNext}
        autoFocus
        compact={isMobile}
      />
    );
  }

  // 9. Yes / No
  if (type === "yes_no") {
    return (
      <div className={`flex flex-col ${isMobile ? "gap-2" : "gap-2.5"} max-w-sm w-full`}>
        {[
          { label: "Yes", badge: "Y", color: "#00A389" },
          { label: "No", badge: "N", color: "#EF4444" },
        ].map(({ label, badge, color }) => {
          const isSelected = answer === label;
          return (
            <div
              key={label}
              onClick={() => {
                setAnswer(label);
                setTimeout(() => onNext?.(), 250);
              }}
              className={`flex items-center gap-3 ${
                isMobile ? "px-3.5 py-2.5 rounded-xl" : "px-4 py-3 rounded-xl"
              } border transition-all cursor-pointer select-none ${
                isSelected
                  ? "border-[#262627] bg-[#F4F4F5] shadow-xs"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div
                className={`${
                  isMobile ? "w-6 h-6 text-[11px]" : "w-7 h-7 text-xs"
                } rounded-md flex items-center justify-center font-bold shrink-0 text-white shadow-xs`}
                style={{ backgroundColor: color }}
              >
                {badge}
              </div>
              <span className={`text-gray-900 font-medium ${isMobile ? "text-sm" : "text-base"}`}>{label}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // 10. Rating
  if (type === "rating") {
    const count = question.config?.steps || question.config?.scale || 5;
    const currentVal = answer ? parseInt(answer) : 0;
    return (
      <div className={`flex items-center ${isMobile ? "gap-2.5 mt-2" : "gap-4 sm:gap-6 mt-3"} select-none`}>
        {Array.from({ length: count }).map((_, i) => {
          const val = i + 1;
          const isFilled = currentVal >= val;
          return (
            <button
              key={val}
              type="button"
              onClick={() => {
                setAnswer(String(val));
                setTimeout(() => onNext?.(), 250);
              }}
              className="flex flex-col items-center gap-1 transition-transform hover:scale-110 active:scale-95 cursor-pointer outline-none"
            >
              <svg
                width={isMobile ? "28" : "38"}
                height={isMobile ? "28" : "38"}
                viewBox="0 0 24 24"
                fill={isFilled ? "#181D27" : "none"}
                stroke="#181D27"
                strokeWidth="1.5"
                className="transition-colors"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span className={`text-[11px] ${isFilled ? "font-bold text-gray-900" : "text-gray-400"}`}>{val}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // 11. Opinion Scale / NPS
  if (type === "opinion_scale" || type === "net_promoter_score") {
    const isNps = type === "net_promoter_score";
    const startAt = isNps ? 0 : (question.config?.start_at !== undefined ? Number(question.config.start_at) : 0);
    const endAt = isNps ? 10 : (question.config?.end_at !== undefined ? Number(question.config.end_at) : 10);
    const steps = Array.from({ length: Math.max(1, endAt - startAt + 1) }, (_, i) => startAt + i);

    return (
      <div className="w-full max-w-xl">
        <div className={`flex ${isMobile ? "gap-1 overflow-x-auto pb-1.5 scrollbar-none" : "gap-1.5 sm:gap-2"}`}>
          {steps.map((val) => {
            const isSelected = answer === String(val);
            return (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setAnswer(String(val));
                  setTimeout(() => onNext?.(), 250);
                }}
                className={`${
                  isMobile
                    ? "flex-1 min-w-[26px] h-9 text-xs rounded-md"
                    : "flex-1 aspect-square rounded-lg text-sm"
                } font-semibold transition-all border cursor-pointer flex items-center justify-center select-none ${
                  isSelected
                    ? "bg-[#181D27] text-white border-[#181D27] shadow-xs"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                }`}
              >
                {val}
              </button>
            );
          })}
        </div>
        <div className="flex justify-between mt-2.5 text-xs text-gray-500 font-normal select-none">
          <span>{question.config?.left_label || (isNps ? "Not likely at all" : "")}</span>
          <span>{question.config?.right_label || (isNps ? "Extremely likely" : "")}</span>
        </div>
      </div>
    );
  }

  // 12. Legal
  if (type === "legal") {
    const opts = question.options && question.options.length >= 2 ? question.options : ["I accept", "I don't accept"];
    return (
      <div className={`flex flex-col ${isMobile ? "gap-2" : "gap-2.5"} max-w-sm w-full`}>
        {opts.map((opt: string, i: number) => {
          const isSelected = answer === opt;
          return (
            <div
              key={i}
              onClick={() => {
                setAnswer(opt);
                setTimeout(() => onNext?.(), 250);
              }}
              className={`flex items-center gap-3 ${
                isMobile ? "px-3.5 py-2.5 rounded-xl" : "px-4 py-3 rounded-xl"
              } border transition-all cursor-pointer select-none ${
                isSelected
                  ? "border-[#262627] bg-[#F4F4F5] shadow-xs"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="w-6 h-6 rounded-md bg-[#262627] text-white flex items-center justify-center text-xs font-bold">
                {String.fromCharCode(65 + i)}
              </div>
              <span className={`text-gray-900 font-medium ${isMobile ? "text-sm" : "text-base"}`}>{opt}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // 13. Address
  if (type === "address") {
    let parsed: any = {};
    try {
      parsed = typeof answer === "string" ? JSON.parse(answer || "{}") : answer || {};
    } catch {
      parsed = {};
    }
    const updateField = (f: string, v: string) => {
      const next = { ...parsed, [f]: v };
      setAnswer(JSON.stringify(next));
    };

    return (
      <div className={`${isMobile ? "space-y-3" : "space-y-4"} max-w-xl`}>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Address</label>
          <input
            type="text"
            placeholder="65 Hansen Way"
            value={parsed.address || ""}
            onChange={(e) => updateField("address", e.target.value)}
            className="w-full border-b border-gray-300 focus:border-black outline-none text-base py-1 bg-transparent placeholder:text-gray-300 font-light"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Address line 2</label>
          <input
            type="text"
            placeholder="Apartment 4"
            value={parsed.address_line_2 || ""}
            onChange={(e) => updateField("address_line_2", e.target.value)}
            className="w-full border-b border-gray-300 focus:border-black outline-none text-base py-1 bg-transparent placeholder:text-gray-300 font-light"
          />
        </div>
        <div className={`grid ${isMobile ? "grid-cols-1 gap-2.5" : "grid-cols-2 gap-4"}`}>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">City/Town</label>
            <input
              type="text"
              placeholder="Palo Alto"
              value={parsed.city || ""}
              onChange={(e) => updateField("city", e.target.value)}
              className="w-full border-b border-gray-300 focus:border-black outline-none text-base py-1 bg-transparent placeholder:text-gray-300 font-light"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">State/Region</label>
            <input
              type="text"
              placeholder="California"
              value={parsed.state || ""}
              onChange={(e) => updateField("state", e.target.value)}
              className="w-full border-b border-gray-300 focus:border-black outline-none text-base py-1 bg-transparent placeholder:text-gray-300 font-light"
            />
          </div>
        </div>
        <div className={`grid ${isMobile ? "grid-cols-1 gap-2.5" : "grid-cols-2 gap-4"}`}>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Zip/Post code</label>
            <input
              type="text"
              placeholder="94304"
              value={parsed.zip || ""}
              onChange={(e) => updateField("zip", e.target.value)}
              className="w-full border-b border-gray-300 focus:border-black outline-none text-base py-1 bg-transparent placeholder:text-gray-300 font-light"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Country</label>
            <input
              type="text"
              placeholder="United States"
              value={parsed.country || ""}
              onChange={(e) => updateField("country", e.target.value)}
              className="w-full border-b border-gray-300 focus:border-black outline-none text-base py-1 bg-transparent placeholder:text-gray-300 font-light"
            />
          </div>
        </div>
      </div>
    );
  }

  // Fallback default input
  return (
    <input
      type="text"
      placeholder="Type your answer here..."
      value={answer || ""}
      onChange={(e) => setAnswer(e.target.value)}
      className={`w-full border-b border-gray-300 focus:border-black outline-none ${
        isMobile ? "text-xl py-1.5" : "text-2xl py-2"
      } bg-transparent placeholder:text-gray-300 font-light transition-colors`}
    />
  );
}
