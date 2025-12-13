import { useState, useEffect } from 'react'
import { vocabularyApi } from '../api/client'
import toast from 'react-hot-toast'
import { BookOpen, Plus, Trash2, Loader2, X } from 'lucide-react'

function Vocabulary() {
  const [words, setWords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newWord, setNewWord] = useState({ word: '', translation: '', context: '' })
  const [isAdding, setIsAdding] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

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
      const response = await vocabularyApi.create(newWord)
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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary-500" />
          <h1 className="text-3xl font-bold text-gray-900">My Vocabulary</h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Word
        </button>
      </div>

      {words.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-700 mb-2">
            Your vocabulary is empty
          </h2>
          <p className="text-gray-500 mb-6">
            Add words while learning songs or manually
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Your First Word
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
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-lg font-semibold text-gray-900">
                    {word.word}
                  </span>
                  <span className="text-gray-400">—</span>
                  <span className="text-gray-600">{word.translation}</span>
                </div>
                {word.context && (
                  <p className="text-sm text-gray-500 italic">"{word.context}"</p>
                )}
              </div>
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
          ))}
        </div>
      )}

      {/* Add Word Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add New Word</h2>
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
                  Word *
                </label>
                <input
                  type="text"
                  required
                  value={newWord.word}
                  onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter word"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Translation *
                </label>
                <input
                  type="text"
                  required
                  value={newWord.translation}
                  onChange={(e) => setNewWord({ ...newWord, translation: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter translation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Context (optional)
                </label>
                <input
                  type="text"
                  value={newWord.context}
                  onChange={(e) => setNewWord({ ...newWord, context: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Example sentence or context"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                >
                  {isAdding ? 'Adding...' : 'Add Word'}
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
