import { useTranslation } from "../../context/LanguageContext";

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useTranslation();

  return (
    <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-0.5">
      <button
        onClick={() => setLang("zh")}
        className={`px-2 py-1 text-xs rounded-md transition-colors ${
          lang === "zh"
            ? "bg-brand-600 text-white"
            : "text-gray-400 hover:text-gray-200"
        }`}
      >
        {t("lang.zh")}
      </button>
      <button
        onClick={() => setLang("en")}
        className={`px-2 py-1 text-xs rounded-md transition-colors ${
          lang === "en"
            ? "bg-brand-600 text-white"
            : "text-gray-400 hover:text-gray-200"
        }`}
      >
        {t("lang.en")}
      </button>
    </div>
  );
}
