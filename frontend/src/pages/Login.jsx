import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../stores/useUser'
import { useLang } from '../stores/useLang'
import config from '../config'
import { t } from '../i18n/translations'
import toast from 'react-hot-toast'
import { Music, Mail, Lock, Sparkles } from 'lucide-react'

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

function Login() {
  const navigate = useNavigate()
  const { login, demoLogin, googleLogin } = useUser()
  const { nativeLang, learningLang } = useLang()
  // Always use English on login page for judges/demo
  const lang = 'en'
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoLoading, setIsDemoLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  useEffect(() => {
    if (!config.enableGoogleAuth) return
    if (document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`)) return
    const s = document.createElement('script')
    s.src = GOOGLE_SCRIPT_SRC
    s.async = true
    s.defer = true
    document.body.appendChild(s)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(formData.email, formData.password)
      toast.success('Welcome back!')
      navigate('/search')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setIsDemoLoading(true)
    try {
      await demoLogin()
      toast.success('Welcome, Judge! Explore the app.')
      navigate('/search')
    } catch (error) {
      toast.error('Demo login failed')
    } finally {
      setIsDemoLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    try {
      if (!window.google || !window.google.accounts?.id) {
        throw new Error('Google auth not available')
      }
      const idToken = await new Promise((resolve, reject) => {
        window.google.accounts.id.initialize({
          client_id: config.googleClientId,
          callback: (response) => {
            if (response?.credential) resolve(response.credential)
            else reject(new Error('No credential returned'))
          },
        })
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            reject(new Error('Google sign-in dismissed'))
          }
        })
      })

      await googleLogin(idToken, nativeLang, learningLang)
      toast.success('Welcome!')
      navigate('/search')
    } catch (error) {
      toast.error(error.message || 'Google login failed')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Music className="w-10 h-10 text-primary-500" />
            <span className="text-2xl font-bold text-gray-900">Song2Learn</span>
          </div>
          <p className="text-gray-600">Learn languages through music</p>
        </div>

        {/* Google Login */}
        {config.enableGoogleAuth && (
          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full mb-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isGoogleLoading ? t('common.loading', lang) : 'Continue with Google'}
          </button>
        )}

        {/* Divider */}
        {config.enableGoogleAuth && (
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">{t('common.or', lang)}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('login.email', lang)}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('login.password', lang)}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t('common.loading', lang) : t('login.title', lang)}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">{t('common.or', lang)}</span>
          </div>
        </div>

        {/* Demo Login Button */}
        <button
          onClick={handleDemoLogin}
          disabled={isDemoLoading}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          <Sparkles className="w-6 h-6" />
          {isDemoLoading ? t('common.loading', lang) : t('login.demoAccess', lang)}
        </button>
        <p className="mt-2 text-center text-sm text-gray-500">
          {t('login.oneClick', lang)}
        </p>
      </div>
    </div>
  )
}

export default Login
