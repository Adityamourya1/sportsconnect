import React, { useState, useEffect } from 'react'
import { leagueManagementService, notificationService, userService } from '../services/api'
import toast from 'react-hot-toast'
import { FaPlus, FaCheck, FaTimes, FaPaperPlane, FaSync, FaTrash } from 'react-icons/fa'

export default function LeaguesManagementPage() {
  const userId = localStorage.getItem('user_id')
  const [userRole, setUserRole] = useState(null)

  const [activeTab, setActiveTab] = useState('browse') // browse, my-applications, owned
  const [ownedLeagues, setOwnedLeagues] = useState([])
  const [availableLeagues, setAvailableLeagues] = useState([])
  const [myApplications, setMyApplications] = useState([])
  const [selectedLeague, setSelectedLeague] = useState(null)
  const [leagueApplications, setLeagueApplications] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showApplicationsModal, setShowApplicationsModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sport: '',
    logo_url: ''
  })

  // Load data on mount and when page regains focus
  useEffect(() => {
    if (userId) {
      fetchUserRole()
    }
  }, [userId])

  // Also refetch role when page becomes visible (user returns from profile)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && userId) {
        fetchUserRole()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [userId])

  const fetchUserRole = async () => {
    try {
      const res = await userService.getProfile(userId)
      const role = res.data.role || 'user'
      setUserRole(role)
      // Load data after role is determined
      loadAllData(role)
    } catch (err) {
      console.error('Failed to load user role:', err)
      // Load data with default role
      loadAllData('user')
    }
  }

  const loadAllData = async (role) => {
    setIsLoading(true)
    try {
      // Load available leagues
      const availableRes = await leagueManagementService.getAvailableLeagues()
      setAvailableLeagues(availableRes.data.leagues || [])

      // Load user's applications
      const appRes = await leagueManagementService.getMyLeagueApplications(userId)
      setMyApplications(appRes.data.applications || [])

      // Load owned leagues if user is scout/owner
      if (role === 'scout' || role === 'league_owner') {
        const ownedRes = await leagueManagementService.getOwnedLeagues(userId)
        setOwnedLeagues(ownedRes.data.owned_leagues || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load leagues')
    }
    setIsLoading(false)
  }

  const loadData = async () => {
    loadAllData(userRole)
  }

  const handleCreateLeague = async () => {
    if (!formData.name || !formData.description || !formData.sport) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      await leagueManagementService.createLeague(userId, formData)
      toast.success('League created successfully!')
      setFormData({ name: '', description: '', sport: '', logo_url: '' })
      setShowCreateModal(false)
      loadData()
    } catch (error) {
      toast.error('Failed to create league')
      console.error(error)
    }
  }

  const handleApplyToLeague = async (leagueId) => {
    try {
      await leagueManagementService.applyToLeague(userId, leagueId)
      toast.success('Application submitted!')
      loadData()
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(error.response.data.detail)
      } else {
        toast.error('Failed to apply to league')
      }
    }
  }

  const viewApplications = async (league) => {
    setSelectedLeague(league)
    try {
      const res = await leagueManagementService.getLeagueApplications(userId, league._id)
      setLeagueApplications(res.data.applications || [])
      setShowApplicationsModal(true)
    } catch (error) {
      toast.error('Failed to load applications')
    }
  }

  const handleAcceptApplication = async (playerId) => {
    try {
      await leagueManagementService.acceptApplication(userId, selectedLeague._id, playerId)
      toast.success('Application accepted!')
      setLeagueApplications(prev =>
        prev.map(app => app.user_id === playerId ? { ...app, status: 'accepted' } : app)
      )
      loadData()
    } catch (error) {
      toast.error('Failed to accept application')
    }
  }

  const handleRejectApplication = async (playerId) => {
    try {
      await leagueManagementService.rejectApplication(userId, selectedLeague._id, playerId)
      toast.success('Application rejected!')
      setLeagueApplications(prev =>
        prev.map(app => app.user_id === playerId ? { ...app, status: 'rejected' } : app)
      )
      loadData()
    } catch (error) {
      toast.error('Failed to reject application')
    }
  }

  const handleDeleteLeague = async (leagueId) => {
    if (!window.confirm('Are you sure you want to delete this league? This action cannot be undone.')) {
      return
    }
    try {
      await leagueManagementService.deleteLeague(userId, leagueId)
      toast.success('League deleted successfully')
      loadData()
    } catch (error) {
      toast.error('Failed to delete league')
      console.error(error)
    }
  }

  const getApplicationStatus = (leagueId) => {
    const app = myApplications.find(a => a.league_id === leagueId)
    return app?.status || null
  }

  const isAlreadyApplied = (leagueId) => {
    return myApplications.some(a => a.league_id === leagueId)
  }

  return (
    <div className="ml-64 pt-24 min-h-screen text-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-gray-900">Leagues Management</h1>
            <p className="text-gray-600">Manage your leagues and applications</p>
          </div>
          <button
            onClick={() => fetchUserRole()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
            title="Refresh role and data"
          >
            <FaSync size={16} />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('browse')}
            className={`pb-2 px-4 transition ${
              activeTab === 'browse'
                ? 'border-b-2 border-green-500 text-green-600'
                : 'text-gray-600 hover:text-gray-700'
            }`}
          >
            Browse Leagues
          </button>
          <button
            onClick={() => setActiveTab('my-applications')}
            className={`pb-2 px-4 transition ${
              activeTab === 'my-applications'
                ? 'border-b-2 border-green-500 text-green-600'
                : 'text-gray-600 hover:text-gray-700'
            }`}
          >
            My Applications ({myApplications.length})
          </button>
          <button
            onClick={() => setActiveTab('owned')}
            className={`pb-2 px-4 transition ${
              activeTab === 'owned'
                ? 'border-b-2 border-green-500 text-green-600'
                : 'text-gray-600 hover:text-gray-700'
            }`}
          >
            My Leagues ({ownedLeagues.length})
          </button>
        </div>

        {/* Browse Leagues Tab */}
        {activeTab === 'browse' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full text-center py-8">Loading leagues...</div>
              ) : availableLeagues.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-400">
                  No leagues available 📋
                </div>
              ) : (
                availableLeagues.map(league => (
                  <div
                    key={league._id}
                    className="bg-white rounded-lg p-6 hover:shadow-lg transition border border-gray-200"
                  >
                    {league.logo_url && (
                      <img
                        src={league.logo_url}
                        alt={league.name}
                        className="w-full h-40 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h3 className="text-xl font-bold mb-2">{league.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{league.description}</p>
                    <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                      <span>🏆 {league.sport}</span>
                      <span>👥 {league.players_count} players</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-4">
                      Owner: <span className="text-green-600 font-semibold">{league.owner_name}</span>
                    </p>

                    {isAlreadyApplied(league._id) ? (
                      <div className="w-full py-2 px-4 rounded-lg bg-gray-100 text-center text-sm border border-gray-300">
                        Status: <span className="font-semibold capitalize text-gray-900">{getApplicationStatus(league._id)}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApplyToLeague(league._id)}
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                      >
                        <FaPaperPlane size={14} />
                        Apply to League
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* My Applications Tab */}
        {activeTab === 'my-applications' && (
          <div>
            {isLoading ? (
              <div className="text-center py-8">Loading applications...</div>
            ) : myApplications.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                You haven't applied to any leagues yet 📌
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myApplications.map(app => (
                  <div key={app.league_id} className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition">
                    {app.logo_url && (
                      <img
                        src={app.logo_url}
                        alt={app.league_name}
                        className="w-full h-40 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{app.league_name}</h3>
                    <p className="text-gray-700 text-sm mb-4">🏆 {app.sport}</p>
                    <p className="text-sm text-gray-600 mb-3">
                      Applied: {new Date(app.applied_at).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">Status:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          app.status === 'accepted'
                            ? 'bg-green-600 text-white'
                            : app.status === 'rejected'
                            ? 'bg-red-600 text-white'
                            : 'bg-yellow-600 text-white'
                        }`}
                      >
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Owned Leagues Tab */}
        {activeTab === 'owned' && (
          <div>
            {!userRole || (userRole !== 'scout' && userRole !== 'league_owner') ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">🔒 Role Required</h3>
                <p className="text-yellow-700">
                  To create and manage leagues, you need to set your role to <strong>Scout</strong> or <strong>League Owner</strong>.
                </p>
                <a href="/profile" className="text-yellow-600 underline font-semibold mt-2 inline-block">
                  Go to Profile to Set Your Role →
                </a>
              </div>
            ) : (
              <div className="mb-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-lg transition flex items-center gap-2 shadow-md"
                >
                  <FaPlus size={16} />
                  Create New League
                </button>
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-8 text-gray-700">Loading leagues...</div>
            ) : ownedLeagues.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                You haven't created any leagues yet 🏆
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ownedLeagues.map(league => (
                  <div key={league._id} className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition">
                    <h3 className="text-xl font-bold mb-2">{league.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{league.description}</p>
                    <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                      <span>🏆 {league.sport}</span>
                      <span>👥 {league.players_count} players</span>
                    </div>
                    <div className="flex items-center gap-2 mb-4 p-3 bg-yellow-100 rounded border border-yellow-300">
                      <span className="text-yellow-700 font-semibold">
                        {league.applications_count}
                      </span>
                      <span className="text-yellow-700 text-sm">pending applications</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewApplications(league)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition"
                      >
                        View Applications
                      </button>
                      <button
                        onClick={() => handleDeleteLeague(league._id)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition flex items-center gap-2"
                        title="Delete league"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create League Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Create New League</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900">League Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Cricket Pro League"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-50 text-gray-900 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900">Description *</label>
                  <textarea
                    placeholder="Describe your league..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full bg-gray-50 text-gray-900 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900">Sport *</label>
                  <input
                    type="text"
                    placeholder="e.g., cricket, football, basketball"
                    value={formData.sport}
                    onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                    className="w-full bg-gray-50 text-gray-900 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900">Logo URL (optional)</label>
                  <input
                    type="text"
                    placeholder="https://example.com/logo.png"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    className="w-full bg-gray-50 text-gray-900 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-300"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({ name: '', description: '', sport: '', logo_url: '' })
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-2 rounded-lg transition border border-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateLeague}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition"
                >
                  Create League
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Applications Modal */}
        {showApplicationsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">
                {selectedLeague?.name} - Applications ({leagueApplications.length})
              </h2>

              {leagueApplications.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No applications yet</p>
              ) : (
                <div className="space-y-4">
                  {leagueApplications.map(app => (
                    <div
                      key={app.user_id}
                      className="bg-gray-700 p-4 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        {app.profile_picture && (
                          <img
                            src={app.profile_picture}
                            alt={app.username}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <p className="font-semibold">{app.username}</p>
                          <p className="text-sm text-gray-400">
                            Applied: {new Date(app.applied_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {app.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptApplication(app.user_id)}
                            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition"
                          >
                            <FaCheck size={16} />
                          </button>
                          <button
                            onClick={() => handleRejectApplication(app.user_id)}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition"
                          >
                            <FaTimes size={16} />
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            app.status === 'accepted'
                              ? 'bg-green-600 text-white'
                              : 'bg-red-600 text-white'
                          }`}
                        >
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowApplicationsModal(false)}
                className="w-full mt-6 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
