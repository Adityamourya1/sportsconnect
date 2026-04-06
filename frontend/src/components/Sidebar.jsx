import React from 'react'
import { Link } from 'react-router-dom'
import { FaHome, FaCompass, FaTrophy, FaUser, FaBell, FaEnvelope, FaImage, FaCog, FaClipboardList, FaStar } from 'react-icons/fa'

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gradient-to-b from-green-500 to-green-600 h-screen fixed left-0 top-0 shadow-lg">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-white mb-8">SportsNet</h1>

        <nav className="space-y-4">
          <Link
            to="/home"
            className="flex items-center space-x-4 text-white hover:bg-green-700 px-4 py-3 rounded-lg transition"
          >
            <FaHome size={24} />
            <span className="text-lg">Home</span>
          </Link>

          <Link
            to="/explore"
            className="flex items-center space-x-4 text-white hover:bg-green-700 px-4 py-3 rounded-lg transition"
          >
            <FaCompass size={24} />
            <span className="text-lg">Explore</span>
          </Link>

          <Link
            to="/recommendations"
            className="flex items-center space-x-4 text-white hover:bg-green-700 px-4 py-3 rounded-lg transition"
          >
            <FaStar size={24} />
            <span className="text-lg">Recommendations</span>
          </Link>

          <Link
            to="/leagues"
            className="flex items-center space-x-4 text-white hover:bg-green-700 px-4 py-3 rounded-lg transition"
          >
            <FaTrophy size={24} />
            <span className="text-lg">Leagues</span>
          </Link>

          <Link
            to="/leagues-management"
            className="flex items-center space-x-4 text-white hover:bg-green-700 px-4 py-3 rounded-lg transition"
          >
            <FaClipboardList size={24} />
            <span className="text-lg">League Manager</span>
          </Link>

          <Link
            to="/notifications"
            className="flex items-center space-x-4 text-white hover:bg-green-700 px-4 py-3 rounded-lg transition"
          >
            <FaBell size={24} />
            <span className="text-lg">Notifications</span>
          </Link>

          <Link
            to="/messages"
            className="flex items-center space-x-4 text-white hover:bg-green-700 px-4 py-3 rounded-lg transition"
          >
            <FaEnvelope size={24} />
            <span className="text-lg">Messages</span>
          </Link>

          <Link
            to="/stories"
            className="flex items-center space-x-4 text-white hover:bg-green-700 px-4 py-3 rounded-lg transition"
          >
            <FaImage size={24} />
            <span className="text-lg">Stories</span>
          </Link>

          <Link
            to="/profile"
            className="flex items-center space-x-4 text-white hover:bg-green-700 px-4 py-3 rounded-lg transition"
          >
            <FaUser size={24} />
            <span className="text-lg">Profile</span>
          </Link>

          <Link
            to="/settings"
            className="flex items-center space-x-4 text-white hover:bg-green-700 px-4 py-3 rounded-lg transition"
          >
            <FaCog size={24} />
            <span className="text-lg">Settings</span>
          </Link>
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar
