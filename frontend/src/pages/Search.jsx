import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { songsApi, discoverApi } from '../api/client'
import { useLang } from '../stores/useLang'
import { t, getLangName } from '../i18n/translations'
import toast from 'react-hot-toast'
import { Search as SearchIcon, Music, Plus, Loader2, Sparkles, HelpCircle } from 'lucide-react'

function Search() {
  const navigate = useNavigate()
  const { learningLang, uiLang } = useLang()
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
        toast(t('search.noResults', uiLang), { icon: '🔍' })
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
      const res = await discoverApi.randomIconic({ learning_lang: learningLang, native_lang: nativeLang })
      const song = res.data?.song
      const reason = res.data?.reason
      if (!song?.id) {
        toast.error(reason || 'Could not find a song right now. Try again.')
        return
      }
      toast.success("Here's a classic—imported for you!")
      navigate(`/song/${song.id}`, { state: { discoverReason: reason, discoverSource: res.data?.source } })
    } catch (error) {
      const status = error?.response?.status
      const detail = error?.response?.data?.detail
      toast.error(detail || (status ? `Surprise failed (${status})` : 'Surprise failed'))
    } finally {
      setIsSurprising(false)
    }
  }

  // Get learning language name in UI language
  const learningLangName = getLangName(learningLang, uiLang)
  const surpriseText = t('search.surpriseMe', uiLang, { lang: learningLangName })

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
          <Music className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('search.title', uiLang)}</h1>
        <p className="text-gray-500">{t('search.subtitle', uiLang)}</p>
      </div>

      {/* Search Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        {/* Search form */}
        <form onSubmit={handleSearch} className="mb-5">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.placeholder', uiLang)}
              className="w-full pl-12 pr-28 py-4 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
            />
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-5 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                t('common.search', uiLang)
              )}
            </button>
          </div>
        </form>

        {/* Divider with "or" */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-sm text-gray-400">{t('common.or', uiLang)}</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Surprise Me Button */}
        <button
          type="button"
          onClick={handleSurprise}
          disabled={isSurprising}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
        >
          {isSurprising ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {surpriseText}
        </button>
      </div>

      {/* Help text - compact */}
      <div className="flex items-start gap-3 bg-blue-50/70 border border-blue-100 rounded-xl px-4 py-3 mb-6">
        <HelpCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">{t('search.helpText', uiLang)}</p>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            {t('search.results', uiLang)} ({results.length})
          </h2>
          {results.map((song) => (
            <div
              key={song.id}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                  <Music className="w-6 h-6 text-primary-600" />
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
                {t('common.import', uiLang)}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {results.length === 0 && !isSearching && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <Music className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-gray-400">{t('search.emptyState', uiLang)}</p>
        </div>
      )}
    </div>
  )
}

export default Search
