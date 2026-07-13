/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  RotateCcw, 
  Check, 
  X, 
  Timer, 
  Award, 
  AlertTriangle, 
  ArrowRight,
  ChevronRight,
  HelpCircle
} from "lucide-react";
import { QUIZ_QUESTIONS, Question } from "./data";

export default function App() {
  // Game states
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [submittedCount, setSubmittedCount] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isTimedOut, setIsTimedOut] = useState<boolean>(false);

  // Derive active question
  const currentQuestion: Question | undefined = QUIZ_QUESTIONS[currentQuestionIndex];
  const isCompleted = quizStarted && currentQuestionIndex >= QUIZ_QUESTIONS.length;

  // Countdown timer logic
  useEffect(() => {
    if (!quizStarted || isSubmitted || isTimedOut || isCompleted) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimedOut(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quizStarted, isSubmitted, isTimedOut, currentQuestionIndex, isCompleted]);

  // Handle start quiz
  const handleStart = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSubmittedCount(0);
    setSelectedOptionIndex(null);
    setIsSubmitted(false);
    setTimeLeft(30);
    setIsTimedOut(false);
  };

  // Handle option select
  const handleSelectOption = (index: number) => {
    if (isSubmitted || isTimedOut) return;
    setSelectedOptionIndex(index);
  };

  // Handle submit answer
  const handleSubmit = () => {
    if (selectedOptionIndex === null || isSubmitted || isTimedOut || !currentQuestion) return;

    const correct = selectedOptionIndex === currentQuestion.correctIndex;
    if (correct) {
      setScore((prev) => prev + 1);
    }
    setSubmittedCount((prev) => prev + 1);
    setIsSubmitted(true);
  };

  // Handle loading next question
  const handleNext = () => {
    setSelectedOptionIndex(null);
    setIsSubmitted(false);
    setTimeLeft(30);
    setIsTimedOut(false);
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  // Handle restart quiz (completely resets everything to unstarted state)
  const handleRestart = () => {
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSubmittedCount(0);
    setSelectedOptionIndex(null);
    setIsSubmitted(false);
    setTimeLeft(30);
    setIsTimedOut(false);
  };

  // SVG circular progress calculation
  // Radius of circle = 24, circumference = 2 * Math.PI * 24 ≈ 150.79
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = submittedCount > 0 ? score / submittedCount : 0;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between py-8 px-4 sm:px-6 md:px-8 select-none relative overflow-hidden text-slate-800">
      {/* Background Decorative Polished Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Header Container conforming to Professional Polish */}
      <header className="w-full max-w-4xl mx-auto flex flex-row justify-between items-center gap-4 relative z-10 border-b border-slate-200/60 pb-5">
        {/* Live কুইজ branding */}
        <div id="live-logo-branding" className="flex items-center gap-3">
          <div className="bg-blue-600 text-white font-bold text-xl h-11 w-11 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20">
            Lক
          </div>
          <div className="flex flex-col">
            <h1 id="app-brand" className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Live কুইজ
            </h1>
            <span className="text-[10px] font-bold tracking-widest text-blue-600 uppercase">
              Daily Challenge
            </span>
          </div>
        </div>

        {/* Circular Indicator displaying the user's score and progress at the top right */}
        <div id="progress-indicator-top" className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          <div className="relative w-14 h-14 bg-white rounded-full shadow-sm border border-slate-200/80 flex items-center justify-center">
            {/* SVG Circular Progress Meter */}
            <svg className="absolute top-0 left-0 w-full h-full -rotate-90">
              <circle
                cx="28"
                cy="28"
                r={radius}
                className="stroke-slate-100"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="28"
                cy="28"
                r={radius}
                className="stroke-blue-600 transition-all duration-500 ease-out"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <span id="score-fraction" className="font-mono font-bold text-sm text-slate-900 z-10">
              {score}/{submittedCount}
            </span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden sm:block">
            Current Progress
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-3xl mx-auto my-auto relative z-10 py-8">
        
        {/* Title Block from Professional Polish */}
        <div className="w-full text-center mb-8">
          <h2 id="quiz-main-title" className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
            Daily Quiz Challenge
          </h2>
          <div className="flex items-center justify-center gap-3 text-slate-500 font-semibold text-xs sm:text-sm">
            <span className="px-3 py-1 bg-slate-100 rounded-full">Category: General Knowledge</span>
            <span className="px-3 py-1 bg-slate-100 rounded-full">Level: Intermediate</span>
          </div>
        </div>

        {/* Dynamic Quiz Card */}
        <div 
          id="main-card" 
          className="bg-white rounded-2xl shadow-xl shadow-slate-100 border border-slate-200/60 p-6 sm:p-8 md:p-10 flex flex-col relative overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {/* 1. NOT STARTED STATE */}
            {!quizStarted && (
              <motion.div
                key="not-started"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="w-full text-center flex flex-col items-center gap-6 py-6"
                id="state-not-started"
              >
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100 shadow-sm">
                  <HelpCircle className="w-8 h-8" />
                </div>
                <div className="space-y-3 max-w-md">
                  <h3 className="text-xl font-bold text-slate-900">Ready to test your knowledge?</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Welcome to Live কুইজ! You will face a series of interactive, multiple-choice questions. Remember, each question has a strict 30-second timer. Think fast!
                  </p>
                </div>
                
                <button
                  id="start-button"
                  onClick={handleStart}
                  className="w-full sm:w-auto min-w-[200px] py-4 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Start Quiz
                </button>
              </motion.div>
            )}

            {/* 2. TIMED OUT STATE */}
            {quizStarted && isTimedOut && (
              <motion.div
                key="timed-out"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-full text-center flex flex-col items-center gap-6 py-6"
                id="state-timed-out"
              >
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center border border-red-100 animate-bounce">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="space-y-3 max-w-md">
                  <h3 className="font-display font-extrabold text-2xl text-slate-900">Time's Up!</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    You ran out of time! Each question requires an answer or submission within 30 seconds. Try again to get a perfect streak!
                  </p>
                </div>
                
                <button
                  id="restart-button-timeout"
                  onClick={handleRestart}
                  className="w-full sm:w-auto min-w-[200px] py-4 px-8 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 cursor-pointer"
                >
                  <RotateCcw className="w-5 h-5" />
                  Restart Quiz
                </button>
              </motion.div>
            )}

            {/* 3. COMPLETED STATE */}
            {isCompleted && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="w-full text-center flex flex-col items-center gap-6 py-4"
                id="state-completed"
              >
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100 shadow-sm">
                  <Award className="w-10 h-10" />
                </div>
                <div className="space-y-3 max-w-md">
                  <h3 className="font-display font-extrabold text-3xl text-slate-900">Quiz Completed!</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {score === QUIZ_QUESTIONS.length 
                      ? "Outstanding! You got a perfect score! 🏆" 
                      : score >= QUIZ_QUESTIONS.length / 2 
                      ? "Great job! You played exceptionally well. 🎉" 
                      : "Good effort! Practice makes perfect. Try again!"}
                  </p>
                </div>

                <div className="w-full max-w-sm bg-slate-50 border border-slate-100 rounded-xl p-5 flex justify-between items-center text-sm font-semibold text-slate-700">
                  <span>Accuracy Rate</span>
                  <span className="text-blue-600 font-mono font-bold text-lg">
                    {submittedCount > 0 ? Math.round((score / submittedCount) * 100) : 0}%
                  </span>
                </div>
                
                <button
                  id="restart-button-complete"
                  onClick={handleRestart}
                  className="w-full sm:w-auto min-w-[200px] py-4 px-8 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 cursor-pointer"
                >
                  <RotateCcw className="w-5 h-5" />
                  Restart Challenge
                </button>
              </motion.div>
            )}

            {/* 4. ACTIVE QUIZ STATE */}
            {quizStarted && !isTimedOut && !isCompleted && currentQuestion && (
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="w-full flex flex-col"
                id={`question-block-${currentQuestionIndex}`}
              >
                {/* Header question text and Timer label */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                  <div className="flex flex-col gap-1">
                    <span id="question-progress" className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
                      Question {currentQuestionIndex + 1} of {QUIZ_QUESTIONS.length}
                    </span>
                    <p id="question-text" className="font-semibold text-lg sm:text-xl text-slate-800 leading-snug">
                      {currentQuestion.question}
                    </p>
                  </div>
                  
                  <div className="sm:text-right shrink-0">
                    <span 
                      id="timer-countdown" 
                      className={`text-sm font-bold block uppercase tracking-wide font-mono ${
                        timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-amber-600'
                      }`}
                    >
                      {timeLeft < 10 ? `00:0${timeLeft}` : `00:${timeLeft}`}
                    </span>
                  </div>
                </div>

                {/* Timer Countdown Bar conforming to Professional Polish */}
                <div id="timer-bar-container" className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-6">
                  <div 
                    className={`h-full transition-all duration-1000 ease-linear ${
                      timeLeft <= 10 ? 'bg-red-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${(timeLeft / 30) * 100}%` }}
                  />
                </div>

                {/* Options Grid from Professional Polish */}
                <div id="options-list" className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedOptionIndex === index;
                    const isCorrectOption = index === currentQuestion.correctIndex;
                    
                    // Style determination based on submission
                    let optionStyle = "border-2 border-slate-200 text-slate-700 bg-white hover:border-slate-300 hover:bg-slate-50";
                    let iconToRender = null;

                    if (isSubmitted) {
                      if (isSelected && isCorrectOption) {
                        // Correct selected
                        optionStyle = "bg-[#DCFCE7] border-[#22C55E] text-[#166534] font-semibold";
                        iconToRender = (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#22C55E] shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                        );
                      } else if (isSelected && !isCorrectOption) {
                        // Incorrect selected
                        optionStyle = "bg-[#FEE2E2] border-[#EF4444] text-[#991B1B] font-semibold";
                        iconToRender = (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#EF4444] shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                          </svg>
                        );
                      } else if (isCorrectOption) {
                        // Correct but not selected (must automatically turn Green)
                        optionStyle = "bg-[#DCFCE7] border-[#22C55E] text-[#166534] font-semibold";
                        iconToRender = (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#22C55E] shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                        );
                      } else {
                        // Unselected incorrect options
                        optionStyle = "bg-slate-50 border-slate-100 text-slate-400 opacity-60";
                      }
                    } else if (isSelected) {
                      // Selected state (before submit) - Blue themed focus
                      optionStyle = "border-blue-600 bg-blue-50/50 text-blue-950 font-bold shadow-sm shadow-blue-600/5";
                    }

                    return (
                      <button
                        key={index}
                        id={`option-button-${index}`}
                        onClick={() => handleSelectOption(index)}
                        disabled={isSubmitted}
                        className={`w-full p-5 rounded-xl text-left text-sm md:text-base transition-all flex items-center justify-between gap-3 ${optionStyle} ${!isSubmitted ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'}`}
                      >
                        <span className="leading-tight">{option}</span>
                        {iconToRender}
                      </button>
                    );
                  })}
                </div>

                {/* Submit / Next Button Container */}
                <div id="action-button-container" className="flex flex-col sm:flex-row gap-4">
                  {!isSubmitted ? (
                    <button
                      id="submit-button"
                      onClick={handleSubmit}
                      disabled={selectedOptionIndex === null}
                      className={`flex-1 py-4 px-6 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 ${
                        selectedOptionIndex !== null
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/10 cursor-pointer active:scale-[0.98]"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      Submit
                    </button>
                  ) : (
                    <button
                      id="next-button"
                      onClick={handleNext}
                      className="flex-1 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/10 active:scale-[0.98] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Next Question
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer conforming to Professional Polish */}
      <footer className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-slate-400 text-sm border-t border-slate-200/60 pt-6">
        <p>© {new Date().getFullYear()} Live কুইজ • Minimalist Learning</p>
        <div className="flex gap-6 font-medium text-xs">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            Server Active
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-400">Session ID: #88219</span>
        </div>
      </footer>
    </div>
  );
}

