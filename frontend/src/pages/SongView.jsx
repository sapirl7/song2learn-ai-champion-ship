import { useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { songsApi, userSongsApi, analyzeApi, vocabularyApi } from '../api/client'
import { useUser } from '../stores/useUser'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Heart,
  Volume2,
  Loader2,
  Plus,
} from 'lucide-react'

const HOVER_DELAY = 150 // ms before triggering analysis on hover

function SongView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useUser()
  const audioRef = useRef(null)
  const hoverTimeoutRef = useRef(null)
  const abortControllerRef = useRef(null)

  const [selectedLine, setSelectedLine] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [savingWord, setSavingWord] = useState(false)

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
        native_lang: user?.native_lang || 'en',
        learning_lang: user?.learning_lang || 'en',
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
      const response = await analyzeApi.speak({ text })
      if (audioRef.current) {
        audioRef.current.src = response.data.audio_url
        audioRef.current.play()
      }
    } catch (error) {
      toast.error('Failed to generate audio')
    } finally {
      setIsSpeaking(false)
    }
  }

  const handleSaveWord = async (word, meaning) => {
    setSavingWord(true)
    try {
      await vocabularyApi.create({
        word,
        translation: meaning,
        context: lines[selectedLine],
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
        <p className="text-gray-500">Song not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Hidden audio element */}
      <audio ref={audioRef} className="hidden" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isSaved
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>

      {/* Song info */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{song.title}</h1>
        <p className="text-lg text-gray-600">{song.artist}</p>
        {song.album && (
          <p className="text-sm text-gray-500 mt-1">{song.album}</p>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-primary-50 rounded-lg p-4 mb-6 text-sm text-primary-700">
        <strong>Tip:</strong> Hover over any line for instant analysis, or click to lock it.
        Use the speaker icon to hear pronunciation.
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
                      <span className="ml-2 text-gray-500">Analyzing...</span>
                    </div>
                  ) : analysis ? (
                    <div className="space-y-4">
                      {/* Translation */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">
                          Translation
                        </h4>
                        <p className="text-gray-600">{analysis.translation}</p>
                      </div>

                      {/* Grammar */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">
                          Grammar
                        </h4>
                        <p className="text-gray-600 text-sm">{analysis.grammar}</p>
                      </div>

                      {/* Vocabulary */}
                      {analysis.vocabulary?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Vocabulary
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
                                  title="Save to vocabulary"
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
