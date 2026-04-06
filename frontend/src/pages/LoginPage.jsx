import React, { useState } from 'react'
import { authService } from '../services'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setIsLoading(true)
      const response = await authService.login({ email, password })
      
      // Store tokens
      localStorage.setItem('access_token', response.data.access_token)
      localStorage.setItem('refresh_token', response.data.refresh_token)
      localStorage.setItem('user_id', response.data.user_id)

      toast.success('Logged in successfully!')
      navigate('/home')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-400 to-green-600 items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4">SportsNet</h1>
          <p className="text-2xl mb-8">Connect with Sports Enthusiasts</p>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">⚽</span>
              <span className="text-xl">Cricket, Football, Basketball & More</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🏆</span>
              <span className="text-xl">Follow Your Favorite Leagues</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🤖</span>
              <span className="text-xl">AI-Powered Content Generation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          <h2 className="text-4xl font-bold text-center mb-2">Welcome Back</h2>
          <p className="text-gray-600 text-center mb-8">Sign in to your SportsNet account</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 transition"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-green-500 font-semibold hover:underline"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
