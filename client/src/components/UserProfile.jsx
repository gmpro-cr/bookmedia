import React from 'react'
import { Link } from 'react-router-dom'
import { User, MapPin, Calendar, BookOpen, Star, Award } from 'lucide-react'

const UserProfile = ({ user, isOwnProfile = false }) => {
  if (!user) return null

  return (
    <div className="card">
      {/* Profile Header */}
      <div className="flex items-start space-x-4 mb-6">
        <div className="flex-shrink-0">
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-primary-600" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h2>
          
          {user.bio && (
            <p className="text-gray-600 mb-2">{user.bio}</p>
          )}
          
          {user.location && (
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              {user.location}
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">
            {user.stats?.booksRead || 0}
          </div>
          <div className="text-sm text-gray-500">Books Read</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">
            {user.stats?.reviewsWritten || 0}
          </div>
          <div className="text-sm text-gray-500">Reviews</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">
            {user.stats?.followersCount || 0}
          </div>
          <div className="text-sm text-gray-500">Followers</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">
            {user.stats?.followingCount || 0}
          </div>
          <div className="text-sm text-gray-500">Following</div>
        </div>
      </div>

      {/* Favorite Genres */}
      {user.favoriteGenres && user.favoriteGenres.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Favorite Genres</h3>
          <div className="flex flex-wrap gap-2">
            {user.favoriteGenres.map((genre) => (
              <span 
                key={genre}
                className="px-3 py-1 text-sm bg-pastel-green text-green-800 rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Currently Reading */}
      {user.currentlyReading && user.currentlyReading.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Currently Reading</h3>
          <div className="space-y-3">
            {user.currentlyReading.map((reading) => (
              <div key={reading.book._id} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {reading.book.coverImage ? (
                    <img 
                      src={reading.book.coverImage} 
                      alt={reading.book.title}
                      className="h-12 w-8 object-cover rounded"
                    />
                  ) : (
                    <div className="h-12 w-8 bg-gray-200 rounded flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {reading.book.title}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${reading.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{reading.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badges */}
      {user.badges && user.badges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Achievements</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {user.badges.map((badge, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
                <Award className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{badge.name}</div>
                  <div className="text-xs text-gray-500">{badge.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfile
