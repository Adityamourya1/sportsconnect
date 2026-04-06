import React, { useState } from 'react'
import { authService } from '../services'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    try {
      setIsLoading(true)
      const response = await authService.signup({
        username: formData.username,
        email: formData.email,
        password: formData.password
      })
      
      // Store tokens
      localStorage.setItem('access_token', response.data.access_token)
      localStorage.setItem('refresh_token', response.data.refresh_token)
      localStorage.setItem('user_id', response.data.user_id)

      toast.success('Account created successfully!')
      navigate('/home')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Signup failed')
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

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          <h2 className="text-4xl font-bold text-center mb-2">Join SportsNet</h2>
          <p className="text-gray-600 text-center mb-8">Create an account to get started</p>

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="johndoe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 transition"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-green-500 font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
