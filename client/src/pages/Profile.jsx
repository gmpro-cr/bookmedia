import React from 'react'
import { useAuth } from '../context/AuthContext'
import UserProfile from '../components/UserProfile'
import { Navigate } from 'react-router-dom'

const Profile = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>
      <UserProfile user={user} isOwnProfile={true} />
    </div>
  )
}

export default Profile
