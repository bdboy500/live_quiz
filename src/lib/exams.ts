import { getSupabase } from "./supabase";
import { Question, QUIZ_QUESTIONS } from "../data";

export interface ExamPaper {
  id: string;
  title: string;
  course: string; // "bcs", "bank", "primary", "ntrca", "psc", "all_job", "bangla", "english", "math", "science"
  examType: "weekly" | "daily" | "subject" | "special";
  subject?: string;
  questionCount: number;
  timePerQuestionSeconds: number; // default 36s
  totalDurationSeconds: number; // questionCount * 36
  totalMarks: number;
  topic: string;
  examDate: string;
  status: "Live" | "Upcoming" | "Completed" | "Archive";
  questions: Question[];
  createdAt?: string;
}

export const DEFAULT_EXAM_PAPERS: ExamPaper[] = [
  {
    id: "exam-bcs-weekly-01",
    title: "Live MCQ ফ্রি সাপ্তাহিক ফুল মডেল টেস্ট: বিসিএস প্রিলি",
    course: "bcs",
    examType: "weekly",
    subject: "All Subjects",
    questionCount: 20,
    timePerQuestionSeconds: 36,
    totalDurationSeconds: 20 * 36,
    totalMarks: 20,
    topic: '"Award Mania: Season - 20" এর জন্য প্রযোজ্য ও সাম্প্রতিক বিষয়াবলী',
    examDate: "Fri, Jul 31, 2026",
    status: "Live",
    questions: QUIZ_QUESTIONS.slice(0, 20)
  },
  {
    id: "exam-bcs-daily-01",
    title: "ডেইলি মডেল টেস্ট: বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলী",
    course: "bcs",
    examType: "daily",
    subject: "Bangladesh Affairs",
    questionCount: 10,
    timePerQuestionSeconds: 36,
    totalDurationSeconds: 10 * 36,
    totalMarks: 10,
    topic: "মুক্তিযুদ্ধ, মুজিবনগর সরকার ও সাম্প্রতিক আন্তর্জাতিক ঘটনাপ্রবাহ",
    examDate: "Thu, Jul 30, 2026",
    status: "Live",
    questions: QUIZ_QUESTIONS.filter(q => q.subject === "Bangladesh Affairs" || q.subject === "International Affairs").slice(0, 10)
  },
  {
    id: "exam-bank-weekly-01",
    title: "ব্যাংক নিয়োগ পরীক্ষার স্পেশাল ফুল মক টেস্ট",
    course: "bank",
    examType: "weekly",
    subject: "All Subjects",
    questionCount: 15,
    timePerQuestionSeconds: 36,
    totalDurationSeconds: 15 * 36,
    totalMarks: 15,
    topic: "English Grammar, Mathematics & Technology Special Focus",
    examDate: "Wed, Jul 29, 2026",
    status: "Archive",
    questions: QUIZ_QUESTIONS.filter(q => q.subject === "Technology" || q.subject === "General Science" || q.subject === "Geography").slice(0, 15)
  },
  {
    id: "exam-primary-01",
    title: "প্রাথমিক শিক্ষক নিয়োগ স্পেশাল মডেল টেস্ট - সেট ১",
    course: "primary",
    examType: "weekly",
    subject: "All Subjects",
    questionCount: 12,
    timePerQuestionSeconds: 36,
    totalDurationSeconds: 12 * 36,
    totalMarks: 12,
    topic: "বাংলা, ইংরেজি, গণিত ও সাধারণ জ্ঞান পূর্ণাঙ্গ সেট",
    examDate: "Tue, Jul 28, 2026",
    status: "Archive",
    questions: QUIZ_QUESTIONS.slice(5, 17)
  }
];

export async function fetchExamPapersFromDb(): Promise<ExamPaper[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from("exam_papers").select("*");
    
    if (error || !data || data.length === 0) {
      // Check localStorage cached papers
      const cached = localStorage.getItem("job_master_exam_papers");
      if (cached) {
        return JSON.parse(cached);
      }
      // Return defaults if nothing saved yet
      localStorage.setItem("job_master_exam_papers", JSON.stringify(DEFAULT_EXAM_PAPERS));
      return DEFAULT_EXAM_PAPERS;
    }

    const parsedData: ExamPaper[] = data.map((item: any) => ({
      id: item.id,
      title: item.title,
      course: item.course,
      examType: item.examType || item.exam_type || "weekly",
      subject: item.subject,
      questionCount: item.questionCount || item.question_count || item.questions?.length || 10,
      timePerQuestionSeconds: item.timePerQuestionSeconds || item.time_per_question || 36,
      totalDurationSeconds: item.totalDurationSeconds || item.total_duration || (item.questions?.length || 10) * 36,
      totalMarks: item.totalMarks || item.total_marks || item.questions?.length || 10,
      topic: item.topic || "মডেল টেস্ট",
      examDate: item.examDate || item.exam_date || "Today",
      status: item.status || "Live",
      questions: typeof item.questions === "string" ? JSON.parse(item.questions) : item.questions || []
    }));

    // Cache locally
    localStorage.setItem("job_master_exam_papers", JSON.stringify(parsedData));
    return parsedData;
  } catch (err) {
    console.warn("Falling back to local exam papers:", err);
    const cached = localStorage.getItem("job_master_exam_papers");
    if (cached) return JSON.parse(cached);
    localStorage.setItem("job_master_exam_papers", JSON.stringify(DEFAULT_EXAM_PAPERS));
    return DEFAULT_EXAM_PAPERS;
  }
}

export async function saveExamPaperToDb(paper: ExamPaper): Promise<boolean> {
  // Update local storage first
  const currentPapers = await fetchExamPapersFromDb();
  const index = currentPapers.findIndex(p => p.id === paper.id);
  if (index >= 0) {
    currentPapers[index] = paper;
  } else {
    currentPapers.unshift(paper);
  }
  localStorage.setItem("job_master_exam_papers", JSON.stringify(currentPapers));

  // Sync to Supabase
  try {
    const supabase = getSupabase();
    const payload = {
      id: paper.id,
      title: paper.title,
      course: paper.course,
      exam_type: paper.examType,
      subject: paper.subject || "All Subjects",
      question_count: paper.questionCount,
      time_per_question: paper.timePerQuestionSeconds,
      total_duration: paper.totalDurationSeconds,
      total_marks: paper.totalMarks,
      topic: paper.topic,
      exam_date: paper.examDate,
      status: paper.status,
      questions: JSON.stringify(paper.questions)
    };

    const { error } = await supabase.from("exam_papers").upsert(payload, { onConflict: "id" });
    if (error) {
      console.warn("Supabase upsert exam_paper error:", error);
    }
  } catch (e) {
    console.warn("Supabase save exam paper failed:", e);
  }
  return true;
}

export async function deleteExamPaperFromDb(id: string): Promise<boolean> {
  const currentPapers = await fetchExamPapersFromDb();
  const filtered = currentPapers.filter(p => p.id !== id);
  localStorage.setItem("job_master_exam_papers", JSON.stringify(filtered));

  try {
    const supabase = getSupabase();
    await supabase.from("exam_papers").delete().eq("id", id);
  } catch (e) {
    console.warn("Supabase delete exam paper failed:", e);
  }
  return true;
}

export function subscribeToExamPapers(onUpdate: (papers: ExamPaper[]) => void) {
  try {
    const supabase = getSupabase();
    const channel = supabase
      .channel("public:exam_papers")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "exam_papers" },
        async () => {
          const updatedPapers = await fetchExamPapersFromDb();
          onUpdate(updatedPapers);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (e) {
    console.warn("Realtime subscription setup failed:", e);
    return () => {};
  }
}
