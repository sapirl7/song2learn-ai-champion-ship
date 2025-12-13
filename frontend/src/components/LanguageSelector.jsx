import { useEffect } from 'react'
import { Globe, ArrowRight } from 'lucide-react'
import { LANGUAGES, useLang } from '../stores/useLang'
import { getLangName, t } from '../i18n/translations'

// Compact UI language selector for corner placement
export function UiLanguageSelector() {
  const { uiLang, setUiLang } = useLang()

  return (
    <div className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors">
      <Globe className="w-3.5 h-3.5" />
      <select
        value={uiLang}
        onChange={(e) => setUiLang(e.target.value)}
        className="bg-transparent text-xs cursor-pointer focus:outline-none"
        aria-label="Interface language"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.code.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  )
}

// Learning language pair selector (more prominent)
export function LearningLanguageSelector({ user }) {
  const { learningLang, nativeLang, uiLang, setLearningLang, setNativeLang, seedFromUser } = useLang()

  useEffect(() => {
    seedFromUser(user)
  }, [user, seedFromUser])

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 border border-primary-200 rounded-full">
      <span className="text-xs text-primary-600 font-medium hidden sm:inline">{t('common.iLearn', uiLang)}:</span>
      <select
        value={learningLang}
        onChange={(e) => setLearningLang(e.target.value)}
        className="bg-transparent text-sm font-medium text-primary-700 cursor-pointer focus:outline-none"
        aria-label="Language you're learning"
        title={t('common.iLearnTooltip', uiLang)}
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {getLangName(l.code, uiLang)}
          </option>
        ))}
      </select>
      <span className="text-xs text-primary-500 hidden sm:inline">→ {t('common.translateTo', uiLang)}</span>
      <select
        value={nativeLang}
        onChange={(e) => setNativeLang(e.target.value)}
        className="bg-transparent text-sm font-medium text-primary-700 cursor-pointer focus:outline-none"
        aria-label="Translation language"
        title={t('common.translateToTooltip', uiLang)}
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {getLangName(l.code, uiLang)}
          </option>
        ))}
      </select>
    </div>
  )
}

// Default export for backwards compatibility
function LanguageSelector({ user }) {
  return <LearningLanguageSelector user={user} />
}

export default LanguageSelector
