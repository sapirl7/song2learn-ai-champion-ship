import { useEffect } from 'react'
import { Globe, ArrowRight } from 'lucide-react'
import { LANGUAGES, useLang } from '../stores/useLang'

function LanguageSelector({ user }) {
  const { nativeLang, learningLang, setNativeLang, setLearningLang, seedFromUser } = useLang()

  useEffect(() => {
    seedFromUser(user)
  }, [user, seedFromUser])

  return (
    <div className="hidden lg:flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
        <Globe className="w-4 h-4 text-gray-400" />
        <select
          value={learningLang}
          onChange={(e) => setLearningLang(e.target.value)}
          className="bg-transparent text-sm text-gray-700 focus:outline-none"
          aria-label="From language"
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
          className="bg-transparent text-sm text-gray-700 focus:outline-none"
          aria-label="To language"
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


