import React, { useState, useEffect } from 'react'
import { leagueService } from '../services'
import { FaTrophy } from 'react-icons/fa'
import toast from 'react-hot-toast'

const LeaguesPage = () => {
  const [leagues, setLeagues] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const userId = localStorage.getItem('user_id')

  useEffect(() => {
    loadLeagues()
  }, [])

  const loadLeagues = async () => {
    try {
      setIsLoading(true)
      const response = await leagueService.getAllLeagues()
      setLeagues(response.data)
    } catch (error) {
      toast.error('Failed to load leagues')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollowLeague = async (leagueId) => {
    try {
      await leagueService.followLeague(leagueId, userId)
      toast.success('League followed!')
      loadLeagues()
    } catch (error) {
      toast.error('Failed to follow league')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="ml-64 p-6 max-w-6xl mx-auto">
      <div className="flex items-center space-x-3 mb-8">
        <FaTrophy size={40} className="text-yellow-500" />
        <h1 className="text-4xl font-bold">Sports Leagues</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leagues.map((league) => (
          <div key={league.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-green-600">{league.name}</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                {league.sport}
              </span>
            </div>

            <p className="text-gray-600 mb-4">{league.description}</p>

            <div className="flex gap-4 mb-4 text-sm text-gray-600">
              <div>
                <p className="font-semibold">{league.followers_count}</p>
                <p className="text-xs">Followers</p>
              </div>
              <div>
                <p className="font-semibold">{league.posts_count}</p>
                <p className="text-xs">Posts</p>
              </div>
            </div>

            <button
              onClick={() => handleFollowLeague(league.id)}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
            >
              Follow League
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LeaguesPage
