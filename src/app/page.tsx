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
  Bookmark,
  Settings,
  LogOut,
  LogIn,
  Package,
  Download
} from "lucide-react";
import { QUIZ_QUESTIONS, Question } from "../data";
import { getSupabase } from "../lib/supabase";
import { quizAudio } from "../lib/audio";
import { PwaProvider, BottomInstallBanner, InstallPwaPopup } from "../components/InstallPwaPopup";

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
const BANGLA_1ST_QUESTIONS: Question[] = [
  {
    id: 1001,
    question: "'কবর' কবিতাটি কার রচনা?",
    options: ["কাজী নজরুল ইসলাম", "রবীন্দ্রনাথ ঠাকুর", "জসীমউদ্দীন", "জীবনানন্দ দাশ"],
    correctIndex: 2
  },
  {
    id: 1002,
    question: "'গীতাঞ্জলি' কাব্যের জন্য রবীন্দ্রনাথ ঠাকুর কত সালে নোবেল পুরস্কার পান?",
    options: ["১৯১০", "১৯১৩", "১৯২১", "১৯৩০"],
    correctIndex: 1
  },
  {
    id: 1003,
    question: "'লালসালু' উপন্যাসের লেখক কে?",
    options: ["শওকত ওসমান", "সৈয়দ ওয়ালীউল্লাহ", "মানিক বন্দ্যোপাধ্যায়", "তারাশঙ্কর বন্দ্যোপাধ্যায়"],
    correctIndex: 1
  }
];

const BANGLA_2ND_QUESTIONS: Question[] = [
  {
    id: 1004,
    question: "বাংলা ব্যাকরণের প্রধান আলোচ্য বিষয় কয়টি?",
    options: ["২টি", "৩টি", "৪টি", "৫টি"],
    correctIndex: 2
  },
  {
    id: 1005,
    question: "'সন্ধি' ব্যাকরণের কোন অংশে আলোচিত হয়?",
    options: ["ধ্বনি তত্ত্বে", "শব্দ তত্ত্বে", "বাক্য তত্ত্বে", "অর্থ তত্ত্বে"],
    correctIndex: 0
  },
  {
    id: 1006,
    question: "'নীল আকাশ' কোন সমাস?",
    options: ["দ্বন্দ্ব সমাস", "তৎপুরুষ সমাস", "বহুব্রীহি সমাস", "কর্মধারয় সমাস"],
    correctIndex: 3
  }
];

const ENGLISH_1ST_QUESTIONS: Question[] = [
  {
    id: 1007,
    question: "Who wrote 'Paradise Lost'?",
    options: ["John Milton", "William Shakespeare", "William Wordsworth", "John Keats"],
    correctIndex: 0
  },
  {
    id: 1008,
    question: "'To be or not to be, that is the question' is from which play?",
    options: ["Macbeth", "Othello", "Hamlet", "King Lear"],
    correctIndex: 2
  },
  {
    id: 1009,
    question: "Who is known as the 'Poet of Nature' in English literature?",
    options: ["Lord Byron", "P. B. Shelley", "William Wordsworth", "John Keats"],
    correctIndex: 2
  }
];

const ENGLISH_2ND_QUESTIONS: Question[] = [
  {
    id: 1010,
    question: "What is the plural form of 'Louse'?",
    options: ["Louses", "Lice", "Lices", "Louse"],
    correctIndex: 1
  },
  {
    id: 1011,
    question: "Choose the correct spelling:",
    options: ["Leiutenant", "Lieutenant", "Liautenant", "Lieutanant"],
    correctIndex: 1
  },
  {
    id: 1012,
    question: "What is the antonym of 'Gentle'?",
    options: ["Kind", "Rude/Harsh", "Soft", "Polite"],
    correctIndex: 1
  }
];

const PHYSICS_QUESTIONS: Question[] = [
  {
    id: 1013,
    question: "শব্দের গতি কোন মাধ্যমে সবচেয়ে বেশি?",
    options: ["বায়বীয় মাধ্যম", "তরল মাধ্যম", "কঠিন মাধ্যম", "শূন্য মাধ্যম"],
    correctIndex: 2
  },
  {
    id: 1014,
    question: "ক্ষমতার একক কী?",
    options: ["জুল", "ওয়াট", "প্যাসকেল", "নিউটন"],
    correctIndex: 1
  },
  {
    id: 1015,
    question: "মহাকর্ষীয় ধ্রুবক (G) এর মান কত?",
    options: ["6.673 x 10^-11 N m^2/kg^2", "9.8 m/s^2", "3 x 10^8 m/s", "1.6 x 10^-19 C"],
    correctIndex: 0
  }
];

const CHEMISTRY_QUESTIONS: Question[] = [
  {
    id: 1016,
    question: "সাধারণ লবণের রাসায়নিক সংকেত কোনটি?",
    options: ["HCl", "NaOH", "NaCl", "CaCO3"],
    correctIndex: 2
  },
  {
    id: 1017,
    question: "পর্যায় সারণির প্রথম মৌল কোনটি?",
    options: ["হিলিয়াম", "হাইড্রোজেন", "লিথিয়াম", "অক্সিজেন"],
    correctIndex: 1
  },
  {
    id: 1018,
    question: "উড়োজাহাজের টায়ারে কোন নিষ্ক্রিয় গ্যাস ব্যবহার করা হয়?",
    options: ["আর্গন", "নিয়ন", "হিলিয়াম", "ক্রিপ্টন"],
    correctIndex: 2
  }
];

const BIOLOGY_QUESTIONS: Question[] = [
  {
    id: 1019,
    question: "রক্তের গ্রুপ কে আবিষ্কার করেন?",
    options: ["আলেকজান্ডার ফ্লেমিং", "কার্ল ল্যান্ডস্টেইনার", "রবার্ট হুক", "লুই পাস্তুর"],
    correctIndex: 1
  },
  {
    id: 1020,
    question: "কোষের পাওয়ার হাউস (Power House) বলা হয় কাকে?",
    options: ["নিউক্লিয়াস", "ক্রোমোজোম", "সাইটোপ্লাজম", "মাইটোকন্ড্রিয়া"],
    correctIndex: 3
  },
  {
    id: 1021,
    question: "লোহিত রক্তকণিকার গড় আয়ু কত দিন?",
    options: ["৬০ দিন", "৯০ দিন", "১২০ দিন", "১৫০ দিন"],
    correctIndex: 2
  }
];

const ARITHMETIC_QUESTIONS: Question[] = [
  {
    id: 1022,
    question: "১ থেকে ১০০ পর্যন্ত মৌলিক সংখ্যা কয়টি?",
    options: ["১৫টি", "২০টি", "২৫টি", "৩০টি"],
    correctIndex: 2
  },
  {
    id: 1023,
    question: "৩, ৯ ও ৪ এর চতুর্থ সমানুপাতী কত?",
    options: ["৮", "১০", "১২", "১৬"],
    correctIndex: 2
  },
  {
    id: 1024,
    question: "পিতা ও পুত্রের বয়সের সমষ্টি ৬০ বছর। পিতার বয়স পুত্রের বয়সের ৪ গুণ হলে, পুত্রের বয়স কত?",
    options: ["১০ বছর", "১২ বছর", "১৫ বছর", "২০ বছর"],
    correctIndex: 1
  }
];

const ALGEBRA_QUESTIONS: Question[] = [
  {
    id: 1025,
    question: "(a + b)^2 এর সঠিক সূত্র কোনটি?",
    options: ["a^2 - 2ab + b^2", "a^2 + 2ab + b^2", "a^2 + b^2", "a^2 - b^2"],
    correctIndex: 1
  },
  {
    id: 1026,
    question: "x^2 - 5x + 6 = 0 সমীকরণের মূলদ্বয় কত?",
    options: ["1, 6", "2, 3", "-2, -3", "0, 5"],
    correctIndex: 1
  },
  {
    id: 1027,
    question: "log2 (8) এর মান কত?",
    options: ["১", "২", "৩", "৪"],
    correctIndex: 2
  }
];

const BANGLA_QUESTIONS: Question[] = [...BANGLA_1ST_QUESTIONS, ...BANGLA_2ND_QUESTIONS];
const ENGLISH_QUESTIONS: Question[] = [...ENGLISH_1ST_QUESTIONS, ...ENGLISH_2ND_QUESTIONS];
const SCIENCE_QUESTIONS: Question[] = [...PHYSICS_QUESTIONS, ...CHEMISTRY_QUESTIONS, ...BIOLOGY_QUESTIONS];
const MATH_QUESTIONS: Question[] = [...ARITHMETIC_QUESTIONS, ...ALGEBRA_QUESTIONS];

const ALL_COURSES_DATA = [
  { id: "bcs", title: "BCS Preparation Masterclass", desc: "পূর্ণাঙ্গ বিসিএস সিলেবাসের ওপর ভিত্তি করে অধ্যায়ভিত্তিক লাইভ এমসিকিউ ও বিশ্লেষণমূলক লেকচার শীট।", category: "BCS", icon: BookOpen, bg: "bg-[#FFF1E6]", iconColor: "text-orange-600" },
  { id: "bank", title: "Bank Job Officer Premium", desc: "সরকারি ও বেসরকারি ব্যাংক সিনিয়র অফিসার নিয়োগ পরীক্ষার উপযোগী প্রিপারেশন গাইড এবং শর্টকাট ম্যাথ।", category: "Bank", icon: Calculator, bg: "bg-[#E6F0FA]", iconColor: "text-blue-600" },
  { id: "primary", title: "Primary School Teacher Prep", desc: "প্রাথমিক সহকারী শিক্ষক নিয়োগের বিগত বছরের প্রশ্ন এবং বোর্ড বই ভিত্তিক বিশেষ স্পিড কুইজ মডিউল।", category: "Teachers", icon: Globe, bg: "bg-[#EBF7EE]", iconColor: "text-green-600" },
  { id: "ntrca", title: "NTRCA School & College Registration", desc: "১৭তম ও ১৮তম শিক্ষক নিবন্ধন পরীক্ষার সর্বশেষ সিলেবাস ভিত্তিক সাধারণ জ্ঞান এবং সাবজেক্ট প্রস্তুতি।", category: "Teachers", icon: GraduationCap, bg: "bg-[#F3E8FF]", iconColor: "text-purple-600" },
  { id: "psc", title: "PSC Non-Cadre Mock Series", desc: "বাংলাদেশ সরকারী কর্ম কমিশন (PSC) আয়োজিত বিভিন্ন গ্রেডের ও নন-ক্যাডার পদের জন্য সুপার মক টেস্ট।", category: "Other", icon: FileText, bg: "bg-[#FCE7F3]", iconColor: "text-rose-600" },
  { id: "all_job", title: "All Job Exams Universal Pack", desc: "সকল সরকারী ও স্বায়ত্তশাসিত প্রতিষ্ঠানের ৩য় ও ৪র্থ শ্রেণীর চাকরি পরীক্ষার সাধারণ জ্ঞান ও আইকিউ প্যাকেজ।", category: "All", icon: Briefcase, bg: "bg-[#E0F2FE]", iconColor: "text-sky-600" },
  { id: "bangla_english", title: "Bangla & English Literature Mastery", desc: "বাংলা ব্যাকরণ ও সাহিত্য, ইংরেজি গ্রামার এবং লিটারেচার পাসের জন্য প্রফেশনাল শর্ট টেকনিক কোর্স।", category: "Bangla", icon: BookOpen, bg: "bg-[#F1F5F9]", iconColor: "text-slate-700" },
  { id: "math_science", title: "Quantitative Aptitude & General Science", desc: "জ্যামিতি, বীজগণিত, পাটিগণিত এবং দৈনন্দিন বিজ্ঞান বিষয়ের সবচেয়ে সহজ সমাধান কৌশল ও পরীক্ষা।", category: "Math", icon: Calculator, bg: "bg-[#E0F2FE]", iconColor: "text-blue-600" },
  { id: "office", title: "Office Assistant Preparation", desc: "সরকারি দপ্তর ও পরিদপ্তরে অফিস সহকারী ও কম্পিউটার অপারেটর পদের জন্য বিশেষ সিলেবাস কুইজ।", category: "Other", icon: FileText, bg: "bg-[#EBF7EE]", iconColor: "text-green-600" },
  { id: "private", title: "Private Job & Corporate Prep", desc: "প্রথম সারির বেসরকারি ব্যাংক, এনজিও ও মাল্টিন্যাショナル কোম্পানির নিয়োগ পরীক্ষার প্রিপারেশন মডিউল।", category: "Other", icon: Briefcase, bg: "bg-[#FFF1E6]", iconColor: "text-orange-600" },
  { id: "defense", title: "Defense & Police SI Prep", desc: "পুলিশ সাব-ইন্সপেক্টর, সার্জেন্ট ও সশস্ত্র বাহিনীর নিয়োগ পরীক্ষার সাধারণ জ্ঞান এবং ভাইভা প্রস্তুতি।", category: "Other", icon: Award, bg: "bg-[#E6F0FA]", iconColor: "text-blue-600" },
  { id: "railway", title: "Railway Recruitment Special", desc: "বাংলাদেশ রেলওয়ের বিভিন্ন ক্যাটাগরির পদের জন্য বিগত ১০ বছরের প্রশ্ন ও সাজেস্টেড স্পিড টেস্ট।", category: "Other", icon: Globe, bg: "bg-[#F3E8FF]", iconColor: "text-purple-600" },
  { id: "ministry", title: "Ministry Non-Cadre Series", desc: "বিভিন্ন মন্ত্রণালয়ের নন-ক্যাডার ও গ্রেডভিত্তিক পরীক্ষা পাসের সুপার মডেল টেস্ট ও সমাধান।", category: "Other", icon: GraduationCap, bg: "bg-[#FCE7F3]", iconColor: "text-rose-600" }
];

export default function Home() {
  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<"home" | "quiz" | "courses" | "routine" | "tests" | "profile" | "course-detail" | "prep-sub">("home");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<any | null>(null);
  const [previousScreen, setPreviousScreen] = useState<"home" | "quiz" | "courses" | "routine" | "tests" | "profile" | "course-detail" | "prep-sub">("home");
  const [selectedPrepSubject, setSelectedPrepSubject] = useState<"Bangla" | "English" | "Science" | "Math" | "">("");
  
  // Drawer & Overlay States
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [selectedLanguage, setSelectedLanguage] = useState<"BN" | "EN">("BN");
  const [activeDrawerModal, setActiveDrawerModal] = useState<"none" | "package" | "bookstore" | "language" | "settings" | "ourapps" | "contact">("none");
  
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
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

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
            const possibleQuestionKeys = ["questionText", "question_text", "question", "title", "text", "questiontext"];
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
  const filteredCoursesList = ALL_COURSES_DATA.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(coursesSearchQuery.toLowerCase()) || 
                          course.desc.toLowerCase().includes(coursesSearchQuery.toLowerCase());
    const matchesCategory = selectedCourseCategory === "All" || course.category === selectedCourseCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <PwaProvider>
      <div className="min-h-screen w-full bg-slate-50 sm:bg-gradient-to-br sm:from-[#F1F5F9] sm:via-[#E2E8F0] sm:to-[#CBD5E1] flex items-center justify-center p-0 sm:p-6 md:p-8 selection:bg-orange-500 selection:text-white">
        
        {/* Global PWA Toast & Guide Modals */}
        <InstallPwaPopup />

        {/* Floating Bottom Sheet Banner directly above Bottom Navigation */}
        <BottomInstallBanner />

        {/* Dynamic Background Blur Balls */}
        <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-300/25 rounded-full blur-[120px] pointer-events-none z-0 hidden sm:block" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-300/25 rounded-full blur-[120px] pointer-events-none z-0 hidden sm:block" />

        {/* Primary Smartphone Container Mockup - 100% Edge-to-Edge on Mobile Devices */}
        <div className="w-full max-w-full sm:max-w-md bg-slate-50 h-[100dvh] sm:h-[840px] sm:max-h-[880px] rounded-none sm:rounded-[40px] border-none sm:border sm:border-slate-200/50 shadow-none sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] flex flex-col relative overflow-hidden z-10">
        
        {/* Smartphone Upper Bezel Accent (Only visible on sm+ screen for aesthetics) */}
        <div className="hidden sm:block absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-slate-900 rounded-b-3xl z-50">
          <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-slate-800 rounded-full" />
          <div className="absolute top-1 right-8 w-2 h-2 bg-slate-800 rounded-full" />
        </div>

        {/* Main Header of the App (Strictly Fixed on Top, Never Scrolls Out of View) */}
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 sm:px-5 pt-3 pb-3 sm:pt-8 sm:pb-3.5 flex items-center justify-between shadow-sm z-40 shrink-0 sticky top-0">
          {/* Left side: Hamburger/Back and brand name */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                if (currentScreen === "course-detail" || currentScreen === "prep-sub" || currentScreen === "quiz") {
                  setCurrentScreen(previousScreen || "home");
                } else {
                  setDrawerOpen(!drawerOpen);
                }
                if (soundEnabled) quizAudio.playClick();
              }}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 active:scale-95 transition-all z-50 relative"
              id="menu-toggle-button"
            >
              {currentScreen === "course-detail" || currentScreen === "prep-sub" || currentScreen === "quiz" ? (
                <ArrowLeft className="w-6 h-6 stroke-[2.2px]" />
              ) : drawerOpen ? (
                <X className="w-6 h-6 stroke-[2.2px] text-orange-600 animate-spin-once" />
              ) : (
                <Menu className="w-6 h-6 stroke-[2.2px]" />
              )}
            </button>
            
            <button 
              onClick={() => {
                setCurrentScreen("home");
                if (soundEnabled) quizAudio.playClick();
              }}
              className="flex items-center gap-1.5 ml-1 text-left cursor-pointer active:scale-95 transition-all"
              id="header-brand-button"
            >
              {/* Custom icon combining orange graduation cap */}
              <div className="bg-[#FF6A00] p-1.5 rounded-xl shadow-md shadow-orange-500/20">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-[#1E293B] text-base tracking-tight leading-none">
                  {currentScreen === "course-detail" && selectedCourseDetail ? (
                    <>
                      {selectedCourseDetail.title.split(" ")[0]} <span className="text-[#FF6A00]">{selectedCourseDetail.title.split(" ").slice(1).join(" ")}</span>
                    </>
                  ) : currentScreen === "prep-sub" ? (
                    <>
                      {selectedPrepSubject} <span className="text-[#FF6A00]">Hub</span>
                    </>
                  ) : currentScreen === "quiz" ? (
                    <>
                      Quiz <span className="text-[#FF6A00]">Master</span>
                    </>
                  ) : (
                    <>
                      Job <span className="text-[#FF6A00]">Master</span>
                    </>
                  )}
                </span>
                <span className="text-[8px] font-bold tracking-[0.08em] text-[#94A3B8] uppercase mt-0.5">
                  {currentScreen === "course-detail" && selectedCourseDetail ? `${selectedCourseDetail.category} Course Details` : currentScreen === "prep-sub" ? `Select ${selectedPrepSubject} Subject` : currentScreen === "quiz" ? (activeQuizSubtitle || "Live Exam") : "চাকরি এখন হাতের মুঠোয়!"}
                </span>
              </div>
            </button>
          </div>

          {/* Right side: Search shortcut and Bell icon */}
          <div className="flex items-center gap-2">

            <button 
              onClick={() => {
                setCurrentScreen("courses");
                if (soundEnabled) quizAudio.playClick();
              }}
              className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-full active:scale-95 transition-all cursor-pointer"
              title="খুঁজুন"
            >
              <Search className="w-5 h-5" />
            </button>

            <button 
              onClick={() => {
                setCurrentScreen("routine");
                if (soundEnabled) quizAudio.playClick();
              }}
              className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-full relative active:scale-95 transition-all cursor-pointer"
              title="নোটিফিকেশন"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
            </button>
          </div>
        </header>

        {/* Scrollable Main Content Frame */}
        <div className="flex-1 overflow-y-auto overscroll-y-contain pb-28 md:pb-10 bg-slate-50/60 relative">
          
          {/* ========================================================= */}
          {/* 1. SCREEN: HOME                                           */}
          {/* ========================================================= */}
          {currentScreen === "home" && (
            <div className="p-5 space-y-6 animate-fade-in">
              
              {/* Our Course Section */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-[#1E293B] tracking-tight">
                      Our Course
                    </h3>
                  </div>
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
                      const course = ALL_COURSES_DATA.find(c => c.id === "bcs");
                      setSelectedCourseDetail(course);
                      setPreviousScreen("home");
                      setCurrentScreen("course-detail");
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
                      const course = ALL_COURSES_DATA.find(c => c.id === "bank");
                      setSelectedCourseDetail(course);
                      setPreviousScreen("home");
                      setCurrentScreen("course-detail");
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
                      const course = ALL_COURSES_DATA.find(c => c.id === "primary");
                      setSelectedCourseDetail(course);
                      setPreviousScreen("home");
                      setCurrentScreen("course-detail");
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
                      const course = ALL_COURSES_DATA.find(c => c.id === "ntrca");
                      setSelectedCourseDetail(course);
                      setPreviousScreen("home");
                      setCurrentScreen("course-detail");
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
                      const course = ALL_COURSES_DATA.find(c => c.id === "psc");
                      setSelectedCourseDetail(course);
                      setPreviousScreen("home");
                      setCurrentScreen("course-detail");
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
                      const course = ALL_COURSES_DATA.find(c => c.id === "all_job");
                      setSelectedCourseDetail(course);
                      setPreviousScreen("home");
                      setCurrentScreen("course-detail");
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

              {/* General Quiz Game Live Banner (Gradient Orange/Red matching image) - Compact Redesign */}
              <div className="bg-gradient-to-br from-[#FF6B35] to-[#FF4E00] rounded-3xl p-5 text-white relative overflow-hidden shadow-md shadow-orange-500/15">
                {/* Subtle background glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-lg pointer-events-none" />
                
                {/* Header elements: Live... on Left, Active Users on Right */}
                <div className="flex items-center justify-between">
                  {/* Left corner: Live... */}
                  <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                    </span>
                    <span>Live</span>
                    <span className="inline-flex gap-0.5 ml-0.5 items-end h-1.5 pb-[2px]">
                      <span className="w-[3px] h-[3px] bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-[3px] h-[3px] bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-[3px] h-[3px] bg-white rounded-full animate-bounce"></span>
                    </span>
                  </div>
                  
                  {/* Right corner: Active Users */}
                  <div className="flex items-center gap-1.5 bg-black/15 px-3 py-1 rounded-full text-[10px] font-extrabold">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse mr-0.5"></span>
                    <Users className="w-3 h-3 text-white/95" />
                    <span>1,420 playing</span>
                  </div>
                </div>

                {/* Title and Button cleanly organized to save space */}
                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h3 className="text-lg font-black tracking-tight leading-none">
                      Job Master
                    </h3>
                    <span className="text-orange-100 text-[10px] font-bold tracking-wide block mt-0.5">
                      চাকরি এখন হাতের মুঠোয়!
                    </span>
                  </div>

                  <button 
                    onClick={() => startQuizFlow("Job Master", "চাকরি এখন হাতের মুঠোয়!", isUsingFallback ? QUIZ_QUESTIONS : questions)}
                    className="bg-white hover:bg-orange-50 text-[#FF4E00] font-extrabold text-xs px-5 py-2.5 rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shrink-0"
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

                <div className="grid grid-cols-2 gap-3">
                  {/* Preparation Hub Item 1: Bangla */}
                  <div 
                    onClick={() => {
                      setSelectedPrepSubject("Bangla");
                      setPreviousScreen("home");
                      setCurrentScreen("prep-sub");
                      if (soundEnabled) quizAudio.playClick();
                    }}
                    className="bg-white border border-slate-100 rounded-2xl p-2.5 flex flex-row items-center gap-2.5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer active:scale-95"
                  >
                    <div className="w-10 h-10 bg-[#FFF1E6] rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                      <BookOpen className="w-5 h-5 stroke-[2.2px]" />
                    </div>
                    <span className="text-xs font-extrabold text-[#334155] tracking-wide">Bangla</span>
                  </div>

                  {/* Preparation Hub Item 2: English */}
                  <div 
                    onClick={() => {
                      setSelectedPrepSubject("English");
                      setPreviousScreen("home");
                      setCurrentScreen("prep-sub");
                      if (soundEnabled) quizAudio.playClick();
                    }}
                    className="bg-white border border-slate-100 rounded-2xl p-2.5 flex flex-row items-center gap-2.5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer active:scale-95"
                  >
                    <div className="w-10 h-10 bg-[#F3E8FF] rounded-xl flex items-center justify-center text-purple-600 shrink-0">
                      <Globe className="w-5 h-5 stroke-[2.2px]" />
                    </div>
                    <span className="text-xs font-extrabold text-[#334155] tracking-wide">English</span>
                  </div>

                  {/* Preparation Hub Item 3: Math */}
                  <div 
                    onClick={() => {
                      setSelectedPrepSubject("Math");
                      setPreviousScreen("home");
                      setCurrentScreen("prep-sub");
                      if (soundEnabled) quizAudio.playClick();
                    }}
                    className="bg-white border border-slate-100 rounded-2xl p-2.5 flex flex-row items-center gap-2.5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer active:scale-95"
                  >
                    <div className="w-10 h-10 bg-[#E6F0FA] rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                      <Calculator className="w-5 h-5 stroke-[2.2px]" />
                    </div>
                    <span className="text-xs font-extrabold text-[#334155] tracking-wide">Math</span>
                  </div>

                  {/* Preparation Hub Item 4: Science */}
                  <div 
                    onClick={() => {
                      setSelectedPrepSubject("Science");
                      setPreviousScreen("home");
                      setCurrentScreen("prep-sub");
                      if (soundEnabled) quizAudio.playClick();
                    }}
                    className="bg-white border border-slate-100 rounded-2xl p-2.5 flex flex-row items-center gap-2.5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer active:scale-95"
                  >
                    <div className="w-10 h-10 bg-[#EBF7EE] rounded-xl flex items-center justify-center text-green-600 shrink-0">
                      <Sparkles className="w-5 h-5 stroke-[2.2px]" />
                    </div>
                    <span className="text-xs font-extrabold text-[#334155] tracking-wide">Science</span>
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
                    {(currentQuestion as any).questionText || currentQuestion.question || (currentQuestion as any).title || "Untitled Question"}
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
                <div className="grid grid-cols-2 gap-3">
                  {filteredCoursesList.map((course) => {
                    const CourseIcon = course.icon;
                    return (
                      <div 
                        key={course.id}
                        onClick={() => {
                          setSelectedCourseDetail(course);
                          setPreviousScreen("courses");
                          setCurrentScreen("course-detail");
                          if (soundEnabled) quizAudio.playClick();
                        }}
                        className="bg-white border border-slate-100 hover:border-[#FF6A00]/40 rounded-2xl p-2.5 flex flex-col justify-between gap-2 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer active:scale-95 text-left"
                      >
                        <div className="flex items-center gap-2 justify-between">
                          <div className={`w-8 h-8 ${course.bg} ${course.iconColor} rounded-xl flex items-center justify-center shrink-0`}>
                            <CourseIcon className="w-4 h-4 stroke-[2.2px]" />
                          </div>
                          <span className="text-[8px] font-black bg-orange-100/60 text-[#FF6A00] px-1.5 py-0.5 rounded uppercase">
                            {course.category}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <h4 className="text-[11px] font-extrabold text-slate-800 leading-tight line-clamp-2">
                            {course.title}
                          </h4>
                          <p className="text-[9px] text-slate-400 font-semibold line-clamp-2">
                            {course.desc}
                          </p>
                        </div>

                        <div className="border-t border-slate-50 pt-1.5 flex items-center justify-between mt-1">
                          <span className="text-[8px] font-black text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full">
                            Free
                          </span>
                          <span className="text-[8px] font-bold text-slate-500 flex items-center gap-0.5">
                            Enter <ChevronRight className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* PREPARATION HUB SUB-SUBJECTS SCREEN                        */}
          {/* ========================================================= */}
          {currentScreen === "prep-sub" && (
            <div className="p-5 space-y-5 animate-fade-in pb-10">
              
              {/* Back Button & Title */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    setCurrentScreen("home");
                    if (soundEnabled) quizAudio.playClick();
                  }}
                  className="p-2 bg-white hover:bg-slate-100 rounded-xl text-slate-700 shadow-sm transition-all active:scale-90"
                >
                  <ArrowLeft className="w-5 h-5 stroke-[2.5px]" />
                </button>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#FF6A00] bg-orange-50 px-2.5 py-0.5 rounded-full">
                    Preparation Hub
                  </span>
                  <h3 className="font-extrabold text-sm text-slate-900 tracking-tight leading-none mt-1">
                    {selectedPrepSubject === "Bangla" && "বাংলা প্রস্তুতি প্যানেল"}
                    {selectedPrepSubject === "English" && "English Preparation Panel"}
                    {selectedPrepSubject === "Science" && "বিজ্ঞান প্রস্তুতি প্যানেল"}
                    {selectedPrepSubject === "Math" && "গণিত প্রস্তুতি প্যানেল"}
                  </h3>
                </div>
              </div>

              {/* Subject Description Card */}
              <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm space-y-2">
                <h4 className="text-sm font-black text-slate-800">
                  {selectedPrepSubject} MCQ Practice
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  {selectedPrepSubject === "Bangla" && "বাংলা ভাষা ও সাহিত্যের প্রথম ও দ্বিতীয় পত্রের গুরুত্বপূর্ণ নৈর্ব্যক্তিক নিয়ে সাজানো অধ্যায়ভিত্তিক টেস্ট মডিউল।"}
                  {selectedPrepSubject === "English" && "English Literature & Grammar multiple choice questions designed for high score prep in competitive exams."}
                  {selectedPrepSubject === "Science" && "পদার্থ, রসায়ন ও জীববিজ্ঞানের বিগত বছরের গুরুত্বপূর্ণ প্রশ্নসমূহ আলাদাভাবে অনুশীলনের মডিউল।"}
                  {selectedPrepSubject === "Math" && "পাটিগণিত ও বীজগণিতের গুরুত্বপূর্ণ গাণিতিক সমস্যা ও সূত্রাবলীর সঠিক উত্তরসহ এমসিকিউ সমাধান।"}
                </p>
              </div>

              {/* Sub-subjects grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider pl-1">
                  বিষয়সমূহ সিলেক্ট করুন (Select Subject)
                </h4>

                <div className="grid grid-cols-1 gap-3">
                  {selectedPrepSubject === "Bangla" && [
                    { name: "Bangla 1st Paper", sub: "বাংলা সাহিত্য ও গল্প-কবিতা", questions: BANGLA_1ST_QUESTIONS },
                    { name: "Bangla 2nd Paper", sub: "বাংলা ব্যাকরণ ও ভাষাতত্ত্ব", questions: BANGLA_2ND_QUESTIONS }
                  ].map((sub, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        startQuizFlow(sub.name, sub.sub, sub.questions);
                        if (soundEnabled) quizAudio.playClick();
                      }}
                      className="bg-white border border-slate-100 hover:border-[#FF6A00]/40 rounded-[2rem] p-4.5 flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                          <BookOpen className="w-5 h-5 stroke-[2.2px]" />
                        </div>
                        <div className="text-left space-y-0.5">
                          <h5 className="text-xs font-black text-slate-800 leading-snug">{sub.name}</h5>
                          <p className="text-[10px] font-bold text-slate-400">{sub.sub}</p>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl text-slate-400">
                        <Play className="w-3.5 h-3.5 fill-current text-orange-500" />
                      </div>
                    </div>
                  ))}

                  {selectedPrepSubject === "English" && [
                    { name: "English 1st Paper", sub: "English Literature & Reading", questions: ENGLISH_1ST_QUESTIONS },
                    { name: "English 2nd Paper", sub: "English Grammar & Vocabulary", questions: ENGLISH_2ND_QUESTIONS }
                  ].map((sub, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        startQuizFlow(sub.name, sub.sub, sub.questions);
                        if (soundEnabled) quizAudio.playClick();
                      }}
                      className="bg-white border border-slate-100 hover:border-[#FF6A00]/40 rounded-[2rem] p-4.5 flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                          <Globe className="w-5 h-5 stroke-[2.2px]" />
                        </div>
                        <div className="text-left space-y-0.5">
                          <h5 className="text-xs font-black text-slate-800 leading-snug">{sub.name}</h5>
                          <p className="text-[10px] font-bold text-slate-400">{sub.sub}</p>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl text-slate-400">
                        <Play className="w-3.5 h-3.5 fill-current text-purple-500" />
                      </div>
                    </div>
                  ))}

                  {selectedPrepSubject === "Science" && [
                    { name: "Physics", sub: "পদার্থবিজ্ঞান ও গতিবিদ্যার সূত্রাবলী", questions: PHYSICS_QUESTIONS },
                    { name: "Chemistry", sub: "রসায়ন তত্ত্ব ও পর্যায় সারণি", questions: CHEMISTRY_QUESTIONS },
                    { name: "Biology", sub: "জীববিজ্ঞান ও মানবদেহের কার্যাবলী", questions: BIOLOGY_QUESTIONS }
                  ].map((sub, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        startQuizFlow(sub.name, sub.sub, sub.questions);
                        if (soundEnabled) quizAudio.playClick();
                      }}
                      className="bg-white border border-slate-100 hover:border-[#FF6A00]/40 rounded-[2rem] p-4.5 flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                          <Sparkles className="w-5 h-5 stroke-[2.2px]" />
                        </div>
                        <div className="text-left space-y-0.5">
                          <h5 className="text-xs font-black text-slate-800 leading-snug">{sub.name}</h5>
                          <p className="text-[10px] font-bold text-slate-400">{sub.sub}</p>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl text-slate-400">
                        <Play className="w-3.5 h-3.5 fill-current text-green-500" />
                      </div>
                    </div>
                  ))}

                  {selectedPrepSubject === "Math" && [
                    { name: "Arithmetic (পাটিগণিত)", sub: "মৌলিক সংখ্যা, শতকরা ও লাভ-ক্ষতি", questions: ARITHMETIC_QUESTIONS },
                    { name: "Algebra (বীজগণিত)", sub: "মান নির্ণয়, সমীকরণ ও লগারিদম", questions: ALGEBRA_QUESTIONS }
                  ].map((sub, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        startQuizFlow(sub.name, sub.sub, sub.questions);
                        if (soundEnabled) quizAudio.playClick();
                      }}
                      className="bg-white border border-slate-100 hover:border-[#FF6A00]/40 rounded-[2rem] p-4.5 flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                          <Calculator className="w-5 h-5 stroke-[2.2px]" />
                        </div>
                        <div className="text-left space-y-0.5">
                          <h5 className="text-xs font-black text-slate-800 leading-snug">{sub.name}</h5>
                          <p className="text-[10px] font-bold text-slate-400">{sub.sub}</p>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl text-slate-400">
                        <Play className="w-3.5 h-3.5 fill-current text-blue-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* COURSE DETAIL SCREEN                                      */}
          {/* ========================================================= */}
          {currentScreen === "course-detail" && selectedCourseDetail && (
            <div className="p-5 space-y-5 animate-fade-in pb-10">
              
              {/* Back Button & Title */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    setCurrentScreen(previousScreen);
                    if (soundEnabled) quizAudio.playClick();
                  }}
                  className="p-2 bg-white hover:bg-slate-100 rounded-xl text-slate-700 shadow-sm transition-all active:scale-90"
                >
                  <ArrowLeft className="w-5 h-5 stroke-[2.5px]" />
                </button>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#FF6A00] bg-orange-50 px-2.5 py-0.5 rounded-full">
                    {selectedCourseDetail.category} Course
                  </span>
                  <h3 className="font-extrabold text-sm text-slate-900 tracking-tight leading-none mt-1">
                    কোর্সের বিষয়বস্তু
                  </h3>
                </div>
              </div>

              {/* Course Main Card */}
              <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${selectedCourseDetail.bg} ${selectedCourseDetail.iconColor} rounded-2xl flex items-center justify-center shrink-0 shadow-inner`}>
                    {(() => {
                      const IconComponent = selectedCourseDetail.icon;
                      return <IconComponent className="w-7 h-7 stroke-[2.2px]" />;
                    })()}
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-800 leading-snug">
                      {selectedCourseDetail.title}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400">
                      সহজ গাইড ও স্পেশাল মক টেস্ট
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {selectedCourseDetail.desc}
                </p>
              </div>

              {/* Grid Section of Tests */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider pl-1">
                  মডেল টেস্ট সমূহ (Select Exam)
                </h4>

                <div className="grid grid-cols-1 gap-3">
                  
                  {/* Test 1: Weekly Model Test */}
                  <div 
                    onClick={() => {
                      let qList = QUIZ_QUESTIONS;
                      if (selectedCourseDetail.id === "bcs") {
                        qList = [...BANGLA_QUESTIONS, ...ENGLISH_QUESTIONS, ...MATH_QUESTIONS, ...SCIENCE_QUESTIONS];
                      } else if (selectedCourseDetail.id === "bank") {
                        qList = [...MATH_QUESTIONS, ...ENGLISH_QUESTIONS];
                      } else if (selectedCourseDetail.id === "primary") {
                        qList = [...BANGLA_QUESTIONS, ...MATH_QUESTIONS];
                      } else if (selectedCourseDetail.id === "ntrca") {
                        qList = [...BANGLA_QUESTIONS, ...ENGLISH_QUESTIONS];
                      } else if (selectedCourseDetail.id === "psc") {
                        qList = QUIZ_QUESTIONS;
                      } else if (selectedCourseDetail.id === "bangla_english") {
                        qList = [...BANGLA_QUESTIONS, ...ENGLISH_QUESTIONS];
                      } else if (selectedCourseDetail.id === "math_science") {
                        qList = [...MATH_QUESTIONS, ...SCIENCE_QUESTIONS];
                      } else {
                        qList = [...BANGLA_QUESTIONS, ...ENGLISH_QUESTIONS, ...MATH_QUESTIONS, ...SCIENCE_QUESTIONS];
                      }
                      startQuizFlow(`${selectedCourseDetail.title} - Weekly Model Test`, "সাপ্তাহিক স্পেশাল মডেল টেস্ট", qList);
                      if (soundEnabled) quizAudio.playClick();
                    }}
                    className="bg-white border border-slate-100 hover:border-[#FF6A00]/40 rounded-[2rem] p-4.5 flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                        <ClipboardList className="w-5 h-5 stroke-[2.2px]" />
                      </div>
                      <div className="text-left space-y-0.5">
                        <h5 className="text-xs font-black text-slate-800 leading-snug">Weekly Model Test</h5>
                        <p className="text-[10px] font-bold text-slate-400">সাপ্তাহিক স্পেশাল সিলেবাস মক</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl text-slate-400">
                      <Play className="w-3.5 h-3.5 fill-current text-indigo-500" />
                    </div>
                  </div>

                  {/* Test 2: Daily Model Test */}
                  <div 
                    onClick={() => {
                      let qList = QUIZ_QUESTIONS;
                      if (selectedCourseDetail.id === "bcs") {
                        qList = QUIZ_QUESTIONS;
                      } else if (selectedCourseDetail.id === "bank") {
                        qList = MATH_QUESTIONS;
                      } else if (selectedCourseDetail.id === "primary") {
                        qList = SCIENCE_QUESTIONS;
                      } else if (selectedCourseDetail.id === "ntrca") {
                        qList = [...MATH_QUESTIONS, ...SCIENCE_QUESTIONS];
                      } else if (selectedCourseDetail.id === "psc") {
                        qList = BANGLA_QUESTIONS;
                      } else if (selectedCourseDetail.id === "bangla_english") {
                        qList = BANGLA_QUESTIONS;
                      } else if (selectedCourseDetail.id === "math_science") {
                        qList = MATH_QUESTIONS;
                      } else {
                        qList = QUIZ_QUESTIONS;
                      }
                      startQuizFlow(`${selectedCourseDetail.title} - Daily Model Test`, "দৈনিক স্পেশাল কুইজ ও সমাধান", qList);
                      if (soundEnabled) quizAudio.playClick();
                    }}
                    className="bg-white border border-slate-100 hover:border-[#FF6A00]/40 rounded-[2rem] p-4.5 flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 stroke-[2.2px]" />
                      </div>
                      <div className="text-left space-y-0.5">
                        <h5 className="text-xs font-black text-slate-800 leading-snug">Daily Model Test</h5>
                        <p className="text-[10px] font-bold text-slate-400">দৈনিক প্রস্তুতিমূলক স্পিড কুইজ</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl text-slate-400">
                      <Play className="w-3.5 h-3.5 fill-current text-rose-500" />
                    </div>
                  </div>

                  {/* Special Option: BCS Health Course (Only for BCS) */}
                  {selectedCourseDetail.id === "bcs" && (
                    <div 
                      onClick={() => {
                        startQuizFlow("BCS Health Course", "স্বাস্থ্য ক্যাডার ও চিকিৎসা বিজ্ঞান স্পেশাল মক", SCIENCE_QUESTIONS);
                        if (soundEnabled) quizAudio.playClick();
                      }}
                      className="bg-gradient-to-r from-teal-500 to-emerald-500 border-0 rounded-[2rem] p-5 flex items-center justify-between text-white shadow-md shadow-emerald-500/10 hover:shadow-lg cursor-pointer transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center shrink-0 text-white">
                          <Award className="w-5 h-5 stroke-[2.2px]" />
                        </div>
                        <div className="text-left space-y-0.5">
                          <h5 className="text-xs font-black leading-snug">BCS Health Course</h5>
                          <p className="text-[10px] font-bold text-teal-100">স্বাস্থ্য ক্যাডার ও চিকিৎসা বিজ্ঞান স্পেশাল মক</p>
                        </div>
                      </div>
                      <div className="bg-white/20 p-2 rounded-xl text-white">
                        <ChevronRight className="w-4 h-4 stroke-[3px]" />
                      </div>
                    </div>
                  )}

                </div>
              </div>

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
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">3 Questions • Equations & Geometry</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => startQuizFlow("Math practice #12", "Equations & Geometry", MATH_QUESTIONS)}
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
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">6 Questions • Grammar & authors</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => startQuizFlow("Bangla & English Mastery", "Grammar & Authors", [...BANGLA_QUESTIONS, ...ENGLISH_QUESTIONS])}
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
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">5 Questions • Anatomy & Environment</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => startQuizFlow("General Science Mock", "Anatomy & Climate", SCIENCE_QUESTIONS)}
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
                  {isLoggedIn ? "M" : "G"}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-black text-slate-800 leading-none">{isLoggedIn ? "mobileseba247" : "Guest User"}</h4>
                  <p className="text-[11px] text-slate-400 font-medium">{isLoggedIn ? "mobileseba247@gmail.com" : "guest@jobmaster.com"}</p>
                  <span className={`inline-block text-[8px] font-bold px-2 py-0.5 rounded uppercase mt-1 ${
                    isLoggedIn ? "bg-[#EBF7EE] text-green-600" : "bg-slate-100 text-slate-500"
                  }`}>
                    {isLoggedIn ? "Premium Subscriber" : "Guest Account"}
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

        {/* Backdrop overlay for Drawer */}
        <div 
          onClick={() => {
            setDrawerOpen(false);
            if (soundEnabled) quizAudio.playClick();
          }}
          className={`absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-40 transition-all duration-300 ease-in-out ${
            drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          id="drawer-backdrop"
        />

        {/* Drawer Panel */}
        <div 
          className={`absolute top-0 left-0 bottom-0 h-full bg-white shadow-2xl z-50 transition-all duration-300 ease-in-out transform ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          } w-[280px] flex flex-col border-r border-slate-100`}
          id="app-drawer-panel"
        >
          {/* Drawer Header */}
          <div className="bg-gradient-to-r from-[#FF6A00] to-[#FF4E00] p-5 pt-8 text-white flex flex-col gap-3 relative shrink-0">
            <button 
              onClick={() => {
                setDrawerOpen(false);
                if (soundEnabled) quizAudio.playClick();
              }}
              className="absolute top-4 right-4 p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
              id="drawer-close-button"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Avatar inside Drawer */}
            <div className="flex items-center gap-3 mt-2">
              <div className="w-12 h-12 rounded-full bg-white text-[#FF4E00] font-black text-xl flex items-center justify-center shadow-inner">
                {isLoggedIn ? "M" : "G"}
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-tight leading-tight">
                  {isLoggedIn ? "mobileseba247" : "Guest User"}
                </span>
                <span className="text-[10px] text-white/80 font-semibold">
                  {isLoggedIn ? "mobileseba247@gmail.com" : "guest@jobmaster.com"}
                </span>
                <span className={`inline-block text-[8px] font-black w-max px-1.5 py-0.5 rounded uppercase mt-1 ${
                  isLoggedIn ? "bg-white/25 text-white" : "bg-black/20 text-white/70"
                }`}>
                  {isLoggedIn ? "Premium Member" : "Guest Account"}
                </span>
              </div>
            </div>
          </div>

          {/* Drawer Menu Items */}
          <div className="flex-1 overflow-y-auto py-3 px-3.5 space-y-1 bg-slate-50/50">
            {/* 0. Home */}
            <button
              onClick={() => {
                setCurrentScreen("home");
                setDrawerOpen(false);
                if (soundEnabled) quizAudio.playClick();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                currentScreen === "home" 
                  ? "bg-orange-50 text-[#FF6A00] font-bold" 
                  : "text-slate-600 hover:bg-slate-100 font-semibold"
              } text-xs`}
              id="drawer-item-home"
            >
              <HomeIcon className={`w-4 h-4 ${currentScreen === "home" ? "text-[#FF6A00]" : "text-slate-400"}`} />
              <span>Home</span>
            </button>

            {/* 1. Profile */}
            <button
              onClick={() => {
                setCurrentScreen("profile");
                setDrawerOpen(false);
                if (soundEnabled) quizAudio.playClick();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                currentScreen === "profile" 
                  ? "bg-orange-50 text-[#FF6A00] font-bold" 
                  : "text-slate-600 hover:bg-slate-100 font-semibold"
              } text-xs`}
              id="drawer-item-profile"
            >
              <CircleUser className={`w-4 h-4 ${currentScreen === "profile" ? "text-[#FF6A00]" : "text-slate-400"}`} />
              <span>Profile</span>
            </button>

            {/* 2. Package */}
            <button
              onClick={() => {
                setActiveDrawerModal("package");
                setDrawerOpen(false);
                if (soundEnabled) quizAudio.playClick();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-slate-600 hover:bg-slate-100 font-semibold text-xs"
              id="drawer-item-package"
            >
              <Package className="w-4 h-4 text-slate-400" />
              <span>Package</span>
            </button>

            {/* 3. Book Store */}
            <button
              onClick={() => {
                setActiveDrawerModal("bookstore");
                setDrawerOpen(false);
                if (soundEnabled) quizAudio.playClick();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-slate-600 hover:bg-slate-100 font-semibold text-xs"
              id="drawer-item-bookstore"
            >
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>Book Store</span>
            </button>

            {/* 3.1 Install App */}
            <button
              onClick={() => {
                localStorage.removeItem("jobmaster_pwa_dismissed");
                window.location.reload();
                setDrawerOpen(false);
                if (soundEnabled) quizAudio.playClick();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/60 text-[#FF6A00] font-extrabold text-xs shadow-sm hover:shadow"
              id="drawer-item-install-app"
            >
              <div className="flex items-center gap-3">
                <Download className="w-4 h-4 text-[#FF6A00]" />
                <span>Install Job Master App</span>
              </div>
              <span className="text-[9px] bg-[#FF6A00] text-white px-2 py-0.5 rounded-md font-black uppercase">Install</span>
            </button>

            {/* 4. Language */}
            <button
              onClick={() => {
                setActiveDrawerModal("language");
                setDrawerOpen(false);
                if (soundEnabled) quizAudio.playClick();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-slate-600 hover:bg-slate-100 font-semibold text-xs"
              id="drawer-item-language"
            >
              <Globe className="w-4 h-4 text-slate-400" />
              <span>Language ({selectedLanguage === "BN" ? "বাংলা" : "English"})</span>
            </button>

            {/* 5. Settings */}
            <button
              onClick={() => {
                setActiveDrawerModal("settings");
                setDrawerOpen(false);
                if (soundEnabled) quizAudio.playClick();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-slate-600 hover:bg-slate-100 font-semibold text-xs"
              id="drawer-item-settings"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </button>

            {/* 6. Our Apps */}
            <button
              onClick={() => {
                setActiveDrawerModal("ourapps");
                setDrawerOpen(false);
                if (soundEnabled) quizAudio.playClick();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-slate-600 hover:bg-slate-100 font-semibold text-xs"
              id="drawer-item-ourapps"
            >
              <Sparkles className="w-4 h-4 text-slate-400" />
              <span>Our Apps</span>
            </button>

            {/* 7. Contact Us */}
            <button
              onClick={() => {
                setActiveDrawerModal("contact");
                setDrawerOpen(false);
                if (soundEnabled) quizAudio.playClick();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-slate-600 hover:bg-slate-100 font-semibold text-xs"
              id="drawer-item-contact"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Contact Us</span>
            </button>

            {/* 9. Logout/LogIn */}
            <button
              onClick={() => {
                const nextState = !isLoggedIn;
                setIsLoggedIn(nextState);
                setDrawerOpen(false);
                if (soundEnabled) {
                  if (nextState) quizAudio.playSuccess();
                  else quizAudio.playError();
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all font-semibold text-xs mt-1 border-t border-slate-100/50 pt-2.5 ${
                isLoggedIn ? "text-red-600 hover:bg-red-50" : "text-[#FF6A00] hover:bg-orange-50"
              }`}
              id="drawer-item-auth"
            >
              {isLoggedIn ? (
                <>
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>Logout</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-[#FF6A00]" />
                  <span>LogIn</span>
                </>
              )}
            </button>
          </div>

          {/* Drawer Footer copyright */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0 text-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Job Master App v2.4</span>
            <span className="text-[8px] text-slate-400 mt-0.5 block font-medium">All Rights Reserved © 2026</span>
          </div>
        </div>

        {/* Modal views for Drawer Menus */}
        {activeDrawerModal !== "none" && (
          <div 
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in"
            id="drawer-modal-overlay"
          >
            <div 
              className="w-full max-w-[320px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[80%] animate-scale-up"
              id="drawer-modal-container"
            >
              {/* Modal Header */}
              <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-[#1E293B] uppercase tracking-wider">
                  {activeDrawerModal === "package" && "Premium Packages"}
                  {activeDrawerModal === "bookstore" && "Job Master Book Store"}
                  {activeDrawerModal === "language" && "Select Language"}
                  {activeDrawerModal === "settings" && "Application Settings"}
                  {activeDrawerModal === "ourapps" && "More Apps by Us"}
                  {activeDrawerModal === "contact" && "Contact Support"}
                </span>
                <button 
                  onClick={() => {
                    setActiveDrawerModal("none");
                    if (soundEnabled) quizAudio.playClick();
                  }}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 transition-all active:scale-95"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 overflow-y-auto space-y-3.5">
                
                {/* 1. PACKAGE MODAL */}
                {activeDrawerModal === "package" && (
                  <div className="space-y-2.5">
                    <p className="text-slate-500 text-[10px] leading-relaxed font-semibold">
                      Upgrade to unlock advanced model questions, custom schedules, and professional analytical tools.
                    </p>
                    
                    {/* Package 1 */}
                    <div className="border border-slate-100 bg-slate-50/50 rounded-xl p-2.5 flex items-center justify-between">
                      <div>
                        <h4 className="text-[11px] font-black text-slate-800">Basic Starter</h4>
                        <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Free Access • Standard MCQs</p>
                      </div>
                      <span className="text-[9px] font-black text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full uppercase">Active</span>
                    </div>

                    {/* Package 2 */}
                    <div className="border-2 border-orange-500 bg-orange-50/10 rounded-xl p-2.5 flex items-center justify-between relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-orange-500 text-white text-[7px] font-extrabold px-1.5 py-0.5 rounded-bl-lg uppercase tracking-wider">Pop</div>
                      <div>
                        <h4 className="text-[11px] font-black text-slate-800">BCS Premium Pro</h4>
                        <p className="text-[9px] text-orange-600 font-bold mt-0.5">৳৫০০ / Year • Full Exam Sync</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          alert("Thank you for choosing BCS Premium Pro! Subscriptions are simulated in the preview environment.");
                          setActiveDrawerModal("none");
                        }}
                        className="text-[9px] font-black text-white bg-orange-500 hover:bg-orange-600 px-2.5 py-1 rounded-lg shadow-sm transition-all active:scale-95"
                      >
                        Buy
                      </button>
                    </div>

                    {/* Package 3 */}
                    <div className="border border-slate-100 bg-slate-50/50 rounded-xl p-2.5 flex items-center justify-between">
                      <div>
                        <h4 className="text-[11px] font-black text-slate-800">Primary Teacher Special</h4>
                        <p className="text-[9px] text-slate-500 font-bold mt-0.5">৳৩০০ / Year • Papers Boost</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          alert("Thank you for choosing Primary Teacher Special! Subscriptions are simulated in the preview.");
                          setActiveDrawerModal("none");
                        }}
                        className="text-[9px] font-black text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-all active:scale-95"
                      >
                        Upgrade
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. BOOK STORE MODAL */}
                {activeDrawerModal === "bookstore" && (
                  <div className="space-y-2.5">
                    <p className="text-slate-500 text-[10px] leading-relaxed font-semibold">
                      Buy official physical and digital guide books curated by experts. Free home delivery across Bangladesh!
                    </p>

                    {/* Book 1 */}
                    <div className="flex gap-2.5 items-center border border-slate-100 rounded-xl p-2 bg-slate-50/20">
                      <div className="w-10 h-13 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white shrink-0 shadow">
                        <BookOpen className="w-4 h-4 text-white/90" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-black text-slate-800 truncate">BCS MCQ Booster 2026</h4>
                        <p className="text-[8px] text-slate-400 font-bold mt-0.5">Author: Job Master Panel</p>
                        <p className="text-[11px] font-black text-orange-500 mt-0.5">৳২৫০</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => alert("Book order placed successfully!")}
                        className="text-[8px] font-black text-white bg-orange-500 px-2 py-1 rounded-md active:scale-95"
                      >
                        Order
                      </button>
                    </div>

                    {/* Book 2 */}
                    <div className="flex gap-2.5 items-center border border-slate-100 rounded-xl p-2 bg-slate-50/20">
                      <div className="w-10 h-13 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center text-white shrink-0 shadow">
                        <BookOpen className="w-4 h-4 text-white/90" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-black text-slate-800 truncate">Primary Teacher Guide</h4>
                        <p className="text-[8px] text-slate-400 font-bold mt-0.5">With last 10-year papers</p>
                        <p className="text-[11px] font-black text-orange-500 mt-0.5">৳১৮০</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => alert("Book order placed successfully!")}
                        className="text-[8px] font-black text-white bg-orange-500 px-2 py-1 rounded-md active:scale-95"
                      >
                        Order
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. LANGUAGE MODAL */}
                {activeDrawerModal === "language" && (
                  <div className="space-y-2">
                    <p className="text-slate-500 text-[10px] leading-relaxed font-semibold">
                      Choose your default system language for standard displays and navigation headers.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLanguage("BN");
                        setActiveDrawerModal("none");
                        if (soundEnabled) quizAudio.playSuccess();
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between font-bold text-xs ${
                        selectedLanguage === "BN" 
                          ? "border-[#FF6A00] bg-orange-50/10 text-[#FF6A00]" 
                          : "border-slate-100 bg-slate-50/50 text-slate-700"
                      }`}
                    >
                      <span>বাংলা (Bangla)</span>
                      {selectedLanguage === "BN" && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLanguage("EN");
                        setActiveDrawerModal("none");
                        if (soundEnabled) quizAudio.playSuccess();
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between font-bold text-xs ${
                        selectedLanguage === "EN" 
                          ? "border-[#FF6A00] bg-orange-50/10 text-[#FF6A00]" 
                          : "border-slate-100 bg-slate-50/50 text-slate-700"
                      }`}
                    >
                      <span>English (ইংরেজি)</span>
                      {selectedLanguage === "EN" && <Check className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}

                {/* 4. SETTINGS MODAL */}
                {activeDrawerModal === "settings" && (
                  <div className="space-y-2.5">
                    <p className="text-slate-500 text-[10px] leading-relaxed font-semibold">
                      Manage sounds, mock limits, and general application preferences easily.
                    </p>

                    {/* Sound Effects Toggle */}
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-orange-500" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
                        <span className="text-[11px] font-bold text-slate-700">Sound Effects</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setSoundEnabled(!soundEnabled);
                          if (typeof window !== "undefined") {
                            localStorage.setItem("job_master_sound", String(!soundEnabled));
                          }
                        }}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors ${soundEnabled ? "bg-[#FF6A00]" : "bg-slate-300"}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${soundEnabled ? "translate-x-4" : "translate-x-0"}`} />
                      </button>
                    </div>

                    {/* Daily Reminders Toggle */}
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Bell className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-[11px] font-bold text-slate-700">Daily Notifications</span>
                      </div>
                      <span className="text-[9px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-black">ON</span>
                    </div>

                    {/* Clear storage cache */}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Are you sure you want to clear your study data cache? This resets your study routine & test logs.")) {
                          localStorage.clear();
                          window.location.reload();
                        }
                      }}
                      className="w-full text-center bg-red-50 hover:bg-red-100 text-red-600 font-extrabold text-[10px] py-2 rounded-xl transition-colors mt-2"
                    >
                      Reset Local Storage Cache
                    </button>
                  </div>
                )}

                {/* 5. OUR APPS MODAL */}
                {activeDrawerModal === "ourapps" && (
                  <div className="space-y-2.5">
                    <p className="text-slate-500 text-[10px] leading-relaxed font-semibold">
                      Check out other popular educational platforms developed by our team:
                    </p>

                    <div className="p-2 border border-slate-100 rounded-xl bg-slate-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center text-white font-black text-xs">G</div>
                        <div>
                          <h4 className="text-[10px] font-black text-slate-800">GK Master Pro</h4>
                          <p className="text-[8px] text-slate-400 font-bold">General Knowledge Daily</p>
                        </div>
                      </div>
                      <span className="text-[8px] font-black text-[#FF6A00] bg-orange-50 px-1.5 py-0.5 rounded-full">Installed</span>
                    </div>

                    <div className="p-2 border border-slate-100 rounded-xl bg-slate-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-black text-xs">V</div>
                        <div>
                          <h4 className="text-[10px] font-black text-slate-800">Vocabulary builder</h4>
                          <p className="text-[8px] text-slate-400 font-bold">Bangla to English Cards</p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => alert("Redirecting to app store placeholder")}
                        className="text-[8px] font-black text-white bg-orange-500 px-2 py-1 rounded-md active:scale-95"
                      >
                        Install
                      </button>
                    </div>
                  </div>
                )}

                {/* 6. CONTACT US MODAL */}
                {activeDrawerModal === "contact" && (
                  <div className="space-y-2.5 text-[11px] text-slate-700">
                    <p className="text-slate-500 text-[10px] leading-relaxed font-semibold">
                      Need help? Get in touch with our team directly. We are active 24/7!
                    </p>

                    <div className="space-y-1.5 font-bold text-slate-700">
                      <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-slate-400">Support Email</span>
                        <a href="mailto:support@jobmaster.com" className="text-orange-600 hover:underline">support@jobmaster.com</a>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-slate-400">WhatsApp Hotline</span>
                        <span className="text-orange-600">+880 1712-345678</span>
                      </div>
                    </div>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        alert("Message sent successfully! Our support agents will contact you shortly.");
                        setActiveDrawerModal("none");
                      }}
                      className="space-y-1.5 pt-2 border-t border-slate-100"
                    >
                      <input 
                        type="text" 
                        placeholder="Your Query / Issue" 
                        required 
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 text-[10px] font-semibold"
                      />
                      <button 
                        type="submit"
                        className="w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-black text-[10px] py-1.5 rounded-lg shadow transition-all active:scale-95"
                      >
                        Send Message
                      </button>
                    </form>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* Android/iOS App-Style Bottom Navigation Bar (Persistent across all screens including Quiz) */}
        <nav 
          className="shrink-0 w-full bg-white border-t border-slate-100 flex justify-around items-center pt-2.5 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-50 transition-all duration-300 relative"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 10px)" }}
          id="mobile-bottom-nav"
        >
          {/* Home Tab */}
          <button
            onClick={() => {
              setCurrentScreen("home");
              if (soundEnabled) quizAudio.playClick();
            }}
            className="flex flex-col items-center justify-center flex-1 py-1 active:scale-95 transition-transform"
            id="bottom-nav-home"
          >
            <HomeIcon 
              className={`w-5 h-5 transition-colors ${
                currentScreen === "home" ? "text-[#FF6A00]" : "text-slate-400"
              }`} 
            />
            <span 
              className={`text-[9px] mt-1 font-bold transition-colors ${
                currentScreen === "home" ? "text-[#FF6A00]" : "text-slate-500"
              }`}
            >
              Home
            </span>
          </button>

          {/* Results Tab */}
          <button
            onClick={() => {
              setCurrentScreen("tests");
              if (soundEnabled) quizAudio.playClick();
            }}
            className="flex flex-col items-center justify-center flex-1 py-1 active:scale-95 transition-transform"
            id="bottom-nav-results"
          >
            <ClipboardList 
              className={`w-5 h-5 transition-colors ${
                currentScreen === "tests" ? "text-[#FF6A00]" : "text-slate-400"
              }`} 
            />
            <span 
              className={`text-[9px] mt-1 font-bold transition-colors ${
                currentScreen === "tests" ? "text-[#FF6A00]" : "text-slate-500"
              }`}
            >
              Result
            </span>
          </button>

          {/* Profile Tab */}
          <button
            onClick={() => {
              setCurrentScreen("profile");
              if (soundEnabled) quizAudio.playClick();
            }}
            className="flex flex-col items-center justify-center flex-1 py-1 active:scale-95 transition-transform"
            id="bottom-nav-profile"
          >
            <CircleUser 
              className={`w-5 h-5 transition-colors ${
                currentScreen === "profile" ? "text-[#FF6A00]" : "text-slate-400"
              }`} 
            />
            <span 
              className={`text-[9px] mt-1 font-bold transition-colors ${
                currentScreen === "profile" ? "text-[#FF6A00]" : "text-slate-500"
              }`}
            >
              Profile
            </span>
          </button>

          {/* Others/Menu Tab */}
          <button
            onClick={() => {
              setDrawerOpen(!drawerOpen);
              if (soundEnabled) quizAudio.playClick();
            }}
            className="flex flex-col items-center justify-center flex-1 py-1 active:scale-95 transition-transform"
            id="bottom-nav-others"
          >
            <Menu 
              className={`w-5 h-5 transition-colors ${
                drawerOpen ? "text-[#FF6A00]" : "text-slate-400"
              }`} 
            />
            <span 
              className={`text-[9px] mt-1 font-bold transition-colors ${
                drawerOpen ? "text-[#FF6A00]" : "text-slate-500"
              }`}
            >
              Others
            </span>
          </button>
        </nav>

      </div>

    </div>
    </PwaProvider>
  );
}
