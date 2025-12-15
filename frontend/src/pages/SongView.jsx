import { useState, useRef, useCallback, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { songsApi, userSongsApi, analyzeApi, vocabularyApi, voiceApi } from '../api/client'
import { useUser } from '../stores/useUser'
import { useLang } from '../stores/useLang'
import { t } from '../i18n/translations'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Heart,
  Volume2,
  Loader2,
  Plus,
  X,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

const HOVER_DELAY = 150 // ms before triggering analysis on hover

function SongView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { user } = useUser()
  const { nativeLang, learningLang, uiLang } = useLang()
  const audioRef = useRef(null)
  const hoverTimeoutRef = useRef(null)
  const abortControllerRef = useRef(null)

  const [selectedLine, setSelectedLine] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [savingWord, setSavingWord] = useState(false)
  const [showWhy, setShowWhy] = useState(true)
  const [interlinearTokens, setInterlinearTokens] = useState(null)
  const [showStory, setShowStory] = useState(false)
  const [story, setStory] = useState(null)
  const [storyLoading, setStoryLoading] = useState(false)

  // Fetch song data
  const { data: song, isLoading: songLoading } = useQuery({
    queryKey: ['song', id],
    queryFn: () => songsApi.get(id).then(res => res.data),
  })

  // Check if song is saved
  const { data: savedStatus } = useQuery({
    queryKey: ['song-saved', id],
    queryFn: () => userSongsApi.isSaved(id).then(res => res.data),
  })

  const isSaved = savedStatus?.saved ?? false

  // Mutation for toggling save
  const saveMutation = useMutation({
    mutationFn: () => userSongsApi.save(id),
    onSuccess: (res) => {
      queryClient.setQueryData(['song-saved', id], { saved: res.data.saved })
      toast.success(res.data.message)
    },
    onError: () => toast.error('Failed to save song'),
  })

  // Mutation for analyzing lines
  const analyzeMutation = useMutation({
    mutationFn: ({ line, lineIndex, signal }) =>
      analyzeApi.line({
        line,
        native_lang: nativeLang || user?.native_lang || 'en',
        learning_lang: learningLang || user?.learning_lang || 'en',
        song_id: parseInt(id),
        line_index: lineIndex,
      }, { signal }),
    onSuccess: (res) => setAnalysis(res.data),
    onError: (error) => {
      if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
        toast.error('Failed to analyze line')
      }
    },
  })

  const interlinearMutation = useMutation({
    mutationFn: ({ line, lineIndex }) =>
      analyzeApi.interlinear({
        line,
        native_lang: nativeLang || user?.native_lang || 'en',
        learning_lang: learningLang || user?.learning_lang || 'en',
        song_id: parseInt(id),
        line_index: lineIndex,
      }),
    onSuccess: (res) => setInterlinearTokens(res.data?.tokens || []),
    onError: (error) => {
      const status = error?.response?.status
      const detail = error?.response?.data?.detail
      toast.error(detail || (status ? `Interlinear failed (${status})` : 'Interlinear failed'))
    },
  })

  useEffect(() => {
    setInterlinearTokens(null)
  }, [selectedLine])

  // Parse lyrics into lines
  const lines = song?.lyrics?.split('\n').filter((line) => line.trim()) || []

  // Cancel any pending hover analysis
  const cancelPendingAnalysis = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  // Handle mouse enter on a line (debounced hover)
  const handleLineMouseEnter = useCallback((line, index) => {
    // Cancel any pending analysis from previous hover
    cancelPendingAnalysis()

    // Set up debounced analysis
    hoverTimeoutRef.current = setTimeout(() => {
      if (selectedLine !== index) {
        setSelectedLine(index)
        setAnalysis(null)

        // Create new AbortController for this request
        abortControllerRef.current = new AbortController()
        analyzeMutation.mutate({
          line,
          lineIndex: index,
          signal: abortControllerRef.current.signal,
        })
      }
    }, HOVER_DELAY)
  }, [selectedLine, cancelPendingAnalysis, analyzeMutation])

  // Handle mouse leave
  const handleLineMouseLeave = useCallback(() => {
    cancelPendingAnalysis()
  }, [cancelPendingAnalysis])

  // Handle click to toggle selection
  const handleLineClick = useCallback((line, index) => {
    cancelPendingAnalysis()

    if (selectedLine === index) {
      setSelectedLine(null)
      setAnalysis(null)
      return
    }

    setSelectedLine(index)
    setAnalysis(null)
    abortControllerRef.current = new AbortController()
    analyzeMutation.mutate({
      line,
      lineIndex: index,
      signal: abortControllerRef.current.signal,
    })
  }, [selectedLine, cancelPendingAnalysis, analyzeMutation])

  const handleSpeak = async (text) => {
    setIsSpeaking(true)
    try {
      const response = await voiceApi.speak({ text, language: learningLang || user?.learning_lang || 'en' })
      if (audioRef.current) {
        audioRef.current.src = response.data.audio_url
        audioRef.current.play()
      }
    } catch (error) {
      // Fallback: browser TTS (works even if server-side TTS isn't configured).
      try {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel()
          const u = new SpeechSynthesisUtterance(text)
          u.lang = learningLang || user?.learning_lang || 'en'
          window.speechSynthesis.speak(u)
          toast('Using browser voice', { duration: 1500 })
          return
        }
      } catch {
        // ignore fallback errors
      }
      const status = error?.response?.status
      const detail = error?.response?.data?.detail
      toast.error(detail || (status ? `Failed to generate audio (${status})` : 'Failed to generate audio'))
    } finally {
      setIsSpeaking(false)
    }
  }

  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  const handleSaveWord = async (word, meaning) => {
    setSavingWord(true)
    try {
      const baseContext = lines[selectedLine] || ''
      const re = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i')
      const context = baseContext ? baseContext.replace(re, (m) => `[${m}]`) : ''
      await vocabularyApi.create({
        word,
        translation: meaning,
        source_lang: learningLang || user?.learning_lang || 'en',
        target_lang: nativeLang || user?.native_lang || 'en',
        context,
        song_id: parseInt(id),
      })
      toast.success('Word saved to vocabulary!')
    } catch (error) {
      toast.error('Failed to save word')
    } finally {
      setSavingWord(false)
    }
  }

  if (songLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!song) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">{t('song.notFound', uiLang)}</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Hidden audio element */}
      <audio ref={audioRef} className="hidden" />

      {showWhy && location?.state?.discoverReason && (
        <div className="mb-6 bg-primary-50 border border-primary-200 rounded-xl p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-primary-800 mb-1">{t('song.whyIconic', uiLang)}</div>
              <div className="text-sm text-primary-800">{location.state.discoverReason}</div>
            </div>
            <button
              type="button"
              onClick={() => setShowWhy(false)}
              className="p-2 text-primary-700 hover:text-primary-900"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('common.back', uiLang)}
        </button>
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isSaved
            ? 'bg-red-50 text-red-600 hover:bg-red-100'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          {isSaved ? t('song.saved', uiLang) : t('song.save', uiLang)}
        </button>
      </div>

      {/* Song info */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{song.title}</h1>
        <p className="text-lg text-gray-600">{song.artist}</p>
        {song.album && (
          <p className="text-sm text-gray-500 mt-1">{song.album}</p>
        )}

        {/* Story button */}
        <button
          type="button"
          onClick={async () => {
            if (showStory) {
              setShowStory(false)
              return
            }
            if (story) {
              setShowStory(true)
              return
            }
            setStoryLoading(true)
            setShowStory(true)
            try {
              const res = await songsApi.getStory(id, uiLang)
              setStory(res.data.story)
            } catch (error) {
              const detail = error?.response?.data?.detail
              toast.error(detail || 'Could not load story')
              setShowStory(false)
            } finally {
              setStoryLoading(false)
            }
          }}
          disabled={storyLoading}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm disabled:opacity-50"
        >
          <BookOpen className="w-4 h-4" />
          {t('song.storyButton', uiLang)}
          {showStory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Story content */}
        {showStory && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {t('song.storyTitle', uiLang)}
            </h3>
            {storyLoading ? (
              <div className="flex items-center gap-2 text-amber-700">
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('song.storyLoading', uiLang)}
              </div>
            ) : (
              <div className="text-amber-900 text-sm leading-relaxed whitespace-pre-line">
                {story}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-primary-50 rounded-lg p-4 mb-6 text-sm text-primary-700">
        <strong>{t('song.tip', uiLang)}:</strong> {t('song.tipText', uiLang)}
      </div>

      {/* Lyrics */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="divide-y">
          {lines.map((line, index) => (
            <div
              key={index}
              onClick={() => handleLineClick(line, index)}
              onMouseEnter={() => handleLineMouseEnter(line, index)}
              onMouseLeave={handleLineMouseLeave}
              onDoubleClick={() => handleSpeak(line)}
              className={`lyric-line ${selectedLine === index ? 'active' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="flex-1">{line}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSpeak(line)
                  }}
                  disabled={isSpeaking}
                  className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
                >
                  {isSpeaking && selectedLine === index ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Analysis panel */}
              {selectedLine === index && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {analyzeMutation.isPending ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                      <span className="ml-2 text-gray-500">{t('song.analyzing', uiLang)}</span>
                    </div>
                  ) : analysis ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (interlinearTokens) {
                              setInterlinearTokens(null)
                              return
                            }
                            interlinearMutation.mutate({ line, lineIndex: index })
                          }}
                          disabled={interlinearMutation.isPending}
                          className="text-xs px-3 py-1 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          {interlinearMutation.isPending
                            ? t('common.loading', uiLang)
                            : interlinearTokens
                              ? t('song.hideInterlinear', uiLang)
                              : t('song.wordByWord', uiLang)}
                        </button>
                      </div>

                      {interlinearTokens && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                          <div className="flex flex-wrap gap-x-2 gap-y-2">
                            {interlinearTokens.map((token, ti) => (
                              <span
                                key={ti}
                                className="inline-flex items-baseline gap-1 px-2 py-1 bg-white border border-gray-200 rounded-lg"
                              >
                                <span className="font-semibold text-gray-900">{token.orig}</span>
                                {token.trans ? (
                                  <span className="text-sm text-primary-700">{token.trans}</span>
                                ) : null}
                                {token.trans && /[A-Za-zÀ-žА-Яа-я0-9]/.test(token.orig || '') ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleSaveWord(token.orig, token.trans)
                                    }}
                                    disabled={savingWord}
                                    className="ml-1 p-0.5 text-gray-400 hover:text-primary-500 disabled:opacity-50"
                                    title={t('song.saveToVocab', uiLang)}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                ) : null}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Translation */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">
                          {t('song.translation', uiLang)}
                        </h4>
                        <p className="text-gray-600">{analysis.translation}</p>
                      </div>

                      {/* Grammar */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">
                          {t('song.grammar', uiLang)}
                        </h4>
                        <p className="text-gray-600 text-sm">{analysis.grammar}</p>
                      </div>

                      {analysis.vocabulary?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            {t('common.vocabulary', uiLang)}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {analysis.vocabulary.map((item, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"
                              >
                                <div>
                                  <span className="font-medium text-gray-900">
                                    {item.word}
                                  </span>
                                  <span className="text-gray-500 mx-1">-</span>
                                  <span className="text-gray-600">{item.meaning}</span>
                                  {item.part_of_speech && (
                                    <span className="text-xs text-gray-400 ml-1">
                                      ({item.part_of_speech})
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleSaveWord(item.word, item.meaning)
                                  }}
                                  disabled={savingWord}
                                  className="p-1 text-gray-400 hover:text-primary-500 transition-colors"
                                  title={t('song.saveToVocab', uiLang)}
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SongView
