"use client";

import { useState, useEffect } from "react";
import { 
  Play, 
  RotateCcw, 
  Check, 
  X, 
  Timer, 
  Award, 
  AlertTriangle, 
  ChevronRight,
  HelpCircle
} from "lucide-react";
import { QUIZ_QUESTIONS, Question } from "../data";
import { getSupabase } from "../lib/supabase";
import { quizAudio } from "../lib/audio";

export default function Home() {
  // Database states
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);

  // Game states
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [submittedCount, setSubmittedCount] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isTimedOut, setIsTimedOut] = useState<boolean>(false);

  // Fetch questions on mount
  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        setError(null);
        const supabase = getSupabase();
        
        // Fetch questions from supabase 'questions' table
        // We fetch with select("*") without order to prevent the query from failing if 'id' column has a different name/case
        const { data, error: sbError } = await supabase
          .from("questions")
          .select("*");

        if (sbError) {
          throw sbError;
        }

        if (data && data.length > 0) {
          const mappedQuestions: Question[] = data.map((q: any) => {
            // 1. Find question text defensively
            let questionText = "Untitled Question";
            const possibleQuestionKeys = ["question", "question_text", "text", "questiontext", "title"];
            for (const key of possibleQuestionKeys) {
              if (q[key] !== undefined && q[key] !== null) {
                questionText = String(q[key]);
                break;
              }
            }
            if (questionText === "Untitled Question") {
              const keys = Object.keys(q);
              const foundKey = keys.find(k => k.toLowerCase() === "question" || k.toLowerCase().includes("question"));
              if (foundKey) {
                questionText = String(q[foundKey]);
              }
            }

            // 2. Find options defensively
            let rawOptions: any = null;
            const possibleOptionKeys = ["options", "choices", "answers", "answers_list", "option_list"];
            for (const key of possibleOptionKeys) {
              if (q[key] !== undefined && q[key] !== null) {
                rawOptions = q[key];
                break;
              }
            }
            if (rawOptions === null) {
              const keys = Object.keys(q);
              const foundKey = keys.find(k => k.toLowerCase() === "options" || k.toLowerCase() === "choices" || k.toLowerCase().includes("option") || k.toLowerCase().includes("choice"));
              if (foundKey) {
                rawOptions = q[foundKey];
              }
            }

            let options: string[] = [];
            if (Array.isArray(rawOptions)) {
              options = rawOptions.map(String);
            } else if (typeof rawOptions === "string") {
              try {
                const parsed = JSON.parse(rawOptions);
                if (Array.isArray(parsed)) {
                  options = parsed.map(String);
                } else if (typeof parsed === "object" && parsed !== null) {
                  options = Object.values(parsed).map(String);
                } else {
                  options = [rawOptions];
                }
              } catch {
                options = rawOptions.split(",").map((s: string) => s.trim());
              }
            } else if (typeof rawOptions === "object" && rawOptions !== null) {
              options = Object.values(rawOptions).map(String);
            } else {
              options = ["Option 1", "Option 2", "Option 3", "Option 4"];
            }

            // 3. Find correct index defensively supporting lowercase, snake_case, camelCase variants
            let correctIndexVal: any = undefined;
            const possibleIndexKeys = [
              "correctIndex", "correct_index", "correctOptionIndex", "correct_option_index",
              "correctoptionindex", "correct_option", "correctoption", "correct", "answer",
              "answer_index", "answerindex"
            ];
            for (const key of possibleIndexKeys) {
              if (q[key] !== undefined && q[key] !== null) {
                correctIndexVal = q[key];
                break;
              }
            }
            if (correctIndexVal === undefined) {
              const keys = Object.keys(q);
              const foundKey = keys.find(k => {
                const lower = k.toLowerCase();
                return lower.includes("correct") || lower.includes("answer") || lower === "index";
              });
              if (foundKey) {
                correctIndexVal = q[foundKey];
              }
            }

            let correctIndex = 0;
            if (correctIndexVal !== undefined && correctIndexVal !== null) {
              if (typeof correctIndexVal === "string") {
                const parsedNum = parseInt(correctIndexVal, 10);
                if (!isNaN(parsedNum) && parsedNum >= 0 && parsedNum < options.length) {
                  correctIndex = parsedNum;
                } else {
                  const foundIdx = options.findIndex(opt => opt.toLowerCase().trim() === correctIndexVal.toLowerCase().trim());
                  if (foundIdx !== -1) {
                    correctIndex = foundIdx;
                  } else {
                    correctIndex = 0;
                  }
                }
              } else if (typeof correctIndexVal === "number") {
                correctIndex = correctIndexVal;
              }
            }

            // 4. Find id is present
            let id = Date.now();
            if (q.id !== undefined && q.id !== null) {
              id = Number(q.id);
            } else {
              const keys = Object.keys(q);
              const foundIdKey = keys.find(k => k.toLowerCase() === "id");
              if (foundIdKey) {
                id = Number(q[foundIdKey]);
              }
            }

            return {
              id,
              question: questionText,
              options,
              correctIndex
            };
          });

          // Sort defensively in memory if id exists
          mappedQuestions.sort((a, b) => a.id - b.id);

          setQuestions(mappedQuestions);
          setIsUsingFallback(false);
        } else {
          // Empty table fallback
          console.log("Supabase table 'questions' is empty. Loading local quiz questions.");
          setQuestions(QUIZ_QUESTIONS);
          setIsUsingFallback(true);
        }
      } catch (err: any) {
        console.warn("Failed to fetch questions from Supabase, falling back to local questions:", err);
        setError(err.message || "Failed to load questions from database.");
        setQuestions(QUIZ_QUESTIONS);
        setIsUsingFallback(true);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, []);

  // Derive active question
  const currentQuestion: Question | undefined = questions[currentQuestionIndex];
  const isCompleted = quizStarted && questions.length > 0 && currentQuestionIndex >= questions.length;

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
    if (questions.length === 0) return;
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
    quizAudio.playClick();
  };

  // Handle submit answer
  const handleSubmit = () => {
    if (selectedOptionIndex === null || isSubmitted || isTimedOut || !currentQuestion) return;

    const correct = selectedOptionIndex === currentQuestion.correctIndex;
    if (correct) {
      setScore((prev) => prev + 1);
      quizAudio.playSuccess();
    } else {
      quizAudio.playError();
    }
    setSubmittedCount((prev) => prev + 1);
    setIsSubmitted(true);

    try {
      const supabase = getSupabase();
      if (supabase) {
        console.log("Supabase integrated, ready for database operations.");
      }
    } catch (err) {
      console.warn("Supabase not fully configured yet:", err);
    }
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
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-3 text-slate-500 font-semibold text-xs sm:text-sm">
              <span className="px-3 py-1 bg-slate-100 rounded-full">Category: General Knowledge</span>
              <span className="px-3 py-1 bg-slate-100 rounded-full">Level: Intermediate</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-[11px] font-mono mt-1">
              {!loading && (
                isUsingFallback ? (
                  <span 
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-100/70 shadow-sm cursor-help"
                    title={error || "Table is empty or not configured. Using local questions."}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    Database: Offline Fallback Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 border border-green-100/70 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Database: Connected to Supabase
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Quiz Card */}
        <div 
          id="main-card" 
          className="bg-white rounded-2xl shadow-xl shadow-slate-100 border border-slate-200/60 p-6 sm:p-8 md:p-10 flex flex-col relative overflow-hidden"
        >
          <div>
            {/* 0. LOADING STATE */}
            {loading && (
              <div
                className="w-full text-center flex flex-col items-center gap-6 py-12 transition-all duration-300 animate-fade-in"
                id="state-loading"
              >
                <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin flex items-center justify-center shadow-inner" />
                <div className="space-y-2 max-w-md">
                  <h3 className="text-lg font-bold text-slate-900">Loading quiz questions...</h3>
                  <p className="text-slate-400 text-xs tracking-wider uppercase font-mono animate-pulse">
                    Retrieving from Supabase
                  </p>
                </div>
              </div>
            )}

            {/* 1. NOT STARTED STATE */}
            {!loading && !quizStarted && (
              <div
                className="w-full text-center flex flex-col items-center gap-6 py-6 transition-all duration-300 animate-fade-in"
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
              </div>
            )}

            {/* 2. TIMED OUT STATE */}
            {!loading && quizStarted && isTimedOut && (
              <div
                className="w-full text-center flex flex-col items-center gap-6 py-6 transition-all duration-300 animate-fade-in"
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
              </div>
            )}

            {/* 3. COMPLETED STATE */}
            {!loading && isCompleted && (
              <div
                className="w-full text-center flex flex-col items-center gap-6 py-4 transition-all duration-300 animate-fade-in"
                id="state-completed"
              >
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100 shadow-sm">
                  <Award className="w-10 h-10" />
                </div>
                <div className="space-y-3 max-w-md">
                  <h3 className="font-display font-extrabold text-3xl text-slate-900">Quiz Completed!</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {score === questions.length 
                      ? "Outstanding! You got a perfect score! 🏆" 
                      : score >= questions.length / 2 
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
              </div>
            )}

            {/* 4. ACTIVE QUIZ STATE */}
            {quizStarted && !isTimedOut && !isCompleted && currentQuestion && (
              <div
                className="w-full flex flex-col transition-all duration-300 animate-fade-in"
                id={`question-block-${currentQuestionIndex}`}
              >
                {/* Header question text and Timer label */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                  <div className="flex flex-col gap-1">
                    <span id="question-progress" className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
                      Question {currentQuestionIndex + 1} of {questions.length}
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
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        );
                      } else if (isSelected && !isCorrectOption) {
                        // Incorrect selected
                        optionStyle = "bg-[#FEE2E2] border-[#EF4444] text-[#991B1B] font-semibold";
                        iconToRender = (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#EF4444] shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        );
                      } else if (isCorrectOption) {
                        // Correct but not selected (must automatically turn Green)
                        optionStyle = "bg-[#DCFCE7] border-[#22C55E] text-[#166534] font-semibold";
                        iconToRender = (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#22C55E] shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
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
              </div>
            )}
          </div>
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
