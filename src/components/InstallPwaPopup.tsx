"use client";

import { useState, useEffect } from "react";
import { Download, X, Smartphone, Share, MoreVertical, PlusSquare, Check } from "lucide-react";

export function InstallPwaPopup() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [hostDomain, setHostDomain] = useState<string>("jobmaster.app");
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [installedSuccess, setInstalledSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Register service worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.log("Service Worker registration failed:", err);
      });
    }

    // Set current domain name
    if (typeof window !== "undefined") {
      setHostDomain(window.location.host || "jobmaster.app");

      // Detect standalone mode (already installed)
      const isStandaloneMode = 
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as any).standalone === true;

      setIsStandalone(isStandaloneMode);

      // Detect iOS
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIosDevice);

      // Check localStorage for dismissal timestamp (hide for 1 day if dismissed)
      const lastDismissed = localStorage.getItem("jobmaster_pwa_dismissed");
      const isDismissed = lastDismissed && Date.now() - parseInt(lastDismissed) < 24 * 60 * 60 * 1000;

      if (!isStandaloneMode && !isDismissed) {
        // Show banner automatically on initial load
        setShowBanner(true);
      }
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone) {
        setShowBanner(true);
      }
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setShowBanner(false);
      setInstalledSuccess(true);
      setDeferredPrompt(null);
      setTimeout(() => setInstalledSuccess(false), 5000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setShowBanner(false);
          setInstalledSuccess(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error("Install prompt error:", err);
        setShowGuideModal(true);
      }
    } else {
      // If native prompt isn't directly available (e.g., iOS or browser delay), show step-by-step guide
      setShowGuideModal(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("jobmaster_pwa_dismissed", Date.now().toString());
  };

  if (isStandalone && !installedSuccess) {
    return null;
  }

  return (
    <>
      {/* 1. TOP POPUP BANNER matching demo.jpeg (input_file_1.png) */}
      {showBanner && !isStandalone && (
        <div className="fixed top-2 left-2 right-2 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-md z-[9999] animate-slide-down">
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl p-3 shadow-xl shadow-slate-900/15 flex items-center justify-between gap-3 text-left transition-all">
            
            {/* Left: App Logo & Info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-slate-100 shadow-sm bg-[#FAF9F6]">
                <img 
                  src="/icon.svg" 
                  alt="Job Master Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 leading-tight">
                <h4 className="font-black text-xs sm:text-sm text-slate-800 truncate tracking-tight flex items-center gap-1">
                  Install Job Master
                </h4>
                <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  {hostDomain}
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleInstallClick}
                className="bg-[#FF6A00] hover:bg-orange-600 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer flex items-center gap-1.2"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Install</span>
              </button>

              <button
                onClick={handleDismiss}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                title="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. SUCCESS TOAST WHEN INSTALLED */}
      {installedSuccess && (
        <div className="fixed top-3 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-md z-[9999] bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold animate-fade-in">
          <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-white stroke-[3]" />
          </div>
          <span>Job Master সফলভাবে আপনার মোবাইলের হোম স্ক্রিনে ইনস্টল করা হয়েছে!</span>
        </div>
      )}

      {/* 3. GUIDED INSTALLATION MODAL (Fallback for iOS or when prompt is deferred) */}
      {showGuideModal && (
        <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full relative text-left space-y-4">
            
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-xl"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <img src="/icon.svg" alt="Job Master Logo" className="w-12 h-12 rounded-2xl border border-slate-100 shadow-sm" />
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Job Master ইনস্টল করুন</h3>
                <p className="text-xs text-slate-500 font-medium">চাকরি এখন হাতের মুঠোয়!</p>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-xs space-y-3 text-slate-700">
              <p className="font-bold text-[#FF6A00]">
                {isIOS ? "📱 iOS (iPhone / iPad) ব্যবহারকারীদের জন্য নির্দেশিকা:" : "📱 সহজ ইনস্টলেশন নির্দেশিকা:"}
              </p>

              {isIOS ? (
                <ol className="list-decimal pl-4 space-y-2 text-[11px] leading-relaxed">
                  <li>সাফারি (Safari) ব্রাউজারের নিচে থাকা <span className="inline-flex items-center gap-1 font-extrabold text-slate-900"><Share className="w-3.5 h-3.5 text-blue-600" /> Share</span> বাটনে ট্যাপ করুন।</li>
                  <li>মেনু স্ক্রোল করে <span className="font-extrabold text-slate-900">'Add to Home Screen'</span> (হোম স্ক্রিনে যোগ করুন) সিলেক্ট করুন।</li>
                  <li>উপরে ডান কোণায় <span className="font-extrabold text-[#FF6A00]">'Add'</span> চাপলেই এটি অ্যাপ হিসেবে সেভ হয়ে যাবে।</li>
                </ol>
              ) : (
                <ol className="list-decimal pl-4 space-y-2 text-[11px] leading-relaxed">
                  <li>ব্রাউজারের উপরে ডান কোণায় থাকা <span className="inline-flex items-center gap-1 font-extrabold text-slate-900"><MoreVertical className="w-3.5 h-3.5" /> থ্রি-ডট (Three dots)</span> মেনুতে ট্যাপ করুন।</li>
                  <li>তালিকা থেকে <span className="font-extrabold text-slate-900"><Download className="w-3.5 h-3.5 inline text-[#FF6A00]" /> 'Install app'</span> অথবা <span className="font-extrabold text-slate-900"><PlusSquare className="w-3.5 h-3.5 inline text-[#FF6A00]" /> 'Add to Home screen'</span> নির্বাচন করুন।</li>
                  <li>নিশ্চিত করতে <span className="font-extrabold text-[#FF6A00]">'Install'</span> চাপুন।</li>
                </ol>
              )}
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full bg-[#FF6A00] hover:bg-orange-600 text-white font-extrabold text-xs py-3 rounded-2xl active:scale-95 transition-all shadow-md shadow-orange-500/20 cursor-pointer text-center"
            >
              বুঝেছি (Got It)
            </button>

          </div>
        </div>
      )}
    </>
  );
}
