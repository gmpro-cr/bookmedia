import React from 'react'
import { useParams } from 'react-router-dom'

const BookDetail = () => {
  const { id } = useParams()

  // Mock book data
  const book = {
    _id: id,
    title: 'The Palace of Illusions',
    author: 'Chitra Banerjee Divakaruni',
    coverImage: null,
    averageRating: 4.2,
    reviewCount: 156,
    genres: ['Fiction', 'Mythology', 'Indian Literature'],
    description: 'The Palace of Illusions reimagines the world-famous Indian epic, the Mahabharata, from the point of view of its best-known female character, Draupadi. Born from fire, Draupadi is fiery, strong-willed, and fearless. She is also lonely, intelligent, and deeply compassionate.',
    publishedYear: 2008,
    pages: 360,
    isbn: '978-0-385-33900-0'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="card">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Book Cover */}
          <div className="flex-shrink-0">
            {book.coverImage ? (
              <img 
                src={book.coverImage} 
                alt={book.title}
                className="h-80 w-56 object-cover rounded-lg shadow-lg"
              />
            ) : (
              <div className="h-80 w-56 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-lg">No Cover</span>
              </div>
            )}
          </div>

          {/* Book Details */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
            <p className="text-xl text-gray-600 mb-4">by {book.author}</p>
            
            {/* Rating */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i} 
                    className={`text-lg ${
                      i < Math.floor(book.averageRating) 
                        ? 'text-yellow-400' 
                        : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-gray-600">
                {book.averageRating} ({book.reviewCount} reviews)
              </span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-4">
              {book.genres.map((genre) => (
                <span 
                  key={genre}
                  className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-full"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Book Info */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <span className="font-medium text-gray-700">Published:</span>
                <span className="ml-2 text-gray-600">{book.publishedYear}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Pages:</span>
                <span className="ml-2 text-gray-600">{book.pages}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">ISBN:</span>
                <span className="ml-2 text-gray-600">{book.isbn}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button className="btn-primary">
                Want to Read
              </button>
              <button className="btn-secondary">
                Mark as Read
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Write Review
              </button>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{book.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookDetail
