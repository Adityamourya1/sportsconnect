import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { wsService } from './services'
import {
  HomePage,
  ExplorePage,
  LeaguesPage,
  LeaguesManagementPage,
  ProfilePage,
  UserProfilePage,
  LoginPage,
  SignupPage,
  NotificationsPage,
  MessagesPage,
  StoriesPage,
  SettingsPage,
} from './pages'
import { Sidebar, Navbar } from './components'
import './index.css'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access_token')
  return token ? children : <Navigate to="/login" />
}

function App() {
  const isAuthenticated = !!localStorage.getItem('access_token')

  useEffect(() => {
    if (isAuthenticated) {
      // Initialize WebSocket connections
      wsService.connectNotifications()
      wsService.connectMessaging()
      wsService.startHeartbeat()

      // Cleanup on unmount
      return () => {
        wsService.disconnect()
      }
    }
  }, [isAuthenticated])

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      {isAuthenticated && <Sidebar />}
      {isAuthenticated && <Navbar />}
      
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/explore"
          element={
            <ProtectedRoute>
              <ExplorePage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/leagues"
          element={
            <ProtectedRoute>
              <LeaguesPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/leagues-management"
          element={
            <ProtectedRoute>
              <LeaguesManagementPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/user/:userId"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/stories"
          element={
            <ProtectedRoute>
              <StoriesPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        
        <Route path="/" element={<Navigate to="/home" />} />
      </Routes>
    </BrowserRouter>
  )
}


export default App
