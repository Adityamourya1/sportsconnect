import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      // API call would go here
      set({
        user: { email },
        token: 'sample_token',
        isLoading: false,
      })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  logout: () => {
    set({ user: null, token: null })
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_id')
  },
}))

export const usePostStore = create((set) => ({
  posts: [],
  currentPost: null,
  isLoading: false,

  setPosts: (posts) => set({ posts }),
  setCurrentPost: (currentPost) => set({ currentPost }),
  setLoading: (isLoading) => set({ isLoading }),
}))

export const useUserStore = create((set) => ({
  profile: null,
  followers: [],
  following: [],
  isLoading: false,

  setProfile: (profile) => set({ profile }),
  setFollowers: (followers) => set({ followers }),
  setFollowing: (following) => set({ following }),
  setLoading: (isLoading) => set({ isLoading }),
}))
