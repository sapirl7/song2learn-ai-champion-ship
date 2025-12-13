import { useState, useEffect, useRef } from 'react'
import { vocabularyApi, voiceApi } from '../api/client'
import { LANGUAGES, useLang } from '../stores/useLang'
import { t } from '../i18n/translations'
import toast from 'react-hot-toast'
import { BookOpen, Plus, Trash2, Loader2, X, Volume2, HelpCircle } from 'lucide-react'

function Vocabulary() {
  const { nativeLang, learningLang, uiLang } = useLang()
  const [words, setWords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newWord, setNewWord] = useState({ word: '', translation: '', context: '' })
  const [isAdding, setIsAdding] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [speakingId, setSpeakingId] = useState(null)
  const audioRef = useRef(null)
  const [translationOverride, setTranslationOverride] = useState({})
  const [targetOverride, setTargetOverride] = useState({})

  useEffect(() => {
    loadVocabulary()
  }, [])

  const loadVocabulary = async () => {
    try {
      const response = await vocabularyApi.getAll()
      setWords(response.data)
    } catch (error) {
      toast.error('Failed to load vocabulary')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newWord.word.trim() || !newWord.translation.trim()) return

    setIsAdding(true)
    try {
      const response = await vocabularyApi.create({
        ...newWord,
        source_lang: learningLang || 'en',
        target_lang: nativeLang || 'en',
      })
      setWords([response.data, ...words])
      setNewWord({ word: '', translation: '', context: '' })
      setShowAddModal(false)
      toast.success('Word added!')
    } catch (error) {
      toast.error('Failed to add word')
    } finally {
      setIsAdding(false)
    }
  }

  const handleSpeak = async (word) => {
    setSpeakingId(word.id)
    try {
      const lang = word.source_lang || learningLang || 'en'
      const response = await voiceApi.speak({ text: word.word, language: lang })
      if (audioRef.current) {
        audioRef.current.src = response.data.audio_url
        await audioRef.current.play()
      }
    } catch (error) {
      // Fallback: browser TTS
      try {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel()
          const u = new SpeechSynthesisUtterance(word.word)
          u.lang = word.source_lang || learningLang || 'en'
          window.speechSynthesis.speak(u)
          toast('Using browser voice', { duration: 1500 })
          return
        }
      } catch {
        // ignore
      }
      toast.error('Failed to play audio')
    } finally {
      setSpeakingId(null)
    }
  }

  const handleTranslateView = async (word, target) => {
    try {
      setTargetOverride((prev) => ({ ...prev, [word.id]: target }))
      const res = await vocabularyApi.translate({
        word: word.word,
        source_lang: word.source_lang || learningLang || 'en',
        target_lang: target,
      })
      setTranslationOverride((prev) => ({ ...prev, [word.id]: res.data.translation }))
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Translation unavailable')
    }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await vocabularyApi.delete(id)
      setWords(words.filter((w) => w.id !== id))
      toast.success('Word removed')
    } catch (error) {
      toast.error('Failed to delete word')
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <audio ref={audioRef} className="hidden" />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary-500" />
          <h1 className="text-3xl font-bold text-gray-900">{t('vocabulary.title', uiLang)}</h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('vocabulary.addWord', uiLang)}
        </button>
      </div>

      {/* Help text */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">{t('vocabulary.helpText', uiLang)}</p>
        </div>
      </div>

      {words.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-700 mb-2">
            {t('vocabulary.empty', uiLang)}
          </h2>
          <p className="text-gray-500 mb-6">
            {t('vocabulary.emptySubtitle', uiLang)}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('vocabulary.addFirstWord', uiLang)}
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {words.map((word) => (
            <div
              key={word.id}
              className="flex items-start justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-200 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-baseline gap-3 mb-1 flex-wrap">
                  <span className="text-lg font-semibold text-gray-900">
                    {word.word}
                  </span>
                  {(word.source_lang || word.target_lang) && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                      {(word.source_lang || '?')}→{(word.target_lang || '?')}
                    </span>
                  )}
                  <span className="text-gray-400">—</span>
                  <span className="text-gray-600">
                    {translationOverride[word.id] ?? word.translation}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleSpeak(word)}
                    disabled={speakingId === word.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {speakingId === word.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                    {t('common.listen', uiLang)}
                  </button>

                  <select
                    value={targetOverride[word.id] || word.target_lang || nativeLang || 'en'}
                    onChange={(e) => handleTranslateView(word, e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-700 bg-white"
                    title="View translation in another language"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
                {word.context && (
                  <p className="text-sm text-gray-500 italic mt-2">"{word.context}"</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDelete(word.id)}
                  disabled={deletingId === word.id}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  {deletingId === word.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Word Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">{t('vocabulary.addNewWord', uiLang)}</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('vocabulary.word', uiLang)} *
                </label>
                <input
                  type="text"
                  required
                  value={newWord.word}
                  onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t('vocabulary.enterWord', uiLang)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('vocabulary.translation', uiLang)} *
                </label>
                <input
                  type="text"
                  required
                  value={newWord.translation}
                  onChange={(e) => setNewWord({ ...newWord, translation: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t('vocabulary.enterTranslation', uiLang)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('vocabulary.context', uiLang)}
                </label>
                <input
                  type="text"
                  value={newWord.context}
                  onChange={(e) => setNewWord({ ...newWord, context: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t('vocabulary.exampleContext', uiLang)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('common.cancel', uiLang)}
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                >
                  {isAdding ? t('vocabulary.adding', uiLang) : t('vocabulary.addWord', uiLang)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Vocabulary
