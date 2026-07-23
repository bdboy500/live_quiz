"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  BookOpen, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  LogOut, 
  LogIn, 
  Award, 
  Check, 
  X, 
  HelpCircle, 
  Megaphone,
  Bell,
  ShieldCheck,
  AlertOctagon,
  Eye,
  Settings,
  Database,
  Lock,
  Compass,
  FileText,
  Pencil,
  Filter,
  Sparkles,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { QUIZ_QUESTIONS, Question } from "../../data";
import { getSupabase } from "../../lib/supabase";

// Interfaces for local state types
interface AdminUser {
  id: string;
  email: string;
  role: string;
  status: "Active" | "Banned";
}

interface AdminOffer {
  id: string;
  title: string;
  description: string;
  active: boolean;
}

export default function AdminPage() {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState("");
  const [loginError, setLoginError] = useState("");

  // Tab navigation states
  const [activeTab, setActiveTab] = useState<"questions" | "users" | "offers">("questions");

  // Notifications
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Predefined 14 Subjects required for Exam MCQ Hub
  const SUBJECTS = [
    "Bangla Literature",
    "Bangla Grammer",
    "English Literature",
    "English Grammer",
    "Bangladesh Affairs",
    "International Affairs",
    "Geography",
    "General Science",
    "Technology",
    "Mathematics (Arithmetic)",
    "Mathematics (Algebra )",
    "Mathematics (Geometry)",
    "Mental Ability",
    "Good Governance"
  ];

  // ==========================================
  // 1. QUESTIONS STATE & COMPONENT
  // ==========================================
  const [questions, setQuestions] = useState<any[]>([]);
  const [dbLoading, setDbLoading] = useState<boolean>(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Search, Subject Filter & Display Limit states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("All");
  const [displayLimit, setDisplayLimit] = useState<number>(10);

  // Add Question form states
  const [newSubjectName, setNewSubjectName] = useState<string>("Bangla Literature");
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newOptions, setNewOptions] = useState<string[]>(["", "", "", ""]);
  const [correctOptionIdx, setCorrectOptionIdx] = useState<number>(0);
  const [newExplanation, setNewExplanation] = useState("");

  // Edit Question modal state
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [editSubjectName, setEditSubjectName] = useState<string>("Bangla Literature");
  const [editQuestionText, setEditQuestionText] = useState("");
  const [editOptions, setEditOptions] = useState<string[]>(["", "", "", ""]);
  const [editCorrectOptionIdx, setEditCorrectOptionIdx] = useState<number>(0);
  const [editExplanation, setEditExplanation] = useState("");

  // ==========================================
  // 2. USERS STATE & COMPONENT
  // ==========================================
  const [users, setUsers] = useState<AdminUser[]>([
    { id: "u-101", email: "hassan.bcs@gmail.com", role: "Student", status: "Active" },
    { id: "u-102", email: "tasnim_sheikh@yahoo.com", role: "Student", status: "Active" },
    { id: "u-103", email: "kamrul.dev@outlook.com", role: "Moderator", status: "Active" },
    { id: "u-104", email: "spambot99@gmail.com", role: "Student", status: "Banned" },
    { id: "u-105", email: "rahima_begum@gmail.com", role: "Student", status: "Active" },
  ]);

  // ==========================================
  // 3. OFFERS STATE & COMPONENT
  // ==========================================
  const [offers, setOffers] = useState<AdminOffer[]>([
    { 
      id: "o-1", 
      title: "🔥 বিসিএস স্পেশাল মাস্টারক্লাস - ৫০% ছাড়!", 
      description: "কুপন কোড BCS50 ব্যবহার করে আজই এনরোল করুন অর্ধেকেরও কম মূল্যে। অফারটি সীমিত সময়ের জন্য প্রযোজ্য।", 
      active: true 
    },
    { 
      id: "o-2", 
      title: "🚀 ফ্রি মেগা মক টেস্ট সপ্তাহ", 
      description: "সকল শিক্ষার্থীদের জন্য এই সপ্তাহের সবকয়টি স্পেশাল মডেল টেস্ট সম্পূর্ণ ফ্রি! এখনই প্র্যাকটিস শুরু করুন।", 
      active: true 
    },
    { 
      id: "o-3", 
      title: "📚 রেলওয়ে স্পেশাল স্পিড প্যাক বোনাস", 
      description: "রেলওয়ে রিক্রুটমেন্ট ইউনিভার্সাল প্যাকে অতিরিক্ত ২০টি স্পিড টেস্ট সেট একদম ফ্রিতে যোগ করা হয়েছে।", 
      active: false 
    }
  ]);
  const [newOfferTitle, setNewOfferTitle] = useState("");
  const [newOfferDesc, setNewOfferDesc] = useState("");
  const [newOfferActive, setNewOfferActive] = useState(true);

  // Load state and auth status from localStorage on mount
  useEffect(() => {
    // Check authentication
    const loggedIn = localStorage.getItem("job_master_admin_auth");
    if (loggedIn === "true") {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }

    // Initialize static data from local storage if available
    const cachedUsers = localStorage.getItem("job_master_admin_users");
    if (cachedUsers) setUsers(JSON.parse(cachedUsers));

    const cachedOffers = localStorage.getItem("job_master_admin_offers");
    if (cachedOffers) setOffers(JSON.parse(cachedOffers));

    // Fetch questions from Supabase
    loadQuestionsFromDb();
  }, []);

  // Sync users and offers updates
  const saveUsers = (updatedUsers: AdminUser[]) => {
    setUsers(updatedUsers);
    localStorage.setItem("job_master_admin_users", JSON.stringify(updatedUsers));
  };

  const saveOffers = (updatedOffers: AdminOffer[]) => {
    setOffers(updatedOffers);
    localStorage.setItem("job_master_admin_offers", JSON.stringify(updatedOffers));
  };

  // Helper to show brief toast notifications
  const triggerNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // -------------------------------------------------------------
  // SUPABASE ASYNC CRUD HANDLERS
  // -------------------------------------------------------------
  const loadQuestionsFromDb = async () => {
    try {
      setDbLoading(true);
      setDbError(null);
      const supabase = getSupabase();
      
      const { data, error } = await supabase
        .from("questions")
        .select("*");

      if (error) {
        // If table doesn't exist yet, we still allow proceeding but log warn
        console.warn("Could not load from 'questions' table. Fallback to mock state.", error);
        setDbError("Supabase 'questions' table not found or query failed.");
        
        // Initialize with original mock questions
        const cachedMock = localStorage.getItem("job_master_admin_questions");
        if (cachedMock) {
          setQuestions(JSON.parse(cachedMock));
        } else {
          setQuestions(QUIZ_QUESTIONS);
        }
      } else if (data) {
        // Robust in-memory sorting so we don't depend on database column named createdAt
        const sortedData = [...data].sort((a: any, b: any) => {
          const aTime = a.createdAt || a.created_at || a.id || 0;
          const bTime = b.createdAt || b.created_at || b.id || 0;
          if (typeof aTime === "number" && typeof bTime === "number") {
            return bTime - aTime;
          }
          return String(bTime).localeCompare(String(aTime));
        });
        
        setQuestions(sortedData);
        localStorage.setItem("job_master_admin_questions", JSON.stringify(sortedData));
      }
    } catch (err: any) {
      console.error("Error connecting to Supabase:", err);
      setDbError(err.message || "Unknown error connecting to Supabase");
    } finally {
      setDbLoading(false);
    }
  };

  // Handle Add Question to Supabase
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) {
      triggerNotification("error", "দয়া করে প্রশ্নের মূল টেক্সট লিখুন।");
      return;
    }
    
    // Check options
    if (newOptions.some(opt => !opt.trim())) {
      triggerNotification("error", "দয়া করে সবকয়টি অপশনের মান প্রদান করুন।");
      return;
    }

    try {
      setDbLoading(true);
      const supabase = getSupabase();

      const payload = {
        subjectName: newSubjectName,
        questionText: newQuestionText.trim(),
        options: [...newOptions],
        correctOptionIndex: correctOptionIdx,
        explanation: newExplanation.trim() || null
      };

      const { data, error } = await supabase
        .from("questions")
        .insert([payload])
        .select();

      if (error) {
        throw error;
      }

      triggerNotification("success", "নতুন প্রশ্ন সফলভাবে Supabase ডেটাবেজে যুক্ত করা হয়েছে!");
      
      // Reset form fields
      setNewQuestionText("");
      setNewOptions(["", "", "", ""]);
      setCorrectOptionIdx(0);
      setNewExplanation("");

      // Reload database list
      await loadQuestionsFromDb();
    } catch (err: any) {
      console.error("Error creating question in Supabase:", err);
      // Fallback local operation if database not synced yet
      console.log("Adding question to local mockup fallback...");
      const nextId = questions.length > 0 ? Math.max(...questions.map(q => Number(q.id) || 0)) + 1 : 1;
      const fallbackQuestion = {
        id: nextId,
        subjectName: newSubjectName,
        questionText: newQuestionText.trim(),
        options: [...newOptions],
        correctOptionIndex: correctOptionIdx,
        explanation: newExplanation.trim() || null
      };
      const updated = [fallbackQuestion, ...questions];
      setQuestions(updated);
      localStorage.setItem("job_master_admin_questions", JSON.stringify(updated));
      triggerNotification("success", `প্রশ্ন #${nextId} সফলভাবে লোকাল মেমোরিতে সেভ হয়েছে (লোকাল ফলব্যাক)!`);

      // Reset form fields
      setNewQuestionText("");
      setNewOptions(["", "", "", ""]);
      setCorrectOptionIdx(0);
      setNewExplanation("");
    } finally {
      setDbLoading(false);
    }
  };

  // Handle Edit click: populates modal state
  const handleEditClick = (q: any) => {
    setEditingQuestion(q);
    setEditSubjectName(q.subjectName || q.subject_name || "Bangla Literature");
    setEditQuestionText(q.questionText || q.question_text || q.question || "");
    
    let opts = ["", "", "", ""];
    const rawOpts = q.options || q.choices || q.answers || q.option_list;
    if (Array.isArray(rawOpts)) {
      opts = rawOpts.map(String);
    }
    setEditOptions(opts);

    const correctIdxVal = q.correctOptionIndex !== undefined ? q.correctOptionIndex : (q.correct_option_index !== undefined ? q.correct_option_index : (q.correctIndex !== undefined ? q.correctIndex : 0));
    setEditCorrectOptionIdx(Number(correctIdxVal));
    setEditExplanation(q.explanation || "");
  };

  // Handle Update Question on Supabase
  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    if (!editQuestionText.trim()) {
      triggerNotification("error", "দয়া করে প্রশ্নের মূল টেক্সট লিখুন।");
      return;
    }
    if (editOptions.some(opt => !opt.trim())) {
      triggerNotification("error", "দয়া করে সবকয়টি অপশনের মান প্রদান করুন।");
      return;
    }

    try {
      setDbLoading(true);
      const supabase = getSupabase();

      // Dynamically map payload properties to prevent sending non-existent columns to Supabase
      const payload: any = {};
      
      const setFieldIfInModel = (standardKey: string, fallbacks: string[], val: any) => {
        let matchedKey = standardKey;
        // Check editingQuestion keys to find which exact key name is defined in database schema
        for (const key of [standardKey, ...fallbacks]) {
          if (editingQuestion && key in editingQuestion) {
            matchedKey = key;
            break;
          }
        }
        payload[matchedKey] = val;
      };

      setFieldIfInModel("subjectName", ["subject_name"], editSubjectName);
      setFieldIfInModel("questionText", ["question_text", "question", "text"], editQuestionText.trim());
      setFieldIfInModel("options", ["choices", "answers", "option_list"], [...editOptions]);
      setFieldIfInModel("correctOptionIndex", ["correct_option_index", "correctIndex", "correct_index"], editCorrectOptionIdx);
      
      // Explanation field
      let explanationKey = "explanation";
      if (editingQuestion) {
        if ("explanation" in editingQuestion) explanationKey = "explanation";
        else if ("explanation_text" in editingQuestion) explanationKey = "explanation_text";
      }
      payload[explanationKey] = editExplanation.trim() || null;

      const { error } = await supabase
        .from("questions")
        .update(payload)
        .eq("id", editingQuestion.id);

      if (error) {
        throw error;
      }

      triggerNotification("success", "প্রশ্নটি সফলভাবে Supabase ডেটাবেজে আপডেট করা হয়েছে!");
      setEditingQuestion(null);
      await loadQuestionsFromDb();
    } catch (err: any) {
      console.error("Error updating question in Supabase:", err);
      // Fallback local update
      const updated = questions.map(q => {
        if (q.id === editingQuestion.id) {
          return {
            ...q,
            subjectName: editSubjectName,
            questionText: editQuestionText.trim(),
            options: [...editOptions],
            correctOptionIndex: editCorrectOptionIdx,
            explanation: editExplanation.trim() || null
          };
        }
        return q;
      });
      setQuestions(updated);
      localStorage.setItem("job_master_admin_questions", JSON.stringify(updated));
      triggerNotification("success", "প্রশ্নটি লোকাল মেমোরিতে সফলভাবে আপডেট হয়েছে!");
      setEditingQuestion(null);
    } finally {
      setDbLoading(false);
    }
  };

  // Handle Delete Question from Supabase
  const handleDeleteQuestion = async (id: string | number) => {
    try {
      setDbLoading(true);
      const supabase = getSupabase();

      const { error } = await supabase
        .from("questions")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      triggerNotification("success", "প্রশ্নটি সফলভাবে Supabase থেকে ডিলিট করা হয়েছে!");
      await loadQuestionsFromDb();
    } catch (err: any) {
      console.error("Error deleting question from Supabase:", err);
      // Fallback local delete
      const updated = questions.filter(q => q.id !== id);
      setQuestions(updated);
      localStorage.setItem("job_master_admin_questions", JSON.stringify(updated));
      triggerNotification("success", "প্রশ্নটি লোকাল মেমোরি থেকে মুছে ফেলা হয়েছে।");
    } finally {
      setDbLoading(false);
    }
  };

  // Seeding Database Helper
  const handleSeedDatabase = async () => {
    if (!confirm("আপনি কি নিশ্চিত যে আপনি ৩১টি প্রাক-সংজ্ঞায়িত ডেমো প্রশ্ন Supabase ডেটাবেজে সিড করতে চান?")) return;
    try {
      setDbLoading(true);
      const supabase = getSupabase();

      const payloads = QUIZ_QUESTIONS.map((q, idx) => {
        const subIndex = idx % SUBJECTS.length;
        return {
          subjectName: SUBJECTS[subIndex],
          questionText: q.question,
          options: q.options,
          correctOptionIndex: q.correctIndex,
          explanation: `এটি ${SUBJECTS[subIndex]} বিষয়ের একটি অত্যন্ত গুরুত্বপূর্ণ প্রশ্ন যা বিগত বছরগুলোতে প্রতিযোগিতামূলক পরীক্ষায় এসেছে।`
        };
      });

      const { error } = await supabase
        .from("questions")
        .insert(payloads);

      if (error) {
        throw error;
      }

      triggerNotification("success", "৩১টি ডেমো প্রশ্ন সফলভাবে Supabase-এ সিড করা হয়েছে!");
      await loadQuestionsFromDb();
    } catch (err: any) {
      console.error("Error seeding database:", err);
      triggerNotification("error", `সিড করতে ব্যর্থ: ${err.message}`);
    } finally {
      setDbLoading(false);
    }
  };

  // Handle Option Value Change
  const handleOptionChange = (index: number, val: string) => {
    const updated = [...newOptions];
    updated[index] = val;
    setNewOptions(updated);
  };

  // Handle Edit Option Value Change
  const handleEditOptionChange = (index: number, val: string) => {
    const updated = [...editOptions];
    updated[index] = val;
    setEditOptions(updated);
  };

  // Handle Login passcode submit
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "123456") {
      localStorage.setItem("job_master_admin_auth", "true");
      setIsAuthenticated(true);
      setLoginError("");
      triggerNotification("success", "স্বাগতম! আপনি সফলভাবে অ্যাডমিন প্যানেলে লগইন করেছেন।");
    } else {
      setLoginError("ভুল পাসকোড! দয়া করে সঠিক কোডটি দিন (Demo: 123456)।");
      triggerNotification("error", "লগইন ব্যর্থ হয়েছে!");
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("job_master_admin_auth");
    setIsAuthenticated(false);
    setPasscode("");
    triggerNotification("success", "সফলভাবে লগআউট করা হয়েছে।");
  };

  // Handle User Status Change (Ban/Unban toggle)
  const toggleUserStatus = (userId: string) => {
    const updated = users.map(user => {
      if (user.id === userId) {
        const nextStatus = user.status === "Active" ? "Banned" : "Active";
        triggerNotification(
          "success", 
          `ইউজার ${user.email} কে ${nextStatus === "Active" ? "সক্রিয়" : "নিষিদ্ধ"} করা হয়েছে।`
        );
        return { ...user, status: nextStatus as "Active" | "Banned" };
      }
      return user;
    });
    saveUsers(updated);
  };

  // Handle Add Offer Banner
  const handleAddOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfferTitle.trim() || !newOfferDesc.trim()) {
      triggerNotification("error", "অফারের শিরোনাম এবং বিবরণ উভয়ই প্রদান করুন।");
      return;
    }

    const newOffer: AdminOffer = {
      id: `o-${Date.now()}`,
      title: newOfferTitle.trim(),
      description: newOfferDesc.trim(),
      active: newOfferActive
    };

    const updated = [newOffer, ...offers];
    saveOffers(updated);

    // Reset Form
    setNewOfferTitle("");
    setNewOfferDesc("");
    setNewOfferActive(true);
    triggerNotification("success", "নতুন অফার ব্যানারটি সফলভাবে তৈরি করা হয়েছে!");
  };

  // Toggle Offer Active State
  const toggleOfferActive = (offerId: string) => {
    const updated = offers.map(offer => {
      if (offer.id === offerId) {
        const nextActive = !offer.active;
        triggerNotification(
          "success", 
          `ব্যানার "${offer.title.slice(0, 20)}..." ${nextActive ? "চালু" : "বন্ধ"} করা হয়েছে।`
        );
        return { ...offer, active: nextActive };
      }
      return offer;
    });
    saveOffers(updated);
  };

  // Loading indicator for mounting hook consistency
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-slate-500">লোডিং হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</p>
      </div>
    );
  }

  // ==========================================
  // RENDER: LOGIN COMPONENT
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1e293b] to-slate-950 flex flex-col items-center justify-center p-4 font-sans selection:bg-[#FF6A00] selection:text-white">
        
        {/* Toast Notification */}
        {notification && (
          <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border text-xs font-bold transition-all animate-bounce ${
            notification.type === "success" 
              ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}>
            {notification.type === "success" ? <Check className="w-4 h-4 shrink-0 text-emerald-600" /> : <X className="w-4 h-4 shrink-0 text-rose-600" />}
            {notification.message}
          </div>
        )}

        <div className="w-full max-w-md bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6A00] opacity-5 rounded-full translate-x-12 -translate-y-12"></div>
          
          <div className="text-center space-y-2">
            <div className="inline-flex w-14 h-14 bg-orange-50 text-[#FF6A00] rounded-2xl items-center justify-center shadow-inner">
              <ShieldCheck className="w-8 h-8 stroke-[2]" />
            </div>
            
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              অ্যাডমিন <span className="text-[#FF6A00]">প্যানেল লগইন</span>
            </h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Job Master MCQ Hub Admin Control
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 block pl-1">
                পাসকোড (Passcode)
              </label>
              <div className="relative">
                <input 
                  type="password"
                  placeholder="৬ ডিজিটের কোডটি দিন..."
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent transition-all font-mono tracking-widest text-center"
                  required
                />
                <div className="absolute left-3.5 top-3.5 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 pl-1 font-semibold">
                ডিপ্লয়মেন্ট বাইপাস ডেমো কোড: <span className="text-[#FF6A00] font-mono font-bold">123456</span>
              </p>
            </div>

            {loginError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-2xl p-3 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#FF6A00] hover:bg-orange-600 active:scale-95 text-white font-black py-3.5 rounded-2xl text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              লগইন করুন (ADMIN ACCESS)
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400">
            <Link href="/" className="flex items-center gap-1 hover:text-[#FF6A00] transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> মেইন সাইটে ফিরুন
            </Link>
            <span>v1.0.0 Stable</span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: DASHBOARD COMPONENT
  // ==========================================
  return (
    <div className="h-screen h-dvh w-full bg-slate-50/50 flex flex-col font-sans selection:bg-[#FF6A00] selection:text-white overflow-hidden">
      


      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border text-xs font-bold transition-all animate-bounce ${
          notification.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-rose-50 border-rose-200 text-rose-800"
        }`}>
          {notification.type === "success" ? <Check className="w-4 h-4 shrink-0 text-emerald-600" /> : <X className="w-4 h-4 shrink-0 text-rose-600" />}
          {notification.message}
        </div>
      )}

      {/* Header Container */}
      <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex flex-row justify-between items-center shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <Link 
            href="/" 
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-700 transition-all active:scale-95"
            title="মেইন সাইটে যান"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2px]" />
          </Link>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black tracking-[0.1em] text-[#FF6A00] bg-orange-50 px-2 py-0.5 rounded uppercase">
                ADMIN HUB
              </span>
              <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                ONLINE
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-black text-slate-800 tracking-tight flex items-center gap-1.5">
              Job <span className="text-[#FF6A00]">Master Panel</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* User profile identifier */}
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-black text-slate-800">Super Admin</span>
            <span className="text-[10px] font-bold text-slate-400">mobileseba247@gmail.com</span>
          </div>

          <button
            onClick={handleLogout}
            className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 sm:px-4.5 sm:py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 active:scale-95 transition-all border border-rose-100/50 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">লগআউট (Logout)</span>
          </button>
        </div>
      </header>

      {/* Main Body with Sidebar & Content */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
        
        {/* Sidebar Left / Tabs Header on Mobile */}
        <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-100 p-4 shrink-0 flex flex-row md:flex-col justify-between md:justify-start gap-2 overflow-x-auto md:overflow-y-auto">
          
          <div className="w-full flex flex-row md:flex-col gap-1.5">
            {/* Nav Title Desktop */}
            <h3 className="hidden md:block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2.5 py-2">
              ম্যানেজমেন্ট ড্যাশবোর্ড
            </h3>

            {/* Tab Button 1: Questions */}
            <button
              onClick={() => setActiveTab("questions")}
              className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 px-3 py-2.5 rounded-xl text-xs font-black transition-all text-center md:text-left ${
                activeTab === "questions"
                  ? "bg-orange-50 text-[#FF6A00]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>প্রশ্ন ব্যাংক ({questions.length})</span>
            </button>

            {/* Tab Button 2: Users */}
            <button
              onClick={() => setActiveTab("users")}
              className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 px-3 py-2.5 rounded-xl text-xs font-black transition-all text-center md:text-left ${
                activeTab === "users"
                  ? "bg-orange-50 text-[#FF6A00]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>ইউজার লিস্ট ({users.length})</span>
            </button>

            {/* Tab Button 3: Offers */}
            <button
              onClick={() => setActiveTab("offers")}
              className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 px-3 py-2.5 rounded-xl text-xs font-black transition-all text-center md:text-left ${
                activeTab === "offers"
                  ? "bg-orange-50 text-[#FF6A00]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>ব্যানার ও অফার ({offers.length})</span>
            </button>
          </div>

          {/* Infrastructure status - desktop footer */}
          <div className="hidden md:block mt-auto p-3.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] font-black text-slate-600 uppercase">Supabase Status</span>
            </div>
            <p className="text-[9px] text-slate-400 font-bold leading-normal">
              Schema triggers are optimized. All mutation events log in standard JSON arrays.
            </p>
          </div>
        </aside>

        {/* Content Panel Right */}
        <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6 touch-pan-y">
          
          {/* 1. Summary Cards Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            {/* Stat Box 1: Questions */}
            <div className="bg-white border border-slate-100 rounded-3xl p-4 sm:p-5 shadow-sm flex items-center gap-3.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#FF6A00] opacity-5 rounded-full translate-x-4 -translate-y-4"></div>
              <div className="w-10 h-10 bg-orange-50 text-[#FF6A00] rounded-2xl flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5 stroke-[2.2px]" />
              </div>
              <div className="space-y-0.5 text-left">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">মোট প্রশ্ন সংখ্যা</span>
                <span className="text-base sm:text-lg font-black text-slate-800 leading-none">{questions.length} টি</span>
              </div>
            </div>

            {/* Stat Box 2: Total Users */}
            <div className="bg-white border border-slate-100 rounded-3xl p-4 sm:p-5 shadow-sm flex items-center gap-3.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600 opacity-5 rounded-full translate-x-4 -translate-y-4"></div>
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 stroke-[2.2px]" />
              </div>
              <div className="space-y-0.5 text-left">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">মোট নিবন্ধিত ইউজার</span>
                <span className="text-base sm:text-lg font-black text-slate-800 leading-none">{users.length} জন</span>
              </div>
            </div>

            {/* Stat Box 3: Active Banners */}
            <div className="bg-white border border-slate-100 rounded-3xl p-4 sm:p-5 shadow-sm flex items-center gap-3.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-purple-600 opacity-5 rounded-full translate-x-4 -translate-y-4"></div>
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5 stroke-[2.2px]" />
              </div>
              <div className="space-y-0.5 text-left">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">সক্রিয় বিজ্ঞাপন</span>
                <span className="text-base sm:text-lg font-black text-slate-800 leading-none">
                  {offers.filter(o => o.active).length} টি
                </span>
              </div>
            </div>

            {/* Stat Box 4: Server Status */}
            <div className="bg-white border border-slate-100 rounded-3xl p-4 sm:p-5 shadow-sm flex items-center gap-3.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-600 opacity-5 rounded-full translate-x-4 -translate-y-4"></div>
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 stroke-[2.2px]" />
              </div>
              <div className="space-y-0.5 text-left">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">সার্ভার লেটেন্সি</span>
                <span className="text-base sm:text-lg font-black text-emerald-600 leading-none">12ms (Good)</span>
              </div>
            </div>

          </div>

          {/* 2. Dynamic Panel Views */}
          
          {/* ========================================================= */}
          {/* VIEW A: QUESTIONS MANAGEMENT                               */}
          {/* ========================================================= */}
          {activeTab === "questions" && (() => {
            const filteredQuestions = questions.filter((q: any) => {
              const subName = q.subjectName || q.subject_name || "";
              const qText = q.questionText || q.question || q.title || q.question_text || "";
              const matchesSubject = selectedSubjectFilter === "All" || subName === selectedSubjectFilter;
              const matchesSearch = qText.toLowerCase().includes(searchQuery.toLowerCase());
              return matchesSubject && matchesSearch;
            });

            const displayedQuestions = filteredQuestions.slice(0, displayLimit);

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in text-left">
                
                {/* Left Column (Desktop View): Add New MCQ Question Form */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-white border border-slate-100 rounded-[2rem] p-5 sm:p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
                      <div className="w-7 h-7 bg-orange-50 text-[#FF6A00] rounded-lg flex items-center justify-center shrink-0">
                        <Plus className="w-4 h-4 stroke-[2.5px]" />
                      </div>
                      <h3 className="font-extrabold text-sm text-slate-800 tracking-tight">
                        নতুন প্রশ্ন যোগ করুন (Add New MCQ Question)
                      </h3>
                    </div>

                    <form onSubmit={handleAddQuestion} className="space-y-4">
                      <div className="space-y-3">
                        {/* Question Text */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-extrabold text-slate-500 uppercase block pl-1">
                            প্রশ্ন (Question Text in Bangla/English)
                          </label>
                          <input 
                            type="text"
                            placeholder="যেমন: বাংলাদেশের দীর্ঘতম নদী কোনটি?"
                            value={newQuestionText}
                            onChange={(e) => setNewQuestionText(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold focus:outline-none transition-all text-slate-800"
                            required
                          />
                        </div>

                        {/* Subject Selector */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-extrabold text-slate-500 uppercase block pl-1">
                            বিষয় নির্বাচন করুন (MCQ Subject Group)
                          </label>
                          <select
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 focus:border-[#FF6A00] rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold focus:outline-none transition-all text-slate-800 cursor-pointer"
                          >
                            {SUBJECTS.map((sub) => (
                              <option key={sub} value={sub}>{sub}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Options inputs */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-extrabold text-slate-500 uppercase block pl-1">
                          সম্ভাব্য অপশনসমূহ (4 MCQ Options)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {newOptions.map((opt, idx) => (
                            <div key={idx} className="space-y-1">
                              <span className="text-[9px] font-black text-slate-400 pl-1">অপশন {idx + 1}</span>
                              <input 
                                type="text"
                                placeholder={`অপশন ${idx + 1} এর মান`}
                                value={opt}
                                onChange={(e) => handleOptionChange(idx, e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-[#FF6A00] rounded-2xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none transition-all text-slate-800"
                                required
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {/* Correct Answer Index Selector */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-extrabold text-slate-500 uppercase block pl-1">
                            সঠিক উত্তর নির্বাচন করুন (Correct Option Index)
                          </label>
                          <select
                            value={correctOptionIdx}
                            onChange={(e) => setCorrectOptionIdx(parseInt(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 focus:border-[#FF6A00] rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold focus:outline-none transition-all text-slate-800 cursor-pointer"
                          >
                            <option value={0}>অপশন ১ (Option 1)</option>
                            <option value={1}>অপশন ২ (Option 2)</option>
                            <option value={2}>অপশন ৩ (Option 3)</option>
                            <option value={3}>অপশন ৪ (Option 4)</option>
                          </select>
                        </div>

                        {/* Explanation */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-extrabold text-slate-500 uppercase block pl-1">
                            বিশ্লেষণ বা ব্যাখ্যা (Explanation - Optional)
                          </label>
                          <input 
                            type="text"
                            placeholder="যেমন: মেঘনা নদী বাংলাদেশের দীর্ঘতম ও বৃহত্তম নদী।"
                            value={newExplanation}
                            onChange={(e) => setNewExplanation(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold focus:outline-none transition-all text-slate-800"
                          />
                        </div>
                      </div>

                      {/* Submit button */}
                      <div className="pt-2 flex items-center gap-3">
                        <button
                          type="submit"
                          disabled={dbLoading}
                          className="bg-[#FF6A00] hover:bg-orange-600 disabled:bg-slate-400 text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl active:scale-95 transition-all shadow-md shadow-orange-500/10 cursor-pointer flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4 stroke-[2.5px]" />
                          প্রশ্ন যুক্ত করুন
                        </button>

                        {dbLoading && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                            <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
                            সংরক্ষণ হচ্ছে...
                          </div>
                        )}
                      </div>
                    </form>
                  </div>
                </div>

                {/* Right Column (Desktop View): Question Bank Filter, Controls & Question List */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Search, Filter, Refresh, Seeding Toolbar & Display Limit Selection */}
                  <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-5 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-800 text-sm">প্রশ্ন ব্যাংক ফিল্টারিং ও অনুসন্ধান</h4>
                        <p className="text-[11px] text-slate-400 font-bold">বিষয়ভিত্তিক অনুসন্ধান এবং সরাসরি লাইভ ডেটাবেজ সিঙ্কিং টুলস</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Manual Sync */}
                        <button
                          onClick={loadQuestionsFromDb}
                          disabled={dbLoading}
                          className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                          title="লাইভ Supabase থেকে ডেটা রিফ্রেশ করুন"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 text-[#FF6A00] ${dbLoading ? "animate-spin" : ""}`} />
                          রিফ্রেশ সিঙ্ক
                        </button>

                        {/* Seed Database button */}
                        <button
                          onClick={handleSeedDatabase}
                          disabled={dbLoading}
                          className="bg-orange-50 hover:bg-orange-100 border border-orange-200/50 text-[#FF6A00] font-black text-xs px-3.5 py-2 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                          title="৩১টি প্রশ্ন দিয়ে ডেটাবেজ সিড করুন"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          ৩১টি ডেমো সিড
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {/* Search Query Input */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase pl-1 block">কীওয়ার্ড খুঁজুন</label>
                        <input 
                          type="text"
                          placeholder="প্রশ্ন টেক্সট দিয়ে সার্চ করুন..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-[#FF6A00] rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none transition-all text-slate-800"
                        />
                      </div>

                      {/* Subject Filter Dropdown */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase pl-1 block">বিষয় অনুযায়ী ফিল্টার</label>
                        <select
                          value={selectedSubjectFilter}
                          onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-[#FF6A00] rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none transition-all text-slate-800 cursor-pointer"
                        >
                          <option value="All">সকল বিষয় (All Subjects)</option>
                          {SUBJECTS.map((sub) => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Display Limit Options (10, 20, 30, 40, 50) */}
                    <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                        সর্বোচ্চ কতটি প্রশ্ন দেখাবে (সর্বশেষ সংযোজিত):
                      </span>
                      <div className="flex items-center gap-1.5">
                        {[10, 20, 30, 40, 50].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setDisplayLimit(num)}
                            className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                              displayLimit === num
                                ? "bg-[#FF6A00] text-white shadow-sm shadow-orange-500/20"
                                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                            }`}
                          >
                            {num}টি
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Table List Card */}
                  <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <h3 className="font-extrabold text-sm text-slate-800">
                          বিদ্যমান প্রশ্ন ব্যাংক তালিকা
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold">লাইভ Supabase প্রশ্ন ব্যাংক সংগ্রহশালা (সর্বশেষ প্রশ্নসমূহ প্রথমে)</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-extrabold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                          মোট: {questions.length} টি
                        </span>
                        <span className="text-[10px] font-extrabold bg-orange-50 text-[#FF6A00] border border-orange-100 px-3 py-1 rounded-full">
                          প্রদর্শিত: {displayedQuestions.length} / {filteredQuestions.length} টি (সর্বোচ্চ {displayLimit} টি)
                        </span>
                      </div>
                    </div>

                    {dbError && (
                      <div className="p-4 bg-amber-50 border-b border-amber-100 text-amber-800 text-xs font-semibold flex items-center gap-2">
                        <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{dbError} প্যানেলটি এখন ডেমো/লোকাল মেমোরি ফলব্যাকে চলছে।</span>
                      </div>
                    )}

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center w-14">ID</th>
                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">বিষয় ও প্রশ্ন (Subject & MCQ)</th>
                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">সম্ভাব্য অপশনসমূহ (Options)</th>
                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider w-40">সঠিক উত্তর</th>
                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center w-32">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {displayedQuestions.map((q) => {
                            const idVal = q.id;
                            const subjectLabel = q.subjectName || q.subject_name || "Bangla Literature";
                            const questionText = q.questionText || q.question || q.title || q.question_text || "Untitled Question";
                            const explanationText = q.explanation || "";
                            
                            // options parsing safely
                            let options: string[] = ["", "", "", ""];
                            const rawOpts = q.options || q.choices || q.answers;
                            if (Array.isArray(rawOpts)) {
                              options = rawOpts.map(String);
                            } else if (typeof rawOpts === "string") {
                              try {
                                const parsed = JSON.parse(rawOpts);
                                if (Array.isArray(parsed)) options = parsed.map(String);
                              } catch {
                                options = rawOpts.split(",").map((s: string) => s.trim());
                              }
                            }

                            const correctIdxVal = q.correctOptionIndex !== undefined ? q.correctOptionIndex : (q.correct_option_index !== undefined ? q.correct_option_index : (q.correctIndex !== undefined ? q.correctIndex : 0));
                            const correctIdx = Number(correctIdxVal);

                            return (
                              <tr key={idVal} className="hover:bg-slate-50/20 transition-all">
                                <td className="p-4 text-[10px] font-mono font-bold text-slate-400 text-center truncate max-w-[60px]" title={String(idVal)}>
                                  {typeof idVal === "number" ? `#${idVal}` : `#${String(idVal).slice(0, 6)}...`}
                                </td>
                                <td className="p-4 max-w-sm">
                                  <div className="space-y-1">
                                    <span className="text-[9px] font-extrabold bg-[#FF6A00]/5 text-[#FF6A00] border border-[#FF6A00]/10 px-2 py-0.5 rounded-full inline-block">
                                      {subjectLabel}
                                    </span>
                                    <span className="text-xs sm:text-sm font-bold text-slate-800 leading-snug block">
                                      {questionText}
                                    </span>
                                    {explanationText && (
                                      <span className="text-[10px] font-semibold text-slate-400 block italic leading-normal">
                                        ব্যাখ্যা: {explanationText}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="grid grid-cols-2 gap-1.5 max-w-sm">
                                    {options.map((opt, oIdx) => (
                                      <span 
                                        key={oIdx} 
                                        className={`text-[10px] font-semibold px-2 py-1 rounded-lg truncate ${
                                          oIdx === correctIdx 
                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold" 
                                            : "bg-slate-50 text-slate-500 border border-transparent"
                                        }`}
                                      >
                                        {oIdx + 1}. {opt || `অপশন ${oIdx + 1}`}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg inline-block truncate max-w-[150px]">
                                    {options[correctIdx] || options[0] || "অপশন ১"}
                                  </span>
                                </td>
                                <td className="p-4 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    {/* Edit Button */}
                                    <button
                                      onClick={() => handleEditClick(q)}
                                      className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 text-slate-600 rounded-xl transition-colors active:scale-90 cursor-pointer"
                                      title="Edit Question"
                                    >
                                      <Pencil className="w-3.5 h-3.5 text-slate-500" />
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                      onClick={() => {
                                        if (confirm(`আপনি কি নিশ্চিত যে আপনি এই প্রশ্নটি মুছে ফেলতে চান?`)) {
                                          handleDeleteQuestion(idVal);
                                        }
                                      }}
                                      className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-100/50 text-rose-600 rounded-xl transition-colors active:scale-90 cursor-pointer"
                                      title="Delete Question"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}

                        {displayedQuestions.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-xs font-bold text-slate-400">
                              কোনো প্রশ্ন পাওয়া যায়নি! দয়া করে ডেমো প্রশ্ন সিড করুন অথবা নতুন প্রশ্ন যোগ করুন।
                            </td>
                          </tr>
                        )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

              </div>
            );
          })()}

          {/* ========================================================= */}
          {/* VIEW B: USER MANAGEMENT                                    */}
          {/* ========================================================= */}
          {activeTab === "users" && (
            <div className="space-y-6 animate-fade-in">
              
              <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800">
                      নিবন্ধিত শিক্ষার্থীদের তালিকা (User Management)
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-400 mt-1">
                      শিক্ষার্থীদের অ্যাকাউন্ট নিষিদ্ধ ও সক্রিয় করার ডিরেক্টরি
                    </p>
                  </div>
                  <span className="text-[10px] font-extrabold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                    মোট: {users.length} জন ইউজার
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center w-20">ID</th>
                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">ইমেইল এড্রেস (Email)</th>
                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider w-36">ভূমিকা (Role)</th>
                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider w-32 text-center">স্ট্যাটাস</th>
                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center w-40">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/20 transition-all">
                          <td className="p-4 text-xs font-mono font-bold text-slate-400 text-center">{user.id}</td>
                          <td className="p-4">
                            <span className="text-xs sm:text-sm font-bold text-slate-800">
                              {user.email}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-100 inline-block">
                              {user.role}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full inline-block border ${
                              user.status === "Active"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-rose-50 text-rose-700 border-rose-100"
                            }`}>
                              {user.status === "Active" ? "সক্রিয় (Active)" : "নিষিদ্ধ (Banned)"}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => toggleUserStatus(user.id)}
                              className={`text-[10px] font-black px-4 py-2 rounded-xl transition-all active:scale-95 border cursor-pointer ${
                                user.status === "Active"
                                  ? "bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-100/50"
                                  : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-100/50"
                              }`}
                            >
                              {user.status === "Active" ? "Ban Account" : "Activate"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW C: OFFERS & ANNOUNCEMENTS                             */}
          {/* ========================================================= */}
          {activeTab === "offers" && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Add Offer Form Card */}
              <div className="bg-white border border-slate-100 rounded-[2rem] p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
                  <div className="w-7 h-7 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center shrink-0">
                    <Plus className="w-4 h-4 stroke-[2.5px]" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-800 tracking-tight">
                    নতুন অফার ও প্রমোশনাল ব্যানার যোগ করুন
                  </h3>
                </div>

                <form onSubmit={handleAddOffer} className="space-y-4">
                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase block pl-1">
                      ব্যানার শিরোনাম (Title)
                    </label>
                    <input 
                      type="text"
                      placeholder="যেমন: 🔥 বিসিএস মেগা কোর্স ২০% ছাড়!"
                      value={newOfferTitle}
                      onChange={(e) => setNewOfferTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold focus:outline-none transition-all text-slate-800"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase block pl-1">
                      বিস্তারিত অফার বিবরণ (Description)
                    </label>
                    <textarea 
                      placeholder="অফারটির বিশদ বিবরণ, কুপন কোড এবং শেষ হওয়ার সময়সীমা ইত্যাদি সুন্দর করে উল্লেখ করুন..."
                      value={newOfferDesc}
                      onChange={(e) => setNewOfferDesc(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold focus:outline-none transition-all text-slate-800 resize-none"
                      required
                    />
                  </div>

                  {/* Toggle Active state immediately */}
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      id="offer-active-checkbox"
                      checked={newOfferActive}
                      onChange={(e) => setNewOfferActive(e.target.checked)}
                      className="w-4.5 h-4.5 rounded border-slate-300 text-[#FF6A00] focus:ring-[#FF6A00] cursor-pointer"
                    />
                    <label htmlFor="offer-active-checkbox" className="text-xs font-bold text-slate-600 cursor-pointer select-none">
                      তৈরি করার সাথে সাথে ব্যানারটি সরাসরি ওয়েবসাইটে লাইভ দেখান
                    </label>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="bg-[#FF6A00] hover:bg-orange-600 text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl active:scale-95 transition-all shadow-md shadow-orange-500/10 cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5px]" />
                    ব্যানার যুক্ত করুন
                  </button>
                </form>
              </div>

              {/* Offers List Display Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider pl-1">
                  বর্তমান সচল ও অচল ব্যানারসমূহ
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {offers.map((offer) => (
                    <div 
                      key={offer.id} 
                      className={`bg-white border rounded-[2rem] p-5 shadow-sm transition-all space-y-3 ${
                        offer.active ? "border-orange-100" : "border-slate-100 opacity-75"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="space-y-1 text-left">
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${
                            offer.active 
                              ? "bg-orange-50 text-[#FF6A00] border border-orange-100" 
                              : "bg-slate-100 text-slate-400 border border-transparent"
                          }`}>
                            {offer.active ? "ACTIVE BANNER" : "INACTIVE"}
                          </span>
                          <h4 className="text-xs sm:text-sm font-black text-slate-800 leading-snug">
                            {offer.title}
                          </h4>
                        </div>

                        {/* Slide Toggle Switch */}
                        <button
                          onClick={() => toggleOfferActive(offer.id)}
                          className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 shrink-0 ${
                            offer.active ? "bg-[#FF6A00]" : "bg-slate-300"
                          }`}
                          title="ব্যানার স্ট্যাটাস পরিবর্তন করুন"
                        >
                          <span className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all transform ${
                            offer.active ? "translate-x-5" : "translate-x-0"
                          }`}></span>
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-500 font-semibold leading-relaxed text-left">
                        {offer.description}
                      </p>

                      <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400">
                        <span>ID: {offer.id}</span>
                        <span className={offer.active ? "text-orange-500" : "text-slate-400"}>
                          {offer.active ? "● লাইভ প্রদর্শিত হচ্ছে" : "● ড্রাফট মোডে রয়েছে"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </main>

        {/* 3. EDIT QUESTION MODAL */}
        {editingQuestion && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto text-left space-y-4 relative animate-fade-in">
              <button 
                onClick={() => setEditingQuestion(null)}
                className="absolute top-5 right-5 p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 text-slate-500 hover:text-slate-700 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
                  <Pencil className="w-4 h-4 stroke-[2.5px]" />
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-800 tracking-tight">
                  প্রশ্ন এডিট ও আপডেট করুন (Edit MCQ Question)
                </h3>
              </div>

              <form onSubmit={handleUpdateQuestion} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Question Text */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase block pl-1">
                      প্রশ্ন (Question Text)
                    </label>
                    <input 
                      type="text"
                      placeholder="যেমন: বাংলাদেশের দীর্ঘতম নদী কোনটি?"
                      value={editQuestionText}
                      onChange={(e) => setEditQuestionText(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold focus:outline-none transition-all text-slate-800"
                      required
                    />
                  </div>

                  {/* Subject Selector */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase block pl-1">
                      বিষয় নির্বাচন (MCQ Subject Group)
                    </label>
                    <select
                      value={editSubjectName}
                      onChange={(e) => setEditSubjectName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#FF6A00] rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold focus:outline-none transition-all text-slate-800 cursor-pointer"
                    >
                      {SUBJECTS.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Options inputs */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase block pl-1">
                    সম্ভাব্য অপশনসমূহ (4 MCQ Options)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {editOptions.map((opt, idx) => (
                      <div key={idx} className="space-y-1">
                        <span className="text-[9px] font-black text-slate-400 pl-1 font-sans">অপশন {idx + 1}</span>
                        <input 
                          type="text"
                          placeholder={`অপশন ${idx + 1} এর মান`}
                          value={opt}
                          onChange={(e) => handleEditOptionChange(idx, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#FF6A00] rounded-2xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none transition-all text-slate-800"
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Correct Answer Index Selector */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase block pl-1">
                      সঠিক উত্তর নির্বাচন (Correct Option Index)
                    </label>
                    <select
                      value={editCorrectOptionIdx}
                      onChange={(e) => setEditCorrectOptionIdx(parseInt(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#FF6A00] rounded-2xl px-4 py-3 text-xs sm:text-sm font-bold focus:outline-none transition-all text-slate-800 cursor-pointer"
                    >
                      <option value={0}>অপশন ১ (Option 1)</option>
                      <option value={1}>অপশন ২ (Option 2)</option>
                      <option value={2}>অপশন ৩ (Option 3)</option>
                      <option value={3}>অপশন ৪ (Option 4)</option>
                    </select>
                  </div>

                  {/* Explanation */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase block pl-1">
                      বিশ্লেষণ বা ব্যাখ্যা (Explanation - Optional)
                    </label>
                    <input 
                      type="text"
                      placeholder="যেমন: মেঘনা নদী বাংলাদেশের দীর্ঘতম ও বৃহত্তম নদী।"
                      value={editExplanation}
                      onChange={(e) => setEditExplanation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold focus:outline-none transition-all text-slate-800"
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pt-4 border-t border-slate-50 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingQuestion(null)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl active:scale-95 transition-all cursor-pointer animate-fade-in"
                  >
                    বাতিল করুন
                  </button>
                  <button
                    type="submit"
                    disabled={dbLoading}
                    className="bg-[#FF6A00] hover:bg-orange-600 disabled:bg-slate-400 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl active:scale-95 transition-all shadow-md shadow-orange-500/10 cursor-pointer flex items-center gap-1.5"
                  >
                    {dbLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 stroke-[2.5px]" />
                    )}
                    আপডেট করুন
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
