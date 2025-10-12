import React from 'react'
import { Link } from 'react-router-dom'
import { Star, Heart, BookOpen, Clock } from 'lucide-react'

const BookCard = ({ book, showActions = true }) => {
  const handleAddToShelf = (shelf) => {
    // TODO: Implement add to shelf functionality
    console.log(`Adding ${book.title} to ${shelf} shelf`)
  }

  const handleLike = () => {
    // TODO: Implement like functionality
    console.log(`Liked ${book.title}`)
  }

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex space-x-4">
        {/* Book Cover */}
        <div className="flex-shrink-0">
          {book.coverImage ? (
            <img 
              src={book.coverImage} 
              alt={book.title}
              className="h-32 w-24 object-cover rounded-lg shadow-sm"
            />
          ) : (
            <div className="h-32 w-24 bg-gray-200 rounded-lg flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Book Details */}
        <div className="flex-1 min-w-0">
          <Link to={`/books/${book._id}`} className="hover:text-primary-600 transition-colors">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-1">
              {book.title}
            </h3>
          </Link>
          
          <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
          
          {/* Rating */}
          <div className="flex items-center space-x-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${
                    i < Math.floor(book.averageRating || 0) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`} 
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {book.averageRating ? book.averageRating.toFixed(1) : 'No rating'}
            </span>
            <span className="text-sm text-gray-400">
              ({book.reviewCount || 0} reviews)
            </span>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-1 mb-3">
            {book.genres?.slice(0, 3).map((genre) => (
              <span 
                key={genre}
                className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleAddToShelf('toRead')}
                className="btn-secondary text-xs px-3 py-1"
              >
                Want to Read
              </button>
              <button
                onClick={() => handleAddToShelf('read')}
                className="btn-primary text-xs px-3 py-1"
              >
                Mark as Read
              </button>
              <button
                onClick={handleLike}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Heart className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookCard
