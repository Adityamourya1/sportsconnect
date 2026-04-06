import apiClient from './apiClient'

// Auth API calls
export const authService = {
  signup: (data) => apiClient.post('/auth/signup', data),
  login: (data) => apiClient.post('/auth/login', data),
  getCurrentUser: () => apiClient.get('/auth/me'),
  refreshToken: (refreshToken) =>
    apiClient.post('/auth/refresh', { refresh_token: refreshToken }),
}

// Users API calls
export const userService = {
  getProfile: (userId) => apiClient.get(`/users/${userId}`),
  updateProfile: (userId, data) => apiClient.put(`/users/${userId}`, data),
  followUser: (userId, targetUserId) =>
    apiClient.post(`/users/${userId}/follow/${targetUserId}`),
  unfollowUser: (userId, targetUserId) =>
    apiClient.post(`/users/${userId}/unfollow/${targetUserId}`),
  getFollowers: (userId) => apiClient.get(`/users/${userId}/followers`),
  getFollowing: (userId) => apiClient.get(`/users/${userId}/following`),
  deleteAccount: (userId) => apiClient.delete(`/users/${userId}`),
}

// Posts API calls
export const postService = {
  createPost: (userId, data) => apiClient.post(`/posts/${userId}`, data),
  getPost: (postId) => apiClient.get(`/posts/${postId}`),
  likePost: (postId, userId) =>
    apiClient.post(`/posts/${postId}/like/${userId}`),
  unlikePost: (postId, userId) =>
    apiClient.post(`/posts/${postId}/unlike/${userId}`),
  addComment: (postId, userId, data) =>
    apiClient.post(`/posts/${postId}/comment/${userId}`, data),
  getUserPosts: (userId) => apiClient.get(`/posts/${userId}/posts`),
  deletePost: (postId, userId) =>
    apiClient.delete(`/posts/${postId}/${userId}`),
}

// Feed API calls
export const feedService = {
  getPersonalizedFeed: (userId) => apiClient.get(`/feed/${userId}`),
  getRecommendations: (userId) => apiClient.get(`/feed/${userId}/recommendations`),
  getRecommendedUsers: (userId) => apiClient.get(`/feed/${userId}/recommended-users`),
  likePost: (postId, userId) => apiClient.post(`/posts/${postId}/like/${userId}`),
  unlikePost: (postId, userId) => apiClient.post(`/posts/${postId}/unlike/${userId}`),
}

// Explore API calls
export const exploreService = {
  getTrendingPosts: () => apiClient.get('/explore/trending/posts'),
  getSuggestedUsers: (userId) =>
    apiClient.get(`/explore/suggested-users/${userId}`),
  getTrendingHashtags: () => apiClient.get('/explore/hashtags/trending'),
  search: (query, searchType = 'all') =>
    apiClient.get('/explore/search', { params: { q: query, search_type: searchType } }),
}

// Leagues API calls
export const leagueService = {
  getAllLeagues: () => apiClient.get('/leagues/'),
  getRecommendedLeagues: (userId) =>
    apiClient.get(`/leagues/${userId}/recommended`),
  followLeague: (leagueId, userId) =>
    apiClient.post(`/leagues/${leagueId}/follow/${userId}`),
  unfollowLeague: (leagueId, userId) =>
    apiClient.post(`/leagues/${leagueId}/unfollow/${userId}`),
  getLeaguePosts: (leagueId) =>
    apiClient.get(`/leagues/${leagueId}/posts`),
}

// Notifications API calls
export const notificationService = {
  getNotifications: (userId) =>
    apiClient.get(`/notifications/${userId}`),
  createNotification: (data) =>
    apiClient.post('/notifications/create', data),
  markAsRead: (notificationId) =>
    apiClient.put(`/notifications/${notificationId}/read`),
  getUnreadCount: (userId) =>
    apiClient.get(`/notifications/${userId}/unread-count`),
}

// Messages API calls
export const messageService = {
  sendMessage: (data) => apiClient.post('/messages/send', data),
  getChatMessages: (chatId) =>
    apiClient.get(`/messages/${chatId}`),
  getConversations: (userId) =>
    apiClient.get(`/messages/${userId}/conversations`),
  markMessageAsRead: (messageId) =>
    apiClient.put(`/messages/${messageId}/read`),
}

// AI API calls
export const aiService = {
  generateCaption: (data) =>
    apiClient.post('/ai/generate-caption', data),
  generateHashtags: (data) =>
    apiClient.post('/ai/generate-hashtags', data),
  generateImage: (data) =>
    apiClient.post('/ai/generate-image', data),
  analyzeSentiment: (text) =>
    apiClient.post('/ai/analyze-sentiment', { text }),
}

// Upload API calls
export const uploadService = {
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  uploadProfilePicture: (userId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post(`/upload/profile-picture?user_id=${userId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

// Stories API calls
export const storyService = {
  createStory: (userId, data) =>
    apiClient.post(`/stories/${userId}/create`, data),
  getStoriesFeed: (userId) =>
    apiClient.get(`/stories/${userId}/feed`),
  getUserStories: (userId) =>
    apiClient.get(`/stories/user/${userId}`),
  viewStory: (storyId, viewerId) =>
    apiClient.post(`/stories/${storyId}/view`, { viewer_id: viewerId }),
  deleteStory: (storyId, userId) =>
    apiClient.delete(`/stories/${storyId}`, { params: { user_id: userId } }),
}

// League Management API calls
export const leagueManagementService = {
  setUserRole: (userId, role) =>
    apiClient.post(`/leagues-management/${userId}/set-role/${role}`),
  createLeague: (userId, data) =>
    apiClient.post(`/leagues-management/${userId}/create-league`, data),
  applyToLeague: (userId, leagueId) =>
    apiClient.post(`/leagues-management/${userId}/apply-league/${leagueId}`),
  getLeagueApplications: (userId, leagueId) =>
    apiClient.get(`/leagues-management/${userId}/league/${leagueId}/applications`),
  acceptApplication: (userId, leagueId, playerId) =>
    apiClient.post(`/leagues-management/${userId}/league/${leagueId}/application/${playerId}/accept`),
  rejectApplication: (userId, leagueId, playerId) =>
    apiClient.post(`/leagues-management/${userId}/league/${leagueId}/application/${playerId}/reject`),
  getOwnedLeagues: (userId) =>
    apiClient.get(`/leagues-management/${userId}/owned-leagues`),
  getMyLeagueApplications: (userId) =>
    apiClient.get(`/leagues-management/${userId}/my-league-applications`),
  getAvailableLeagues: () =>
    apiClient.get('/leagues-management/available-leagues'),
  deleteLeague: (userId, leagueId) =>
    apiClient.delete(`/leagues-management/${userId}/league/${leagueId}`),
}
