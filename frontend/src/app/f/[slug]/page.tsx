"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { api } from "@/lib/api";
import { QuestionRenderer } from "@/components/QuestionRenderer";
import { validateAnswer } from "@/lib/validation";

export default function RespondentFlow() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Track direction for animation
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    fetchForm();
  }, [slug]);

  const fetchForm = async () => {
    try {
      const data = await api.get(`/public/forms/${slug}`);
      setForm(data);
      setLoading(false);
    } catch (e: any) {
      setErrorStatus(e.response?.status || 404);
      setLoading(false);
    }
  };



  const handleNext = async () => {
    if (isSubmitting) return;

    const question = form.questions[currentIndex];
    const answer = answers[question.id] || "";
    const validationError = validateAnswer(question, answer);
    
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError(null);

    if (currentIndex < form.questions.length - 1) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    } else {
      await submitForm();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0 && !isSubmitting) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
      setError(null);
    }
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        answers: form.questions.map((q: any) => ({
          question_id: q.id,
          value: answers[q.id] || ""
        }))
      };
      await api.post(`/public/forms/${slug}/responses`, payload);
      setSubmitted(true);
    } catch (e: any) {
      if (e.response?.status === 422 && e.response?.data?.detail) {
        // e.g. [{"loc":["body","answers",0,"value"],"msg":"Field required","type":"value_error.missing"}]
        setError("There was a validation error on the server. Please check your answers.");
        setIsSubmitting(false);
      } else {
        setError("Failed to submit. Please try again.");
        setIsSubmitting(false);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't override default behavior for inputs unless it's Enter
      if (e.key === 'Enter') {
        // If it's a textarea, let Enter create a new line, but shift+Enter submits? Or just ignore Enter on textarea.
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag === 'textarea') {
           if (e.shiftKey) return; // Shift+Enter in textarea creates new line
           if (!e.shiftKey) { e.preventDefault(); handleNext(); }
        } else if (activeTag === 'button') {
           // Allow button clicks to happen naturally
        } else {
           e.preventDefault();
           handleNext();
        }
      } else if (e.key === 'ArrowDown') {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag !== 'textarea' && activeTag !== 'select' && activeTag !== 'input') {
          handleNext();
        }
      } else if (e.key === 'ArrowUp') {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag !== 'textarea' && activeTag !== 'select' && activeTag !== 'input') {
          handlePrevious();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, form, answers, isSubmitting]);


  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-gray-50 text-gray-400">Loading...</div>;

  if (errorStatus === 404 || !form) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800 font-sans">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">This form isn't available or has been unpublished.</p>
        <button onClick={() => router.push('/')} className="bg-black text-white px-6 py-2 rounded">Go Home</button>
      </div>
    );
  }

  const progressPercentage = form.questions.length > 0 ? (currentIndex / form.questions.length) * 100 : 100;

  if (submitted) {
    return (
      <div className="h-screen w-screen bg-gray-50 overflow-hidden font-sans">
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full w-full flex flex-col items-center justify-center text-center p-8"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600 text-4xl">✓</div>
            <h1 className="text-4xl font-bold mb-4">Thank you!</h1>
            <p className="text-xl text-gray-500">Your response has been recorded.</p>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  const activeQuestion = form.questions[currentIndex];

  const variants = {
    enter: (direction: number) => ({
      y: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      y: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      y: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  return (
    <div className="h-screen w-screen bg-white text-black flex flex-col font-sans overflow-hidden">
      {/* Top Progress Bar */}
      <div className="w-full h-1 bg-gray-200">
        <motion.div 
          className="h-full bg-black" 
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex-1 relative flex items-center justify-center px-4 md:px-12 w-full h-full">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full"
          >
            <div className="flex w-full items-start max-w-4xl mx-auto">
              {/* Question Number Badge */}
              <div className="flex font-semibold text-gray-900 text-sm md:text-xl pt-1 md:pt-2 mr-2.5 md:mr-6 items-center shrink-0">
                <span className="mr-1">{currentIndex + 1}</span> 
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </div>

              <div className="flex-1 min-w-0">
                <QuestionRenderer 
                  question={activeQuestion} 
                  answer={answers[activeQuestion.id]} 
                  setAnswer={(val: string) => {
                    setAnswers(prev => ({...prev, [activeQuestion.id]: val}));
                    setError(null);
                  }}
                  error={error}
                  onNext={handleNext}
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Keyboard Hint Bottom Right */}
      <div className="fixed bottom-4 right-4 flex space-x-2">
        <button 
          onClick={handlePrevious} 
          disabled={currentIndex === 0 || isSubmitting}
          className="bg-black text-white p-2 rounded hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
          aria-label="Previous question"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 15-6-6-6 6"/></svg>
        </button>
        <button 
          onClick={handleNext} 
          disabled={isSubmitting}
          className="bg-black text-white p-2 rounded hover:bg-gray-800 disabled:opacity-30 transition"
          aria-label="Next question"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
        </button>
      </div>
    </div>
  );
}
