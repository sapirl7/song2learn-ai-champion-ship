import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { userSongsApi } from '../api/client'
import toast from 'react-hot-toast'
import { Music, Heart, Loader2 } from 'lucide-react'

function Saved() {
  const [songs, setSongs] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSavedSongs()
  }, [])

  const loadSavedSongs = async () => {
    try {
      const response = await userSongsApi.getSaved()
      setSongs(response.data)
    } catch (error) {
      toast.error('Failed to load saved songs')
    } finally {
      setIsLoading(false)
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
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-red-500 fill-current" />
        <h1 className="text-3xl font-bold text-gray-900">Saved Songs</h1>
      </div>

      {songs.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-700 mb-2">
            No saved songs yet
          </h2>
          <p className="text-gray-500 mb-6">
            Save songs while learning to find them here later
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
        <div className="grid gap-4">
          {songs.map((song) => (
            <Link
              key={song.id}
              to={`/song/${song.id}`}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
            >
              <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Music className="w-7 h-7 text-primary-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {song.title}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {song.artist}
                  {song.album && ` • ${song.album}`}
                </p>
              </div>
              <Heart className="w-5 h-5 text-red-500 fill-current flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default Saved
