import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { songsApi, discoverApi } from '../api/client'
import { useLang } from '../stores/useLang'
import toast from 'react-hot-toast'
import { Search as SearchIcon, Music, Plus, Loader2, Sparkles } from 'lucide-react'

function Search() {
  const navigate = useNavigate()
  const { learningLang } = useLang()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [importingId, setImportingId] = useState(null)
  const [isSurprising, setIsSurprising] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const response = await songsApi.search(query)
      setResults(response.data)
      if (response.data.length === 0) {
        toast('No songs found', { icon: '🔍' })
      }
    } catch (error) {
      const status = error?.response?.status
      const detail = error?.response?.data?.detail
      toast.error(detail || (status ? `Search failed (${status})` : 'Search failed'))
    } finally {
      setIsSearching(false)
    }
  }

  const handleImport = async (song) => {
    setImportingId(song.id)
    try {
      const response = await songsApi.import({
        title: song.trackName,
        artist: song.artistName,
      })
      toast.success('Song imported!')
      navigate(`/song/${response.data.id}`)
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Import failed')
    } finally {
      setImportingId(null)
    }
  }

  const handleSurprise = async () => {
    setIsSurprising(true)
    try {
      const res = await discoverApi.randomIconic({ learning_lang: learningLang })
      const song = res.data?.song
      const reason = res.data?.reason
      if (!song?.id) {
        toast.error(reason || 'Could not find a song right now. Try again.')
        return
      }
      toast.success('Here’s a classic—imported for you!')
      navigate(`/song/${song.id}`, { state: { discoverReason: reason, discoverSource: res.data?.source } })
    } catch (error) {
      const status = error?.response?.status
      const detail = error?.response?.data?.detail
      toast.error(detail || (status ? `Surprise failed (${status})` : 'Surprise failed'))
    } finally {
      setIsSurprising(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find a Song</h1>
        <p className="text-gray-600">Search for songs to start learning</p>
      </div>

      <div className="flex items-center justify-center mb-4">
        <button
          type="button"
          onClick={handleSurprise}
          disabled={isSurprising}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isSurprising ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Surprise me (iconic song)
        </button>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by song title or artist..."
            className="w-full pl-12 pr-32 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            {isSearching ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Results ({results.length})
          </h2>
          {results.map((song) => (
            <div
              key={song.id}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Music className="w-6 h-6 text-primary-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{song.trackName}</h3>
                  <p className="text-sm text-gray-500">
                    {song.artistName}
                    {song.albumName && ` • ${song.albumName}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleImport(song)}
                disabled={importingId === song.id}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {importingId === song.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Import
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {results.length === 0 && !isSearching && (
        <div className="text-center py-16">
          <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            Search for a song to get started
          </p>
        </div>
      )}
    </div>
  )
}

export default Search
