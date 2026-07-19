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
  HelpCircle,
  Menu,
  Search,
  Bell,
  BookOpen,
  Calculator,
  Globe,
  GraduationCap,
  FileText,
  Briefcase,
  Users,
  Home as HomeIcon,
  Calendar,
  ClipboardList,
  CircleUser,
  Plus,
  Trash2,
  ArrowLeft,
  Volume2,
  VolumeX,
  Flame,
  Clock,
  Sparkles,
  Bookmark
} from "lucide-react";
import { QUIZ_QUESTIONS, Question } from "../data";
import { getSupabase } from "../lib/supabase";
import { quizAudio } from "../lib/audio";

// Type definition for routine items
interface RoutineItem {
  id: string;
  title: string;
  completed: boolean;
  category: string;
}

// Type definition for Taken Test
interface TakenTest {
  id: string;
  name: string;
  score: number;
  total: number;
  time: string;
  percentage: number;
}

// Extra mock question databases for other test subjects
const MATH_SCIENCE_QUESTIONS: Question[] = [
  {
    id: 101,
    question: "একটি আয়তক্ষেত্রের দৈর্ঘ্য ৪ মিটার এবং প্রস্থ ৩ মিটার হলে এর কর্ণের দৈর্ঘ্য কত?",
    options: ["৫ মিটার", "৬ মিটার", "৭ মিটার", "৮ মিটার"],
    correctIndex: 0
  },
  {
    id: 102,
    question: "নিচের কোনটি মৌলিক সংখ্যা?",
    options: ["৯", "১৫", "২১", "২৯"],
    correctIndex: 3
  },
  {
    id: 103,
    question: "পানির স্ফুটনাঙ্ক কত ডিগ্রি সেলসিয়াস?",
    options: ["৫০°C", "৮০°C", "১০০°C", "১২০°C"],
    correctIndex: 2
  },
  {
    id: 104,
    question: "উদ্ভিদ সূর্যলোক থেকে শক্তি গ্রহণ করে কোন প্রক্রিয়ায়?",
    options: ["শ্বসন", "সালোকসংশ্লেষণ", "অভিশ্রবণ", "প্রস্বেদন"],
    correctIndex: 1
  },
  {
    id: 105,
    question: "১ থেকে ১০ পর্যন্ত মৌলিক সংখ্যা কয়টি?",
    options: ["৩টি", "৪টি", "৫টি", "৬টি"],
    correctIndex: 1
  }
];

const BANGLA_ENGLISH_QUESTIONS: Question[] = [
  {
    id: 201,
    question: "কোনটি রবীন্দ্রনাথ ঠাকুরের রচিত নাটক?",
    options: ["কবর", "রক্তকরবী", "নয়াপল্টন", "শেষের কবিতা"],
    correctIndex: 1
  },
  {
    id: 202,
    question: "Who is the author of 'Hamlet'?",
    options: ["William Shakespeare", "Charles Dickens", "George Orwell", "Jane Austen"],
    correctIndex: 0
  },
  {
    id: 203,
    question: "বাংলা ব্যাকরণের প্রধান অংশ কয়টি?",
    options: ["২টি", "৩টি", "৪টি", "৫টি"],
    correctIndex: 2
  },
  {
    id: 204,
    question: "What is the synonym of 'Abolish'?",
    options: ["Build", "Cancel/Eliminate", "Create", "Support"],
    correctIndex: 1
  },
  {
    id: 205,
    question: "'অগ্নিবীণা' কাব্যগ্রন্থের রচয়িতা কে?",
    options: ["রবীন্দ্রনাথ ঠাকুর", "কাজী নজরুল ইসলাম", "জসীমউদ্দীন", "জীবনানন্দ দাশ"],
    correctIndex: 1
  }
];

const GENERAL_SCIENCE_QUESTIONS: Question[] = [
  {
    id: 301,
    question: "মানবদেহের স্বাভাবিক তাপমাত্রা কত ডিগ্রি ফারেনহাইট?",
    options: ["৯৬.৪°F", "৯৭.৮°F", "৯৮.৪°F", "৯৮.৬°F"],
    correctIndex: 3
  },
  {
    id: 302,
    question: "কোন ভিটামিনের অভাবে স্কার্ভি রোগ হয়?",
    options: ["ভিটামিন এ", "ভিটামিন বি", "ভিটামিন সি", "ভিটামিন ডি"],
    correctIndex: 2
  },
  {
    id: 303,
    question: "বায়ুমণ্ডলে অক্সিজেনের শতকরা পরিমাণ কত?",
    options: ["২০.৯৫%", "৭৮.০৯%", "০.০৩%", "১.২%"],
    correctIndex: 0
  }
];

export default function Home() {
  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<"home" | "quiz" | "courses" | "routine" | "tests" | "profile">("home");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  
  // Database & Loaded Questions State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);
  const [activeQuizTitle, setActiveQuizTitle] = useState<string>("General Quiz Game");
  const [activeQuizSubtitle, setActiveQuizSubtitle] = useState<string>("45th BCS International Affairs");

  // Game/Quiz States
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [submittedCount, setSubmittedCount] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isTimedOut, setIsTimedOut] = useState<boolean>(false);

  // Settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Search filter
  const [coursesSearchQuery, setCoursesSearchQuery] = useState<string>("");
  const [selectedCourseCategory, setSelectedCourseCategory] = useState<string>("All");

  // Custom User Routine State (persisted inside localStorage if client-side)
  const [routineTasks, setRoutineTasks] = useState<RoutineItem[]>([
    { id: "r1", title: "BCS Bangla Literature - ৫টি গুরুত্বপূর্ণ প্রশ্ন পড়ুন।", completed: false, category: "Bangla" },
    { id: "r2", title: "Bank Quantitative Mock Exam - ১টি ম্যাথ সেট সমাধান করুন।", completed: true, category: "Math" },
    { id: "r3", title: "Primary School Pedagogy Notes - ১০টি নিয়ম রিভিশন দিন।", completed: false, category: "Primary" },
    { id: "r4", title: "Daily General Knowledge - ১০টি সাম্প্রতিক আন্তর্জাতিক বিষয়াবলী মনে রাখুন।", completed: false, category: "GK" },
    { id: "r5", title: "English Vocabulary Flashcards - ২০টি নতুন শব্দ শিখুন।", completed: false, category: "English" }
  ]);
  const [newRoutineText, setNewRoutineText] = useState<string>("");
  const [newRoutineCategory, setNewRoutineCategory] = useState<string>("GK");

  // Test History State (persisted inside localStorage)
  const [takenTests, setTakenTests] = useState<TakenTest[]>([
    { id: "t1", name: "Math Practice #12", score: 18, total: 20, time: "2h ago", percentage: 90 }
  ]);

  // Load state from local storage on mount (Safe client-side execution)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRoutine = localStorage.getItem("job_master_routine");
      if (savedRoutine) {
        try {
          setRoutineTasks(JSON.parse(savedRoutine));
        } catch (e) {
          console.warn("Failed to parse saved routine:", e);
        }
      }

      const savedTests = localStorage.getItem("job_master_tests_history");
      if (savedTests) {
        try {
          setTakenTests(JSON.parse(savedTests));
        } catch (e) {
          console.warn("Failed to parse saved tests history:", e);
        }
      }

      const savedSound = localStorage.getItem("job_master_sound");
      if (savedSound !== null) {
        setSoundEnabled(savedSound === "true");
      }
    }
  }, []);

  // Save routine tasks
  const saveRoutine = (updated: RoutineItem[]) => {
    setRoutineTasks(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("job_master_routine", JSON.stringify(updated));
    }
  };

  // Save taken tests
  const saveTakenTests = (updated: TakenTest[]) => {
    setTakenTests(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("job_master_tests_history", JSON.stringify(updated));
    }
  };

  // Fetch BCS Daily Challenge questions on mount
  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        setError(null);
        const supabase = getSupabase();
        
        const { data, error: sbError } = await supabase
          .from("questions")
          .select("*");

        if (sbError) {
          throw sbError;
        }

        if (data && data.length > 0) {
          const mappedQuestions: Question[] = data.map((q: any) => {
            let questionText = "Untitled Question";
            const possibleQuestionKeys = ["question", "question_text", "text", "questiontext", "title"];
            for (const key of possibleQuestionKeys) {
              if (q[key] !== undefined && q[key] !== null) {
                questionText = String(q[key]);
                break;
              }
            }

            let rawOptions: any = null;
            const possibleOptionKeys = ["options", "choices", "answers", "answers_list", "option_list"];
            for (const key of possibleOptionKeys) {
              if (q[key] !== undefined && q[key] !== null) {
                rawOptions = q[key];
                break;
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
                }
              } catch {
                options = rawOptions.split(",").map((s: string) => s.trim());
              }
            } else if (typeof rawOptions === "object" && rawOptions !== null) {
              options = Object.values(rawOptions).map(String);
            } else {
              options = ["Option 1", "Option 2", "Option 3", "Option 4"];
            }

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
                  }
                }
              } else if (typeof correctIndexVal === "number") {
                correctIndex = correctIndexVal;
              }
            }

            let id = Date.now();
            if (q.id !== undefined && q.id !== null) {
              id = Number(q.id);
            }

            return {
              id,
              question: questionText,
              options,
              correctIndex
            };
          });

          mappedQuestions.sort((a, b) => a.id - b.id);
          setQuestions(mappedQuestions);
          setIsUsingFallback(false);
        } else {
          setQuestions(QUIZ_QUESTIONS);
          setIsUsingFallback(true);
        }
      } catch (err: any) {
        console.warn("Falling back to local quiz questions:", err);
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
    if (currentScreen !== "quiz" || !quizStarted || isSubmitted || isTimedOut || isCompleted) return;

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
  }, [currentScreen, quizStarted, isSubmitted, isTimedOut, currentQuestionIndex, isCompleted]);

  // Handle start quiz action (Sets screen to 'quiz' and resets statistics)
  const startQuizFlow = (title: string, subtitle: string, customQuestionSet?: Question[]) => {
    setActiveQuizTitle(title);
    setActiveQuizSubtitle(subtitle);
    
    if (customQuestionSet && customQuestionSet.length > 0) {
      setQuestions(customQuestionSet);
    } else {
      // Default to Supabase loaded questions/fallbacks
      setQuestions(isUsingFallback ? QUIZ_QUESTIONS : questions);
    }

    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSubmittedCount(0);
    setSelectedOptionIndex(null);
    setIsSubmitted(false);
    setTimeLeft(30);
    setIsTimedOut(false);
    setCurrentScreen("quiz");
    
    if (soundEnabled) quizAudio.playClick();
  };

  // Handle option select
  const handleSelectOption = (index: number) => {
    if (isSubmitted || isTimedOut) return;
    setSelectedOptionIndex(index);
    if (soundEnabled) quizAudio.playClick();
  };

  // Handle submit answer
  const handleSubmit = () => {
    if (selectedOptionIndex === null || isSubmitted || isTimedOut || !currentQuestion) return;

    const correct = selectedOptionIndex === currentQuestion.correctIndex;
    if (correct) {
      setScore((prev) => prev + 1);
      if (soundEnabled) quizAudio.playSuccess();
    } else {
      if (soundEnabled) quizAudio.playError();
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
    
    if (currentQuestionIndex + 1 >= questions.length) {
      // Completed! Add to Taken Tests history log
      const scoreObtained = score;
      const totalQuestions = questions.length;
      const pct = Math.round((scoreObtained / totalQuestions) * 100);
      
      const newTestLog: TakenTest = {
        id: "log_" + Date.now(),
        name: activeQuizTitle + " (" + activeQuizSubtitle + ")",
        score: scoreObtained,
        total: totalQuestions,
        time: "Just now",
        percentage: pct
      };

      const updatedHistory = [newTestLog, ...takenTests];
      saveTakenTests(updatedHistory);
    }

    setCurrentQuestionIndex((prev) => prev + 1);
  };

  // Handle restart quiz
  const handleRestart = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSubmittedCount(0);
    setSelectedOptionIndex(null);
    setIsSubmitted(false);
    setTimeLeft(30);
    setIsTimedOut(false);
  };

  // Handle Routine progress checking
  const handleToggleRoutine = (id: string) => {
    const updated = routineTasks.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    saveRoutine(updated);
    if (soundEnabled) quizAudio.playClick();
  };

  // Handle adding new routine item
  const handleAddRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutineText.trim()) return;

    const newItem: RoutineItem = {
      id: "routine_" + Date.now(),
      title: newRoutineText.trim(),
      completed: false,
      category: newRoutineCategory
    };

    const updated = [...routineTasks, newItem];
    saveRoutine(updated);
    setNewRoutineText("");
    if (soundEnabled) quizAudio.playSuccess();
  };

  // Delete routine task
  const handleDeleteRoutine = (id: string) => {
    const updated = routineTasks.filter(item => item.id !== id);
    saveRoutine(updated);
  };

  // Clear all taken tests history
  const handleClearTestHistory = () => {
    saveTakenTests([]);
  };

  // Calculate routine progress percentage
  const completedRoutineCount = routineTasks.filter(r => r.completed).length;
  const routinePercentage = routineTasks.length > 0 ? Math.round((completedRoutineCount / routineTasks.length) * 100) : 0;

  // Search filter for courses
  const filteredCoursesList = [
    { id: "bcs", title: "BCS Preparation Masterclass", desc: "পূর্ণাঙ্গ বিসিএস সিলেবাসের ওপর ভিত্তি করে অধ্যায়ভিত্তিক লাইভ এমসিকিউ ও বিশ্লেষণমূলক লেকচার শীট।", category: "BCS", icon: BookOpen, bg: "bg-[#FFF1E6]", iconColor: "text-orange-600" },
    { id: "bank", title: "Bank Job Officer Premium", desc: "সরকারি ও বেসরকারি ব্যাংক সিনিয়র অফিসার নিয়োগ পরীক্ষার উপযোগী প্রিপারেশন গাইড এবং শর্টকাট ম্যাথ।", category: "Bank", icon: Calculator, bg: "bg-[#E6F0FA]", iconColor: "text-blue-600" },
    { id: "primary", title: "Primary School Teacher Prep", desc: "প্রাথমিক সহকারী শিক্ষক নিয়োগের বিগত বছরের প্রশ্ন এবং বোর্ড বই ভিত্তিক বিশেষ স্পিড কুইজ মডিউল।", category: "Teachers", icon: Globe, bg: "bg-[#EBF7EE]", iconColor: "text-green-600" },
    { id: "ntrca", title: "NTRCA School & College Registration", desc: "১৭তম ও ১৮তম শিক্ষক নিবন্ধন পরীক্ষার সর্বশেষ সিলেবাস ভিত্তিক সাধারণ জ্ঞান এবং সাবজেক্ট প্রস্তুতি।", category: "Teachers", icon: GraduationCap, bg: "bg-[#F3E8FF]", iconColor: "text-purple-600" },
    { id: "psc", title: "PSC Non-Cadre Mock Series", desc: "বাংলাদেশ সরকারী কর্ম কমিশন (PSC) আয়োজিত বিভিন্ন গ্রেডের ও নন-ক্যাডার পদের জন্য সুপার মক টেস্ট।", category: "Other", icon: FileText, bg: "bg-[#FCE7F3]", iconColor: "text-rose-600" },
    { id: "all_job", title: "All Job Exams Universal Pack", desc: "সকল সরকারী ও স্বায়ত্তশাসিত প্রতিষ্ঠানের ৩য় ও ৪র্থ শ্রেণীর চাকরি পরীক্ষার সাধারণ জ্ঞান ও আইকিউ প্যাকেজ।", category: "All", icon: Briefcase, bg: "bg-[#E0F2FE]", iconColor: "text-sky-600" },
    { id: "bangla_english", title: "Bangla & English Literature Mastery", desc: "বাংলা ব্যাকরণ ও সাহিত্য, ইংরেজি গ্রামার এবং লিটারেচার পাসের জন্য প্রফেশনাল শর্ট টেকনিক কোর্স।", category: "Bangla", icon: BookOpen, bg: "bg-[#F1F5F9]", iconColor: "text-slate-700" },
    { id: "math_science", title: "Quantitative Aptitude & General Science", desc: "জ্যামিতি, বীজগণিত, পাটিগণিত এবং দৈনন্দিন বিজ্ঞান বিষয়ের সবচেয়ে সহজ সমাধান কৌশল ও পরীক্ষা।", category: "Math", icon: Calculator, bg: "bg-[#E0F2FE]", iconColor: "text-blue-600" }
  ].filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(coursesSearchQuery.toLowerCase()) || 
                          course.desc.toLowerCase().includes(coursesSearchQuery.toLowerCase());
    const matchesCategory = selectedCourseCategory === "All" || course.category === selectedCourseCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F1F5F9] via-[#E2E8F0] to-[#CBD5E1] flex items-center justify-center p-0 sm:p-6 md:p-8 selection:bg-orange-500 selection:text-white">
      
      {/* Dynamic Background Blur Balls */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-300/25 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-300/25 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Primary Smartphone Container Mockup */}
      <div className="w-full max-w-md bg-slate-50 min-h-screen sm:min-h-[840px] sm:max-h-[880px] sm:rounded-[40px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] flex flex-col justify-between relative overflow-hidden border border-slate-200/50 z-10">
        
        {/* Smartphone Upper Bezel Accent (Only visible on sm+ screen for aesthetics) */}
        <div className="hidden sm:block absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-slate-900 rounded-b-3xl z-50">
          <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-slate-800 rounded-full" />
          <div className="absolute top-1 right-8 w-2 h-2 bg-slate-800 rounded-full" />
        </div>

        {/* Main Header of the App (Persistent on Home, Courses, Routine, Tests, Profile) */}
        {currentScreen !== "quiz" && (
          <header className="bg-white border-b border-slate-100 px-5 pt-7 pb-4 sm:pt-10 flex items-center justify-between shadow-sm sticky top-0 z-30">
            {/* Left side: Hamburger and brand name */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setCurrentScreen("profile");
                  if (soundEnabled) quizAudio.playClick();
                }}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 active:scale-95 transition-all"
              >
                <Menu className="w-6 h-6 stroke-[2.2px]" />
              </button>
              
              <div className="flex items-center gap-1.5 ml-1">
                {/* Custom icon combining orange graduation cap */}
                <div className="bg-[#FF6A00] p-1.5 rounded-xl shadow-md shadow-orange-500/20">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-[#1E293B] text-base tracking-tight leading-none">
                    Job <span className="text-[#FF6A00]">Master</span>
                  </span>
                  <span className="text-[8px] font-bold tracking-[0.08em] text-[#94A3B8] uppercase mt-0.5">
                    Exam MCQ Hub
                  </span>
                </div>
              </div>
            </div>

            {/* Right side: Search shortcut and Bell icon */}
            <div className="flex items-center gap-2.5">
              <button 
                onClick={() => {
                  setCurrentScreen("courses");
                  if (soundEnabled) quizAudio.playClick();
                }}
                className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-full active:scale-95 transition-all"
              >
                <Search className="w-5 h-5" />
              </button>

              <button 
                onClick={() => {
                  setCurrentScreen("routine");
                  if (soundEnabled) quizAudio.playClick();
                }}
                className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-full relative active:scale-95 transition-all"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
              </button>
            </div>
          </header>
        )}

        {/* Scrollable Main Content Frame */}
        <div className="flex-1 overflow-y-auto pb-20 bg-slate-50/60">
          
          {/* ========================================================= */}
          {/* 1. SCREEN: HOME                                           */}
          {/* ========================================================= */}
          {currentScreen === "home" && (
            <div className="p-5 space-y-6 animate-fade-in">
              
              {/* Our Course Section */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-[#1E293B] tracking-tight">
                    Our Course
                  </h3>
                  <button 
                    onClick={() => {
                      setCurrentScreen("courses");
                      if (soundEnabled) quizAudio.playClick();
                    }}
                    className="text-xs font-bold text-[#FF6A00] hover:underline active:scale-95 transition-all"
                  >
                    All Course
                  </button>
                </div>

                {/* 6 Grid Icons according to Screenshot - Horizontal layout for compactness */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Grid Item 1: BCS */}
                  <div 
                    onClick={() => {
                      setCurrentScreen("courses");
                      setSelectedCourseCategory("BCS");
                      if (soundEnabled) quizAudio.playClick();
                    }}
                    className="bg-white border border-slate-100 rounded-2xl p-2.5 flex flex-row items-center gap-2.5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer active:scale-95"
                  >
                    <div className="w-10 h-10 bg-[#FFF1E6] rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                      <BookOpen className="w-5 h-5 stroke-[2.2px]" />
                    </div>
                    <span className="text-xs font-extrabold text-[#334155] tracking-wide">BCS</span>
                  </div>

                  {/* Grid Item 2: Bank */}
                  <div 
                    onClick={() => {
                      setCurrentScreen("courses");
                      setSelectedCourseCategory("Bank");
                      if (soundEnabled) quizAudio.playClick();
                    }}
                    className="bg-white border border-slate-100 rounded-2xl p-2.5 flex flex-row items-center gap-2.5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer active:scale-95"
                  >
                    <div className="w-10 h-10 bg-[#E6F0FA] rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                      <Calculator className="w-5 h-5 stroke-[2.2px]" />
                    </div>
                    <span className="text-xs font-extrabold text-[#334155] tracking-wide">Bank</span>
                  </div>

                  {/* Grid Item 3: Primary */}
                  <div 
                    onClick={() => {
                      setCurrentScreen("courses");
                      setSelectedCourseCategory("Teachers");
                      if (soundEnabled) quizAudio.playClick();
                    }}
                    className="bg-white border border-slate-100 rounded-2xl p-2.5 flex flex-row items-center gap-2.5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer active:scale-95"
                  >
                    <div className="w-10 h-10 bg-[#EBF7EE] rounded-xl flex items-center justify-center text-green-600 shrink-0">
                      <Globe className="w-5 h-5 stroke-[2.2px]" />
                    </div>
                    <span className="text-xs font-extrabold text-[#334155] tracking-wide">Primary</span>
                  </div>

                  {/* Grid Item 4: NTRCA */}
                  <div 
                    onClick={() => {
                      setCurrentScreen("courses");
                      setSelectedCourseCategory("Teachers");
                      if (soundEnabled) quizAudio.playClick();
                    }}
                    className="bg-white border border-slate-100 rounded-2xl p-2.5 flex flex-row items-center gap-2.5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer active:scale-95"
                  >
                    <div className="w-10 h-10 bg-[#F3E8FF] rounded-xl flex items-center justify-center text-purple-600 shrink-0">
                      <GraduationCap className="w-5 h-5 stroke-[2.2px]" />
                    </div>
                    <span className="text-xs font-extrabold text-[#334155] tracking-wide">NTRCA</span>
                  </div>

                  {/* Grid Item 5: PSC */}
                  <div 
                    onClick={() => {
                      setCurrentScreen("courses");
                      setSelectedCourseCategory("Other");
                      if (soundEnabled) quizAudio.playClick();
                    }}
                    className="bg-white border border-slate-100 rounded-2xl p-2.5 flex flex-row items-center gap-2.5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer active:scale-95"
                  >
                    <div className="w-10 h-10 bg-[#FCE7F3] rounded-xl flex items-center justify-center text-rose-600 shrink-0">
                      <FileText className="w-5 h-5 stroke-[2.2px]" />
                    </div>
                    <span className="text-xs font-extrabold text-[#334155] tracking-wide">PSC</span>
                  </div>

                  {/* Grid Item 6: All Job */}
                  <div 
                    onClick={() => {
                      setCurrentScreen("courses");
                      setSelectedCourseCategory("All");
                      if (soundEnabled) quizAudio.playClick();
                    }}
                    className="bg-white border border-slate-100 rounded-2xl p-2.5 flex flex-row items-center gap-2.5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer active:scale-95"
                  >
                    <div className="w-10 h-10 bg-[#E0F2FE] rounded-xl flex items-center justify-center text-sky-600 shrink-0">
                      <Briefcase className="w-5 h-5 stroke-[2.2px]" />
                    </div>
                    <span className="text-xs font-extrabold text-[#334155] tracking-wide">All Job</span>
                  </div>
                </div>
              </div>

              {/* General Quiz Game Live Banner (Gradient Orange/Red matching image) */}
              <div className="bg-gradient-to-r from-[#FF6B35] via-[#FF5F25] to-[#FF4E00] rounded-[2rem] p-6 text-white relative overflow-hidden shadow-lg shadow-orange-500/25">
                {/* Top background decorative grid elements */}
                <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                
                {/* Header elements */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase">
                      LIVE NOW
                    </span>
                    <span className="text-xs font-medium text-white/90">
                      Daily Challenge
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-black/10 px-2.5 py-1 rounded-full">
                    <Users className="w-3.5 h-3.5 text-white" />
                    <span className="text-[10px] font-bold">1.2k Active</span>
                  </div>
                </div>

                {/* Main Content */}
                <div className="space-y-1.5 mb-5">
                  <h2 className="text-2xl font-black tracking-tight">
                    General Quiz Game
                  </h2>
                  <p className="text-white/80 text-xs font-medium leading-relaxed max-w-[280px]">
                    Test your knowledge on 45th BCS International Affairs.
                  </p>
                </div>

                {/* CTA Start Quiz Button */}
                <div className="flex justify-center">
                  <button 
                    onClick={() => startQuizFlow("General Quiz Game", "45th BCS International Affairs", isUsingFallback ? QUIZ_QUESTIONS : questions)}
                    className="bg-white hover:bg-slate-50 text-[#FF5F25] font-extrabold px-8 py-3.5 rounded-full shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-95 transition-all text-sm cursor-pointer"
                  >
                    Start Quiz
                  </button>
                </div>
              </div>

              {/* Preparation Hub Section */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-[#1E293B] tracking-tight">
                    Preparation Hub
                  </h3>
                  <button 
                    onClick={() => {
                      setCurrentScreen("courses");
                      if (soundEnabled) quizAudio.playClick();
                    }}
                    className="text-xs font-bold text-[#FF6A00] hover:underline active:scale-95 transition-all"
                  >
                    View All
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Preparation Hub Item 1: Bangla & English */}
                  <div 
                    onClick={() => startQuizFlow("Bangla & English Mastery", "Grammar & Literature", BANGLA_ENGLISH_QUESTIONS)}
                    className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    <div className="w-12 h-12 bg-[#F1F5F9] rounded-2xl flex items-center justify-center text-slate-700 mb-3">
                      <BookOpen className="w-6 h-6 stroke-[2.2px]" />
                    </div>
                    <span className="text-xs font-extrabold text-[#334155] leading-snug">
                      Bangla & English
                    </span>
                  </div>

                  {/* Preparation Hub Item 2: Math & Science */}
                  <div 
                    onClick={() => startQuizFlow("Quantitative Aptitude & Science", "Math shortcuts & Physics", MATH_SCIENCE_QUESTIONS)}
                    className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    <div className="w-12 h-12 bg-[#E6F0FA] rounded-2xl flex items-center justify-center text-blue-600 mb-3">
                      <Calculator className="w-6 h-6 stroke-[2.2px]" />
                    </div>
                    <span className="text-xs font-extrabold text-[#334155] leading-snug">
                      Math & Science
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Tests Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-[#1E293B] tracking-tight">
                    Recent Tests
                  </h3>
                  {takenTests.length > 0 && (
                    <button 
                      onClick={handleClearTestHistory}
                      className="text-[10px] font-bold text-[#64748B] hover:text-red-500 hover:underline flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <Trash2 className="w-3 h-3" /> Clear History
                    </button>
                  )}
                </div>

                {takenTests.length === 0 ? (
                  <div className="bg-white border border-slate-100 rounded-3xl p-5 text-center text-slate-400 text-xs">
                    No tests completed yet. Start your first quiz!
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {takenTests.map((test) => (
                      <div 
                        key={test.id}
                        className="bg-white border border-slate-100 rounded-3xl p-4 flex items-center justify-between shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#FFF1E6] rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                            <FileText className="w-5 h-5 stroke-[2px]" />
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-[#334155] leading-snug">
                              {test.name}
                            </h4>
                            <p className="text-[10px] font-bold text-[#94A3B8] mt-0.5">
                              Score: {test.score}/{test.total} • {test.time}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-extrabold text-green-600">
                            {test.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Database / Sync health card */}
              <div className="bg-slate-100/50 rounded-2xl p-4 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Server Latency: Normal
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Database: Connected {isUsingFallback && "(Fallback)"}
                </span>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* 2. SCREEN: ACTIVE PLAYABLE QUIZ CONTAINER                 */}
          {/* ========================================================= */}
          {currentScreen === "quiz" && (
            <div className="p-5 space-y-6 animate-fade-in">
              {/* Back Header */}
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => {
                    setCurrentScreen("home");
                    if (soundEnabled) quizAudio.playClick();
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-[#64748B] hover:text-slate-800 bg-white border border-slate-200/50 px-3.5 py-1.5 rounded-full shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
                </button>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setSoundEnabled(!soundEnabled);
                      if (typeof window !== "undefined") {
                        localStorage.setItem("job_master_sound", String(!soundEnabled));
                      }
                    }}
                    className="p-1.5 bg-white border border-slate-200/50 rounded-full text-slate-500 shadow-sm active:scale-95 transition-all"
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                  <span className="bg-[#FF6A00]/10 text-[#FF6A00] font-extrabold text-[10px] px-3 py-1 rounded-full uppercase">
                    {activeQuizSubtitle}
                  </span>
                </div>
              </div>

              {/* Top Score Circular HUD */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-slate-800">{activeQuizTitle}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active challenge</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200">
                    <span className="font-mono font-black text-xs text-slate-800">
                      {score}/{submittedCount === 0 && quizStarted ? 0 : submittedCount}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase hidden xs:block">Score</span>
                </div>
              </div>

              {/* Loader */}
              {loading && (
                <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center flex flex-col items-center gap-5">
                  <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-orange-500 animate-spin" />
                  <span className="text-xs font-bold text-slate-500 tracking-wider">Syncing Questions database...</span>
                </div>
              )}

              {/* Timed out screen */}
              {!loading && quizStarted && isTimedOut && (
                <div className="bg-white border border-slate-100 rounded-[2rem] p-8 text-center flex flex-col items-center gap-5 shadow-md">
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center border border-red-100 animate-bounce">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-xl text-slate-900">সময় শেষ! (Time's Up)</h3>
                    <p className="text-slate-500 text-xs leading-relaxed max-w-[250px] mx-auto">
                      প্রতিটি প্রশ্নের উত্তর ৩০ সেকেন্ডের মধ্যে দিতে হবে। আবার চেষ্টা করে শতভাগ সঠিক করুন!
                    </p>
                  </div>
                  
                  <button
                    onClick={handleRestart}
                    className="w-full py-4 px-6 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 cursor-pointer"
                  >
                    <RotateCcw className="w-5 h-5" />
                    আবার খেলুন
                  </button>
                </div>
              )}

              {/* Completed Screen */}
              {!loading && isCompleted && (
                <div className="bg-white border border-slate-100 rounded-[2rem] p-8 text-center flex flex-col items-center gap-5 shadow-md">
                  <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center border border-orange-100">
                    <Award className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-black text-2xl text-slate-900">অভিনন্দন!</h3>
                    <p className="text-slate-500 text-xs leading-relaxed max-w-[260px] mx-auto">
                      {score === questions.length 
                        ? "চমৎকার! আপনি সব প্রশ্নের সঠিক উত্তর দিয়েছেন। 🏆" 
                        : score >= questions.length / 2 
                        ? "দুর্দান্ত চেষ্টা! আপনার প্রিপারেশন আরও শক্তিশালী করুন। 🎉" 
                        : "ভালো চেষ্টা! নিয়মিত প্রিপারেশন নিয়ে আরও ভালো করুন।"}
                    </p>
                  </div>

                  <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 flex justify-between items-center text-xs font-semibold text-slate-600">
                    <span>সঠিক উত্তর হার (Accuracy)</span>
                    <span className="text-orange-600 font-mono font-extrabold text-base">
                      {submittedCount > 0 ? Math.round((score / submittedCount) * 100) : 0}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full">
                    <button
                      onClick={handleRestart}
                      className="py-4 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer text-xs"
                    >
                      <RotateCcw className="w-4 h-4" /> আবার খেলুন
                    </button>
                    <button
                      onClick={() => setCurrentScreen("home")}
                      className="py-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl active:scale-[0.98] transition-all cursor-pointer text-xs"
                    >
                      হোমে ফিরে যান
                    </button>
                  </div>
                </div>
              )}

              {/* Active Quiz Card */}
              {quizStarted && !isTimedOut && !isCompleted && currentQuestion && (
                <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-5">
                  
                  {/* Progress indices */}
                  <div className="flex justify-between items-center text-[11px] font-extrabold text-slate-400">
                    <span>প্রশ্ন {currentQuestionIndex + 1} / {questions.length}</span>
                    <span className={`font-mono text-xs ${timeLeft <= 10 ? "text-red-500 animate-pulse font-black" : "text-orange-500"}`}>
                      {timeLeft < 10 ? `00:0${timeLeft}` : `00:${timeLeft}`}
                    </span>
                  </div>

                  {/* Question header */}
                  <h4 className="font-extrabold text-lg text-slate-800 leading-snug">
                    {currentQuestion.question}
                  </h4>

                  {/* Timer meter */}
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 10 ? "bg-red-500" : "bg-orange-500"}`}
                      style={{ width: `${(timeLeft / 30) * 100}%` }}
                    />
                  </div>

                  {/* Options List */}
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = selectedOptionIndex === index;
                      const isCorrectOption = index === currentQuestion.correctIndex;
                      
                      let btnStyle = "border border-slate-100 text-slate-600 bg-slate-50/50 hover:bg-slate-100/50";
                      let indicator = null;

                      if (isSubmitted) {
                        if (isSelected && isCorrectOption) {
                          btnStyle = "bg-green-50 border-green-200 text-green-700 font-extrabold";
                          indicator = <Check className="w-4 h-4 text-green-600 stroke-[3px]" />;
                        } else if (isSelected && !isCorrectOption) {
                          btnStyle = "bg-red-50 border-red-200 text-red-700 font-extrabold";
                          indicator = <X className="w-4 h-4 text-red-600 stroke-[3px]" />;
                        } else if (isCorrectOption) {
                          btnStyle = "bg-green-50 border-green-100 text-green-700 font-semibold";
                          indicator = <Check className="w-4 h-4 text-green-500 stroke-[3px]" />;
                        } else {
                          btnStyle = "bg-slate-50 border-slate-50 text-slate-400 opacity-60";
                        }
                      } else if (isSelected) {
                        btnStyle = "border-[#FF6A00] bg-orange-50/70 text-orange-950 font-bold shadow-sm shadow-orange-50/20";
                      }

                      return (
                        <button
                          key={index}
                          onClick={() => handleSelectOption(index)}
                          disabled={isSubmitted}
                          className={`w-full text-left py-3.5 px-5 rounded-2xl text-xs sm:text-sm flex items-center justify-between gap-3 transition-all ${btnStyle} ${!isSubmitted ? "cursor-pointer active:scale-[0.98]" : "cursor-default"}`}
                        >
                          <span className="leading-normal">{option}</span>
                          {indicator}
                        </button>
                      );
                    })}
                  </div>

                  {/* Action row */}
                  <div>
                    {!isSubmitted ? (
                      <button
                        onClick={handleSubmit}
                        disabled={selectedOptionIndex === null}
                        className={`w-full py-4 px-6 font-extrabold rounded-2xl text-xs tracking-wider uppercase transition-all flex items-center justify-center ${
                          selectedOptionIndex !== null
                            ? "bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-500/20 active:scale-[0.98] cursor-pointer"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        উত্তর জমা দিন (Submit)
                      </button>
                    ) : (
                      <button
                        onClick={handleNext}
                        className="w-full py-4 px-6 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-2xl text-xs tracking-wider uppercase shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {currentQuestionIndex + 1 >= questions.length ? "ফলাফল দেখুন" : "পরবর্তী প্রশ্ন"}
                        <ChevronRight className="w-4 h-4 stroke-[3px]" />
                      </button>
                    )}
                  </div>

                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. SCREEN: COURSES SCREEN                                 */}
          {/* ========================================================= */}
          {currentScreen === "courses" && (
            <div className="p-5 space-y-5 animate-fade-in">
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Job Prep Courses</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Premium Study and Mock Programs</p>
              </div>

              {/* Search Course input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="সিলেবাস বা কোর্স খুঁজুন..."
                  value={coursesSearchQuery}
                  onChange={(e) => setCoursesSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs focus:outline-none focus:border-orange-500/50 shadow-sm transition-all"
                />
              </div>

              {/* Categories scroll row */}
              <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                {["All", "BCS", "Bank", "Teachers", "Math", "Bangla", "Other"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCourseCategory(cat)}
                    className={`px-4 py-2 rounded-full text-[10px] font-extrabold tracking-wide shrink-0 transition-all cursor-pointer ${
                      selectedCourseCategory === cat 
                        ? "bg-[#FF6A00] text-white shadow-sm shadow-orange-500/10" 
                        : "bg-white border border-slate-100 text-slate-600"
                    }`}
                  >
                    {cat === "Teachers" ? "Primary/NTRCA" : cat}
                  </button>
                ))}
              </div>

              {/* Course items grid */}
              {filteredCoursesList.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-[2rem] p-8 text-center text-slate-400 text-xs">
                  কোনো কোর্স পাওয়া যায়নি। অন্য কিছু লিখে খুঁজুন!
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCoursesList.map((course) => {
                    const CourseIcon = course.icon;
                    return (
                      <div 
                        key={course.id}
                        className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm space-y-4"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className={`w-12 h-12 ${course.bg} ${course.iconColor} rounded-2xl flex items-center justify-center shrink-0`}>
                            <CourseIcon className="w-6 h-6 stroke-[2.2px]" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-extrabold bg-orange-100/60 text-[#FF6A00] px-2.5 py-0.5 rounded-full uppercase">
                              {course.category}
                            </span>
                            <h4 className="text-xs sm:text-sm font-black text-slate-800 leading-snug">
                              {course.title}
                            </h4>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                          {course.desc}
                        </p>

                        <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                            Enroll Free
                          </span>
                          
                          <button 
                            onClick={() => {
                              if (course.id === "math_science") {
                                startQuizFlow("Math & Science Revision", "Quick Practice Session", MATH_SCIENCE_QUESTIONS);
                              } else if (course.id === "bangla_english") {
                                startQuizFlow("Bangla & English Mastery", "Quick Practice Session", BANGLA_ENGLISH_QUESTIONS);
                              } else {
                                startQuizFlow(course.title, "Syllabus mock", QUIZ_QUESTIONS);
                              }
                            }}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] px-4 py-2 rounded-xl active:scale-95 transition-all cursor-pointer"
                          >
                            Start Mock Quiz
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. SCREEN: ROUTINE & STUDY PLANNER                        */}
          {/* ========================================================= */}
          {currentScreen === "routine" && (
            <div className="p-5 space-y-5 animate-fade-in">
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Daily routine</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plan your exam success checklist</p>
              </div>

              {/* Progress HUD Ring */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-[2rem] p-5 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold tracking-widest text-orange-400 uppercase">TODAY'S PROGRESS</span>
                  <h4 className="text-xl font-black">{routinePercentage}% Completed</h4>
                  <p className="text-[10px] text-slate-300 font-medium">
                    {completedRoutineCount} of {routineTasks.length} tasks finished
                  </p>
                </div>

                <div className="w-14 h-14 rounded-full border-4 border-slate-700 border-t-orange-500 flex items-center justify-center font-mono font-black text-sm text-orange-400">
                  {completedRoutineCount}/{routineTasks.length}
                </div>
              </div>

              {/* Add Custom Routine Task form */}
              <form onSubmit={handleAddRoutine} className="bg-white border border-slate-100 rounded-[1.5rem] p-4 shadow-sm space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Add custom preparation task</span>
                
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="যেমন: ১০টি গণিত সমাধান করব..."
                    value={newRoutineText}
                    onChange={(e) => setNewRoutineText(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-orange-500/40"
                  />
                  <select 
                    value={newRoutineCategory} 
                    onChange={(e) => setNewRoutineCategory(e.target.value)}
                    className="px-2.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 focus:outline-none"
                  >
                    <option value="GK">GK</option>
                    <option value="Math">Math</option>
                    <option value="Bangla">Bangla</option>
                    <option value="English">English</option>
                    <option value="Primary">Primary</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full py-2.5 bg-[#FF6A00] text-white font-extrabold text-[10px] rounded-xl tracking-wider uppercase hover:bg-orange-600 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add to study routine
                </button>
              </form>

              {/* Routine Checklist List */}
              <div className="space-y-2.5">
                {routineTasks.map((task) => (
                  <div 
                    key={task.id}
                    className={`bg-white border rounded-[1.5rem] p-4 flex items-center justify-between transition-all shadow-sm ${
                      task.completed ? "border-green-100 bg-green-50/10 opacity-75" : "border-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 pr-4">
                      <button 
                        type="button"
                        onClick={() => handleToggleRoutine(task.id)}
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          task.completed 
                            ? "bg-green-500 border-green-500 text-white" 
                            : "border-slate-300 hover:border-orange-500 bg-white"
                        }`}
                      >
                        {task.completed && <Check className="w-3.5 h-3.5 stroke-[3.5px]" />}
                      </button>

                      <div className="space-y-0.5">
                        <span className="text-[8px] font-extrabold text-[#FF6A00] bg-orange-50 px-2 py-0.5 rounded uppercase">
                          {task.category}
                        </span>
                        <p className={`text-xs font-semibold leading-relaxed ${task.completed ? "line-through text-slate-400" : "text-slate-700"}`}>
                          {task.title}
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDeleteRoutine(task.id)}
                      className="p-1 text-slate-300 hover:text-red-500 active:scale-90 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* 5. SCREEN: TEST CENTER / CHOOSE MOCK                      */}
          {/* ========================================================= */}
          {currentScreen === "tests" && (
            <div className="p-5 space-y-5 animate-fade-in">
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Test center</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Practice with specific subjects</p>
              </div>

              {/* Main test center banner */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] p-5 text-white shadow-sm flex items-center justify-between relative overflow-hidden">
                <div className="space-y-1 relative z-10 max-w-[180px]">
                  <span className="text-[8px] font-extrabold bg-white/20 px-2.5 py-0.5 rounded-full tracking-wider uppercase">FEATURED TEST</span>
                  <h4 className="text-sm font-black leading-snug">45th BCS International Affairs</h4>
                  <p className="text-[10px] text-white/80 leading-snug font-medium">Full set with 31 mock questions from database.</p>
                </div>
                
                <button 
                  onClick={() => startQuizFlow("General Quiz Game", "45th BCS International Affairs", isUsingFallback ? QUIZ_QUESTIONS : questions)}
                  className="bg-white hover:bg-slate-50 text-blue-600 font-extrabold text-[10px] px-4.5 py-3 rounded-xl shadow relative z-10 cursor-pointer"
                >
                  Launch Quiz
                </button>

                <div className="absolute top-[-30px] right-[-30px] w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
              </div>

              {/* Grid lists of other subject exams */}
              <div className="space-y-3">
                <span className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">Choose Question bank</span>
                
                <div className="space-y-3">
                  
                  {/* Test choice 1: Daily GK Challenge */}
                  <div className="bg-white border border-slate-100 rounded-[1.5rem] p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800 leading-snug">General Knowledge Daily Challenge</h4>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">31 Questions • GK & Bangladesh Studies</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => startQuizFlow("General Quiz Game", "Daily Challenge", QUIZ_QUESTIONS)}
                      className="p-1.5 hover:bg-slate-50 text-orange-600 rounded-lg active:scale-90 transition-all cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* Test choice 2: Quantitative Aptitude */}
                  <div className="bg-white border border-slate-100 rounded-[1.5rem] p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                        <Calculator className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800 leading-snug">Math Practice Series #12</h4>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">5 Questions • Equations & Geometry</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => startQuizFlow("Math practice #12", "Equations & Geometry", MATH_SCIENCE_QUESTIONS)}
                      className="p-1.5 hover:bg-slate-50 text-blue-600 rounded-lg active:scale-90 transition-all cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* Test choice 3: Bangla & English Literature */}
                  <div className="bg-white border border-slate-100 rounded-[1.5rem] p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800 leading-snug">Bangla & English Literature Mock</h4>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">5 Questions • Grammar & authors</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => startQuizFlow("Bangla & English Mastery", "Grammar & Authors", BANGLA_ENGLISH_QUESTIONS)}
                      className="p-1.5 hover:bg-slate-50 text-purple-600 rounded-lg active:scale-90 transition-all cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* Test choice 4: General Science */}
                  <div className="bg-white border border-slate-100 rounded-[1.5rem] p-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800 leading-snug">General Science Mock</h4>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">3 Questions • Anatomy & Environment</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => startQuizFlow("General Science Mock", "Anatomy & Climate", GENERAL_SCIENCE_QUESTIONS)}
                      className="p-1.5 hover:bg-slate-50 text-green-600 rounded-lg active:scale-90 transition-all cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 6. SCREEN: PROFILE / STUDENT DATA                         */}
          {/* ========================================================= */}
          {currentScreen === "profile" && (
            <div className="p-5 space-y-5 animate-fade-in">
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Student profile</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Configure study stats & integrations</p>
              </div>

              {/* Avatar identity card */}
              <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FF4E00] flex items-center justify-center text-white font-black text-2xl shadow-md">
                  M
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-black text-slate-800 leading-none">mobileseba247</h4>
                  <p className="text-[11px] text-slate-400 font-medium">mobileseba247@gmail.com</p>
                  <span className="inline-block text-[8px] font-bold bg-[#EBF7EE] text-green-600 px-2 py-0.5 rounded uppercase mt-1">
                    Premium Subscriber
                  </span>
                </div>
              </div>

              {/* Interactive Performance statistics grids */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex flex-col justify-between">
                  <Flame className="w-5 h-5 text-orange-500 mb-2" />
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">STUDY STREAK</p>
                    <h4 className="text-base font-black text-slate-800">5 Days Active</h4>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex flex-col justify-between">
                  <Award className="w-5 h-5 text-yellow-500 mb-2" />
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">TOTAL POINTS</p>
                    <h4 className="text-base font-black text-slate-800">1,240 XP</h4>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex flex-col justify-between">
                  <ClipboardList className="w-5 h-5 text-blue-500 mb-2" />
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">COMPLETED TEST</p>
                    <h4 className="text-base font-black text-slate-800">{takenTests.length} Mock</h4>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex flex-col justify-between">
                  <Timer className="w-5 h-5 text-green-500 mb-2" />
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">ACCURACY RATE</p>
                    <h4 className="text-base font-black text-slate-800">
                      {takenTests.length > 0 
                        ? Math.round(takenTests.reduce((acc, t) => acc + t.percentage, 0) / takenTests.length) 
                        : 90}%
                    </h4>
                  </div>
                </div>
              </div>

              {/* Toggle switch row for Sound Effects */}
              <div className="bg-white border border-slate-100 rounded-3xl p-4.5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 leading-none">Sound Effects</h5>
                    <p className="text-[9px] font-bold text-slate-400 mt-1">Play click, correct and error tunes</p>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setSoundEnabled(!soundEnabled);
                    if (typeof window !== "undefined") {
                      localStorage.setItem("job_master_sound", String(!soundEnabled));
                    }
                  }}
                  className={`w-11 h-6 rounded-full p-1 transition-all ${
                    soundEnabled ? "bg-[#FF6A00]" : "bg-slate-300"
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-all transform ${
                    soundEnabled ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>

              {/* Core Database / Sync status report */}
              <div className="bg-slate-100 rounded-3xl p-5 space-y-3 text-slate-600">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Integrations diagnostics</span>
                
                <div className="space-y-2.5 text-xs font-semibold">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Supabase Connection</span>
                    <span className="text-green-600 font-extrabold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Healthy
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Questions Sync Status</span>
                    <span className="text-slate-700">{isUsingFallback ? "Offline Fallback (Active)" : "Supabase Table (Synchronized)"}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Local Cache Database</span>
                    <span className="text-green-600 font-extrabold">Active</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Persistent Bottom Tab Navigation Bar matching the image */}
        {currentScreen !== "quiz" && (
          <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-between items-center px-4 py-2 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-40">
            {/* Nav Item 1: HOME */}
            <button 
              onClick={() => {
                setCurrentScreen("home");
                if (soundEnabled) quizAudio.playClick();
              }}
              className="flex flex-col items-center justify-center py-1.5 flex-1 transition-all active:scale-95 cursor-pointer"
            >
              <HomeIcon className={`w-5 h-5 ${currentScreen === "home" ? "text-[#FF6A00]" : "text-[#94A3B8]"} stroke-[2.2px]`} />
              <span className={`text-[9px] font-extrabold tracking-wide mt-1 uppercase ${currentScreen === "home" ? "text-[#FF6A00]" : "text-[#94A3B8]"}`}>
                HOME
              </span>
            </button>

            {/* Nav Item 2: COURSES */}
            <button 
              onClick={() => {
                setCurrentScreen("courses");
                if (soundEnabled) quizAudio.playClick();
              }}
              className="flex flex-col items-center justify-center py-1.5 flex-1 transition-all active:scale-95 cursor-pointer"
            >
              <BookOpen className={`w-5 h-5 ${currentScreen === "courses" ? "text-[#FF6A00]" : "text-[#94A3B8]"} stroke-[2.2px]`} />
              <span className={`text-[9px] font-extrabold tracking-wide mt-1 uppercase ${currentScreen === "courses" ? "text-[#FF6A00]" : "text-[#94A3B8]"}`}>
                COURSES
              </span>
            </button>

            {/* Nav Item 3: ROUTINE */}
            <button 
              onClick={() => {
                setCurrentScreen("routine");
                if (soundEnabled) quizAudio.playClick();
              }}
              className="flex flex-col items-center justify-center py-1.5 flex-1 transition-all active:scale-95 cursor-pointer"
            >
              <Calendar className={`w-5 h-5 ${currentScreen === "routine" ? "text-[#FF6A00]" : "text-[#94A3B8]"} stroke-[2.2px]`} />
              <span className={`text-[9px] font-extrabold tracking-wide mt-1 uppercase ${currentScreen === "routine" ? "text-[#FF6A00]" : "text-[#94A3B8]"}`}>
                ROUTINE
              </span>
            </button>

            {/* Nav Item 4: TESTS */}
            <button 
              onClick={() => {
                setCurrentScreen("tests");
                if (soundEnabled) quizAudio.playClick();
              }}
              className="flex flex-col items-center justify-center py-1.5 flex-1 transition-all active:scale-95 cursor-pointer"
            >
              <ClipboardList className={`w-5 h-5 ${currentScreen === "tests" ? "text-[#FF6A00]" : "text-[#94A3B8]"} stroke-[2.2px]`} />
              <span className={`text-[9px] font-extrabold tracking-wide mt-1 uppercase ${currentScreen === "tests" ? "text-[#FF6A00]" : "text-[#94A3B8]"}`}>
                TESTS
              </span>
            </button>

            {/* Nav Item 5: PROFILE */}
            <button 
              onClick={() => {
                setCurrentScreen("profile");
                if (soundEnabled) quizAudio.playClick();
              }}
              className="flex flex-col items-center justify-center py-1.5 flex-1 transition-all active:scale-95 cursor-pointer"
            >
              <CircleUser className={`w-5 h-5 ${currentScreen === "profile" ? "text-[#FF6A00]" : "text-[#94A3B8]"} stroke-[2.2px]`} />
              <span className={`text-[9px] font-extrabold tracking-wide mt-1 uppercase ${currentScreen === "profile" ? "text-[#FF6A00]" : "text-[#94A3B8]"}`}>
                PROFILE
              </span>
            </button>
          </nav>
        )}

      </div>

    </div>
  );
}
