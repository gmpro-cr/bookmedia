import React from 'react'
import { MessageCircle, Plus, TrendingUp, Clock } from 'lucide-react'

const Discussions = () => {
  // Mock discussions data
  const discussions = [
    {
      _id: '1',
      title: 'Best Indian Authors of 2024',
      author: { name: 'Priya Sharma', avatar: null },
      replies: 24,
      views: 156,
      lastActivity: new Date(),
      category: 'General Discussion'
    },
    {
      _id: '2',
      title: 'Mythology Books Recommendations',
      author: { name: 'Raj Patel', avatar: null },
      replies: 18,
      views: 89,
      lastActivity: new Date(),
      category: 'Recommendations'
    },
    {
      _id: '3',
      title: 'Book Club Meetup - Delhi',
      author: { name: 'Sneha Singh', avatar: null },
      replies: 12,
      views: 45,
      lastActivity: new Date(),
      category: 'Events'
    }
  ]

  const categories = ['All', 'General Discussion', 'Recommendations', 'Events', 'Reviews', 'Book Clubs']

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Community Discussions</h1>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Start Discussion</span>
        </button>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              category === 'All' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Discussions List */}
      <div className="space-y-4">
        {discussions.map((discussion) => (
          <div key={discussion._id} className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {discussion.author.avatar ? (
                  <img 
                    src={discussion.author.avatar} 
                    alt={discussion.author.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">
                      {discussion.author.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-primary-600">
                  {discussion.title}
                </h3>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                  <span>by {discussion.author.name}</span>
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {discussion.category}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{discussion.replies} replies</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>{discussion.views} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{discussion.lastActivity.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Discussions
