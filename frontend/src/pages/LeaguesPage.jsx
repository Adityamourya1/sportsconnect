import React, { useState, useEffect } from 'react'
import { leagueService, userService } from '../services'
import { FaTrophy } from 'react-icons/fa'
import toast from 'react-hot-toast'

const LeaguesPage = () => {
  const [leagues, setLeagues] = useState([])
  const [recommendedLeagues, setRecommendedLeagues] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [userInterests, setUserInterests] = useState([])
  const userId = localStorage.getItem('user_id')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // Load all leagues
      const leaguesResponse = await leagueService.getAllLeagues()
      setLeagues(leaguesResponse.data)
      
      // Load user profile to get interests
      const profileResponse = await userService.getProfile(userId)
      const interests = profileResponse.data.interests || []
      setUserInterests(interests)
      
      // Load recommended leagues based on interests
      if (interests.length > 0) {
        try {
          const recommendedResponse = await leagueService.getRecommendedLeagues(userId)
          setRecommendedLeagues(recommendedResponse.data)
        } catch (error) {
          console.log('Could not load recommended leagues')
        }
      }
    } catch (error) {
      toast.error('Failed to load leagues')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollowLeague = async (leagueId) => {
    try {
      await leagueService.followLeague(leagueId, userId)
      toast.success('League followed!')
      loadData()
    } catch (error) {
      toast.error('Failed to follow league')
    }
  }

  const handleUnfollowLeague = async (leagueId) => {
    try {
      await leagueService.unfollowLeague(leagueId, userId)
      toast.success('League unfollowed!')
      loadData()
    } catch (error) {
      toast.error('Failed to unfollow league')
    }
  }

  const LeagueCard = ({ league }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-green-600">{league.name}</h3>
        <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs rounded-full font-semibold">
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
        onClick={() => league.is_following ? handleUnfollowLeague(league.id) : handleFollowLeague(league.id)}
        className={`w-full px-4 py-2 rounded-lg transition font-semibold ${
          league.is_following
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-green-500 text-white hover:bg-green-600'
        }`}
      >
        {league.is_following ? 'Unfollow League' : 'Follow League'}
      </button>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="ml-64 pt-24 p-6 max-w-6xl mx-auto">
      <div className="flex items-center space-x-3 mb-8">
        <FaTrophy size={40} className="text-yellow-500" />
        <h1 className="text-4xl font-bold">Sports Leagues</h1>
      </div>

      {/* Recommended Leagues Section */}
      {recommendedLeagues.length > 0 && (
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-green-600">
              ⭐ Recommended for You
            </h2>
            <p className="text-gray-600 text-sm">
              Based on your interests: {userInterests.join(', ')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {recommendedLeagues.map((league) => (
              <LeagueCard key={league.id} league={league} />
            ))}
          </div>
          
          <hr className="my-8" />
        </div>
      )}

      {/* All Leagues Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">All Leagues</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leagues.map((league) => (
            <LeagueCard key={league.id} league={league} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default LeaguesPage
