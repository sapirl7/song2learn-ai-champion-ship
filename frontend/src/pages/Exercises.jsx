import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { userSongsApi, songsApi, exercisesApi } from '../api/client'
import { useLang } from '../stores/useLang'
import toast from 'react-hot-toast'
import {
  GraduationCap,
  Music,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  ChevronRight,
} from 'lucide-react'

function Exercises() {
  const { nativeLang, learningLang } = useLang()
  const [songs, setSongs] = useState([])
  const [selectedSong, setSelectedSong] = useState(null)
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [userTranslation, setUserTranslation] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isChecking, setIsChecking] = useState(false)

  // Get lines from selected song
  const lines = selectedSong?.lyrics?.split('\n').filter((line) => line.trim()) || []
  const currentLine = lines[currentLineIndex]

  useEffect(() => {
    loadSavedSongs()
  }, [])

  const loadSavedSongs = async () => {
    try {
      const response = await userSongsApi.getSaved()
      setSongs(response.data)
    } catch (error) {
      toast.error('Failed to load songs')
    } finally {
      setIsLoading(false)
    }
  }

  const selectSong = async (song) => {
    setSelectedSong(song)
    setCurrentLineIndex(0)
    setUserTranslation('')
    setFeedback(null)
  }

  const handleCheck = async (e) => {
    e.preventDefault()
    if (!userTranslation.trim()) return

    setIsChecking(true)
    setFeedback(null)

    try {
      const response = await exercisesApi.checkTranslation({
        song_id: selectedSong.id,
        line_index: currentLineIndex,
        original: currentLine,
        user_translation: userTranslation,
        native_lang: nativeLang,
        learning_lang: learningLang,
      })
      setFeedback(response.data)
    } catch (error) {
      const status = error?.response?.status
      const detail = error?.response?.data?.detail
      toast.error(detail || (status ? `Failed to check translation (${status})` : 'Failed to check translation'))
    } finally {
      setIsChecking(false)
    }
  }

  const nextLine = () => {
    if (currentLineIndex < lines.length - 1) {
      setCurrentLineIndex(currentLineIndex + 1)
      setUserTranslation('')
      setFeedback(null)
    }
  }

  const prevLine = () => {
    if (currentLineIndex > 0) {
      setCurrentLineIndex(currentLineIndex - 1)
      setUserTranslation('')
      setFeedback(null)
    }
  }

  const resetExercise = () => {
    setCurrentLineIndex(0)
    setUserTranslation('')
    setFeedback(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  // Song selection screen
  if (!selectedSong) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <GraduationCap className="w-8 h-8 text-primary-500" />
          <h1 className="text-3xl font-bold text-gray-900">Translation Exercises</h1>
        </div>

        {songs.length === 0 ? (
          <div className="text-center py-16">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-700 mb-2">
              No songs to practice with
            </h2>
            <p className="text-gray-500 mb-6">
              Save some songs first to practice translation
            </p>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Music className="w-5 h-5" />
              Find Songs
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              Choose a song to practice translating its lyrics:
            </p>
            <div className="grid gap-3">
              {songs.map((song) => (
                <button
                  key={song.id}
                  onClick={() => selectSong(song)}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Music className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{song.title}</h3>
                      <p className="text-sm text-gray-500">{song.artist}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  // Exercise screen
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setSelectedSong(null)}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back to songs
        </button>
        <button
          onClick={resetExercise}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <RefreshCw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Song info */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-gray-900">{selectedSong.title}</h2>
        <p className="text-gray-500">{selectedSong.artist}</p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Line {currentLineIndex + 1} of {lines.length}</span>
          <span>{Math.round(((currentLineIndex + 1) / lines.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 transition-all duration-300"
            style={{ width: `${((currentLineIndex + 1) / lines.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current line */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border">
        <p className="text-sm text-gray-500 mb-2">Translate this line:</p>
        <p className="text-xl font-medium text-gray-900">{currentLine}</p>
      </div>

      {/* Translation input */}
      <form onSubmit={handleCheck} className="mb-6">
        <textarea
          value={userTranslation}
          onChange={(e) => setUserTranslation(e.target.value)}
          placeholder="Type your translation here..."
          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          rows={3}
          disabled={isChecking}
        />
        <button
          type="submit"
          disabled={isChecking || !userTranslation.trim()}
          className="mt-3 w-full py-3 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          {isChecking ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Checking...
            </span>
          ) : (
            'Check Translation'
          )}
        </button>
      </form>

      {/* Feedback */}
      {feedback && (
        <div
          className={`rounded-xl p-6 mb-6 ${
            feedback.is_correct
              ? 'bg-green-50 border border-green-200'
              : 'bg-orange-50 border border-orange-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {feedback.is_correct ? (
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-orange-500 flex-shrink-0" />
            )}
            <div>
              <h3
                className={`font-semibold mb-2 ${
                  feedback.is_correct ? 'text-green-700' : 'text-orange-700'
                }`}
              >
                {feedback.is_correct ? 'Correct!' : 'Not quite right'}
              </h3>
              <p className="text-gray-600 mb-3">{feedback.feedback}</p>
              <div className="bg-white rounded-lg p-3">
                <p className="text-sm text-gray-500 mb-1">Suggested translation:</p>
                <p className="text-gray-900">{feedback.suggested_translation}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={prevLine}
          disabled={currentLineIndex === 0}
          className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={nextLine}
          disabled={currentLineIndex === lines.length - 1}
          className="flex-1 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          Next Line
        </button>
      </div>
    </div>
  )
}

export default Exercises
