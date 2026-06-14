import { useTranslation } from "../../context/LanguageContext";

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useTranslation();

  return (
    <div className="flex items-center gap-1 bg-surface-850 rounded-lg border border-surface-800/60 p-0.5">
      <button
        onClick={() => setLang("zh")}
        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-150 ${
          lang === "zh"
            ? "bg-brand-600 text-white shadow-sm"
            : "text-surface-500 hover:text-surface-300"
        }`}
      >
        {t("lang.zh")}
      </button>
      <button
        onClick={() => setLang("en")}
        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-150 ${
          lang === "en"
            ? "bg-brand-600 text-white shadow-sm"
            : "text-surface-500 hover:text-surface-300"
        }`}
      >
        {t("lang.en")}
      </button>
    </div>
  );
}
