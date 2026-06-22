import { useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "../../context/LanguageContext";

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useTranslation();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleBackdropClick}
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          open
            ? "bg-black/50 backdrop-blur-sm opacity-100"
            : "bg-transparent opacity-0 pointer-events-none"
        }`}
      >
        {/* Drawer panel */}
        <div
          ref={drawerRef}
          className={`absolute top-0 right-0 h-full w-72 max-w-[85vw] bg-surface-900 border-l border-surface-800/60 shadow-2xl transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-surface-800/50">
            <h2 className="text-base font-semibold text-surface-50">Settings</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-surface-500 hover:text-surface-200 hover:bg-surface-800 transition-all duration-150 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="px-5 py-4 space-y-6">
            {/* ── Theme ── */}
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-2 uppercase tracking-wider">
                {t("app.theme")}
              </label>
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-surface-850 border border-surface-800/60 hover:bg-surface-800/60 transition-all duration-150 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  {theme === "dark" ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  )}
                  <span className="text-sm text-surface-200 font-medium">
                    {theme === "dark" ? t("theme.dark") : t("theme.light")}
                  </span>
                </div>
                {/* Toggle pill */}
                <div className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 ${
                  theme === "dark" ? "bg-brand-600" : "bg-surface-600"
                }`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    theme === "dark" ? "translate-x-4" : "translate-x-0"
                  }`} />
                </div>
              </button>
            </div>

            {/* ── Language ── */}
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-2 uppercase tracking-wider">
                Language
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setLang("zh")}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                    lang === "zh"
                      ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                      : "bg-surface-850 border border-surface-800/60 text-surface-400 hover:text-surface-200 hover:bg-surface-800/60"
                  }`}
                >
                  {t("lang.zh")}
                </button>
                <button
                  onClick={() => setLang("en")}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                    lang === "en"
                      ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                      : "bg-surface-850 border border-surface-800/60 text-surface-400 hover:text-surface-200 hover:bg-surface-800/60"
                  }`}
                >
                  {t("lang.en")}
                </button>
              </div>
            </div>

            {/* ── App version ── */}
            <div className="pt-4 border-t border-surface-800/50">
              <p className="text-xs text-surface-600 text-center">TRANSVD v2.2.0</p>
              <p className="text-[10px] text-surface-700 text-center mt-1">
                Powered by ffmpeg.wasm
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
