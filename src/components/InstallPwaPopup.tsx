"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { Download, X, Share, MoreVertical, PlusSquare, Check, Smartphone } from "lucide-react";

interface PwaContextType {
  isStandalone: boolean;
  canInstall: boolean;
  bannerDismissed: boolean;
  showGuideModal: boolean;
  installedSuccess: boolean;
  isIOS: boolean;
  triggerInstall: () => void;
  dismissBanner: () => void;
  closeGuideModal: () => void;
}

const PwaContext = createContext<PwaContextType>({
  isStandalone: false,
  canInstall: true,
  bannerDismissed: false,
  showGuideModal: false,
  installedSuccess: false,
  isIOS: false,
  triggerInstall: () => {},
  dismissBanner: () => {},
  closeGuideModal: () => {},
});

export const usePwa = () => useContext(PwaContext);

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [canInstall, setCanInstall] = useState<boolean>(true);
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [installedSuccess, setInstalledSuccess] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.log("Service Worker registration failed:", err);
      });
    }

    if (typeof window !== "undefined") {
      // 2. Check Standalone mode
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as any).standalone === true;

      setIsStandalone(isStandaloneMode);

      // Detect iOS
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIosDevice);

      // 3. Check localStorage for dismissal (session/24h dismissal)
      const lastDismissed = localStorage.getItem("jobmaster_pwa_banner_dismissed");
      const isDismissed = lastDismissed && Date.now() - parseInt(lastDismissed) < 24 * 60 * 60 * 1000;
      if (isDismissed) {
        setBannerDismissed(true);
      }
    }

    // 4. Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    // 5. Listen for appinstalled event (Strict Auto-Hide)
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setCanInstall(false);
      setDeferredPrompt(null);
      setInstalledSuccess(true);
      setTimeout(() => setInstalledSuccess(false), 5000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const triggerInstall = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setIsStandalone(true);
          setCanInstall(false);
          setInstalledSuccess(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error("Install prompt error:", err);
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  const dismissBanner = () => {
    setBannerDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("jobmaster_pwa_banner_dismissed", Date.now().toString());
    }
  };

  const closeGuideModal = () => {
    setShowGuideModal(false);
  };

  return (
    <PwaContext.Provider
      value={{
        isStandalone,
        canInstall,
        bannerDismissed,
        showGuideModal,
        installedSuccess,
        isIOS,
        triggerInstall,
        dismissBanner,
        closeGuideModal,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
}

/* 1. Compact Header Install Action Button */
export function HeaderInstallButton() {
  const { isStandalone, triggerInstall } = usePwa();

  // Strict Auto-Hide: Hide completely if already installed / standalone
  if (isStandalone) {
    return null;
  }

  return (
    <button
      onClick={triggerInstall}
      className="flex items-center gap-1.5 bg-[#FF6A00] hover:bg-orange-600 text-white font-black text-[11px] px-2.5 py-1.5 rounded-full shadow-sm hover:shadow active:scale-95 transition-all cursor-pointer shrink-0 animate-pulse-subtle"
      title="Install Job Master App"
      id="header-install-app-btn"
    >
      <Download className="w-3.5 h-3.5 stroke-[2.5]" />
      <span className="hidden sm:inline">Install</span>
    </button>
  );
}

/* 2. Dismissible Bottom Sheet Banner (positioned directly above bottom nav: bottom-16 / bottom-20) */
export function BottomInstallBanner() {
  const { isStandalone, bannerDismissed, triggerInstall, dismissBanner } = usePwa();

  // Strict Auto-Hide: Hide if already installed or banner was dismissed
  if (isStandalone || bannerDismissed) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-16 sm:bottom-6 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-md z-[60] animate-slide-up"
      id="bottom-pwa-install-banner"
    >
      <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-800 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 transition-all">
        
        {/* Left: App Icon & Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-700 bg-[#FAF9F6] shadow-sm">
            <img 
              src="/icon.svg" 
              alt="Job Master Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 leading-tight">
            <h4 className="font-extrabold text-xs text-white truncate tracking-tight flex items-center gap-1">
              Install Job Master App
            </h4>
            <p className="text-[10px] text-slate-300 font-medium truncate mt-0.5">
              চাকরি প্রস্তুতি এখন আরও সহজ ও দ্রুত!
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={triggerInstall}
            className="bg-[#FF6A00] hover:bg-orange-600 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-md hover:shadow-orange-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
            id="bottom-banner-install-btn"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Install</span>
          </button>

          <button
            onClick={dismissBanner}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
            title="বন্ধ করুন"
            id="bottom-banner-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}

/* 3. Global Guide Modal & Success Toast */
export function InstallPwaPopup() {
  const { showGuideModal, closeGuideModal, installedSuccess, isIOS } = usePwa();

  return (
    <>
      {/* SUCCESS TOAST WHEN INSTALLED */}
      {installedSuccess && (
        <div className="fixed top-3 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-md z-[9999] bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold animate-fade-in">
          <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-white stroke-[3]" />
          </div>
          <span>Job Master সফলভাবে আপনার মোবাইলের হোম স্ক্রিনে ইনস্টল করা হয়েছে!</span>
        </div>
      )}

      {/* GUIDED INSTALLATION MODAL */}
      {showGuideModal && (
        <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full relative text-left space-y-4">
            
            <button
              onClick={closeGuideModal}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-xl cursor-pointer"
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
              onClick={closeGuideModal}
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
