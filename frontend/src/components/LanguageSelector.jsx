import { useEffect } from 'react'
import { Globe, ArrowRight } from 'lucide-react'
import { LANGUAGES, useLang } from '../stores/useLang'

function LanguageSelector({ user }) {
  const { uiLang, nativeLang, learningLang, setUiLang, setNativeLang, setLearningLang, seedFromUser } = useLang()

  useEffect(() => {
    seedFromUser(user)
  }, [user, seedFromUser])

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-2 py-2 sm:px-3 bg-gray-50 border border-gray-200 rounded-lg">
        <Globe className="w-4 h-4 text-gray-400" />
        <select
          value={uiLang}
          onChange={(e) => setUiLang(e.target.value)}
          className="bg-transparent text-xs sm:text-sm text-gray-700 focus:outline-none"
          aria-label="UI language"
          title="UI language"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              UI: {l.name}
            </option>
          ))}
        </select>
        <span className="text-gray-300">|</span>
        <select
          value={learningLang}
          onChange={(e) => setLearningLang(e.target.value)}
          className="bg-transparent text-xs sm:text-sm text-gray-700 focus:outline-none"
          aria-label="From language (learning)"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name}
            </option>
          ))}
        </select>
        <ArrowRight className="w-4 h-4 text-gray-400" />
        <select
          value={nativeLang}
          onChange={(e) => setNativeLang(e.target.value)}
          className="bg-transparent text-xs sm:text-sm text-gray-700 focus:outline-none"
          aria-label="To language (native)"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default LanguageSelector


