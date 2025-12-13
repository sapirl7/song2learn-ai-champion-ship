import { create } from 'zustand'

const STORAGE_KEY = 'lang_settings_v1'

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'pl', name: 'Polish' },
  { code: 'ru', name: 'Russian' },
  { code: 'pt', name: 'Portuguese' },
]

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function persist(state) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ nativeLang: state.nativeLang, learningLang: state.learningLang })
    )
  } catch {
    // ignore
  }
}

export const useLang = create((set, get) => {
  const saved = loadInitial()
  const nativeLang = saved?.nativeLang || 'en'
  const learningLang = saved?.learningLang || 'en'

  return {
    nativeLang,
    learningLang,
    setNativeLang: (lang) => {
      set({ nativeLang: lang })
      persist(get())
    },
    setLearningLang: (lang) => {
      set({ learningLang: lang })
      persist(get())
    },
    /**
     * If user has preferences and local settings are not explicitly set, seed them once.
     */
    seedFromUser: (user) => {
      if (!user) return
      const current = loadInitial()
      if (current?.nativeLang || current?.learningLang) return
      const next = {
        nativeLang: user.native_lang || 'en',
        learningLang: user.learning_lang || 'en',
      }
      set(next)
      persist(next)
    },
  }
})


