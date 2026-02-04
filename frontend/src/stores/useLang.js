import { create } from 'zustand'
import { LANGUAGES as LANG_LIST } from '../i18n/translations'
import { usersApi } from '../api/client'

const STORAGE_KEY = 'lang_settings_v2'

// Re-export LANGUAGES for backward compatibility
export const LANGUAGES = LANG_LIST

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
      JSON.stringify({ nativeLang: state.nativeLang, learningLang: state.learningLang, uiLang: state.uiLang })
    )
  } catch {
    // ignore
  }
}

export const useLang = create((set, get) => {
  const saved = loadInitial()
  const nativeLang = saved?.nativeLang || 'en'
  const learningLang = saved?.learningLang || 'en'
  const uiLang = saved?.uiLang || 'en'

  const syncServer = async () => {
    const { nativeLang: n, learningLang: l } = get()
    try {
      await usersApi.updatePreferences({ native_lang: n, learning_lang: l })
    } catch {
      // ignore server sync errors
    }
  }

  return {
    nativeLang,
    learningLang,
    uiLang,
    setNativeLang: (lang) => {
      set({ nativeLang: lang })
      persist(get())
      syncServer()
    },
    setLearningLang: (lang) => {
      set({ learningLang: lang })
      persist(get())
      syncServer()
    },
    setUiLang: (lang) => {
      set({ uiLang: lang })
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            nativeLang: get().nativeLang,
            learningLang: get().learningLang,
            uiLang: lang,
          })
        )
      } catch {
        // ignore
      }
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
        uiLang: current?.uiLang || 'en',
      }
      set(next)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // ignore
      }
    },
  }
})
