import React from 'react'
import { useQuery } from 'react-query'
import axios from 'axios'
import BookCard from '../components/BookCard'
import { BookOpen, TrendingUp, Users, Calendar } from 'lucide-react'

const Home = () => {
  // Mock data for now - replace with actual API calls
  const featuredBooks = [
    {
      _id: '1',
      title: 'The Palace of Illusions',
      author: 'Chitra Banerjee Divakaruni',
      coverImage: null,
      averageRating: 4.2,
      reviewCount: 156,
      genres: ['Fiction', 'Mythology', 'Indian Literature']
    },
    {
      _id: '2',
      title: 'The White Tiger',
      author: 'Aravind Adiga',
      coverImage: null,
      averageRating: 3.8,
      reviewCount: 89,
      genres: ['Fiction', 'Contemporary']
    },
    {
      _id: '3',
      title: 'The God of Small Things',
      author: 'Arundhati Roy',
      coverImage: null,
      averageRating: 4.5,
      reviewCount: 234,
      genres: ['Fiction', 'Literary Fiction']
    }
  ]

  const recentReviews = [
    {
      _id: '1',
      user: { name: 'Priya Sharma', avatar: null },
      book: { title: 'The Palace of Illusions', author: 'Chitra Banerjee Divakaruni' },
      rating: 5,
      review: 'An absolutely mesmerizing retelling of the Mahabharata from Draupadi\'s perspective. The writing is lyrical and the character development is exceptional.',
      createdAt: new Date()
    },
    {
      _id: '2',
      user: { name: 'Raj Patel', avatar: null },
      book: { title: 'The White Tiger', author: 'Aravind Adiga' },
      rating: 4,
      review: 'A dark and satirical look at modern India. Adiga\'s writing is sharp and the protagonist\'s voice is unforgettable.',
      createdAt: new Date()
    }
  ]

  const upcomingEvents = [
    {
      _id: '1',
      title: 'Delhi Book Fair 2024',
      date: new Date('2024-02-15'),
      location: 'Delhi',
      type: 'Book Fair'
    },
    {
      _id: '2',
      title: 'Mumbai Literary Festival',
      date: new Date('2024-03-10'),
      location: 'Mumbai',
      type: 'Literary Festival'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Welcome Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to BookCircle India
        </h1>
        <p className="text-lg text-gray-600">
          Discover, discuss, and connect with fellow book lovers across India
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <BookOpen className="h-8 w-8 text-primary-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">1,250+</div>
          <div className="text-sm text-gray-500">Books</div>
        </div>
        <div className="card text-center">
          <Users className="h-8 w-8 text-primary-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">5,000+</div>
          <div className="text-sm text-gray-500">Readers</div>
        </div>
        <div className="card text-center">
          <TrendingUp className="h-8 w-8 text-primary-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">2,500+</div>
          <div className="text-sm text-gray-500">Reviews</div>
        </div>
        <div className="card text-center">
          <Calendar className="h-8 w-8 text-primary-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">50+</div>
          <div className="text-sm text-gray-500">Events</div>
        </div>
      </div>

      {/* Featured Books */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Featured Books</h2>
          <button className="text-primary-600 hover:text-primary-700 font-medium">
            View All
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featuredBooks.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      </section>

      {/* Recent Reviews */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Recent Reviews</h2>
          <button className="text-primary-600 hover:text-primary-700 font-medium">
            View All
          </button>
        </div>
        <div className="space-y-4">
          {recentReviews.map((review) => (
            <div key={review._id} className="card">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {review.user.avatar ? (
                    <img 
                      src={review.user.avatar} 
                      alt={review.user.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {review.user.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900">{review.user.name}</span>
                    <span className="text-gray-500">reviewed</span>
                    <span className="font-medium text-gray-900">{review.book.title}</span>
                    <span className="text-gray-500">by {review.book.author}</span>
                  </div>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`text-sm ${
                          i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-700">{review.review}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {review.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Events */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
          <button className="text-primary-600 hover:text-primary-700 font-medium">
            View All
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {upcomingEvents.map((event) => (
            <div key={event._id} className="card">
              <div className="flex items-center space-x-3">
                <Calendar className="h-8 w-8 text-primary-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                  <p className="text-sm text-gray-600 mb-1">{event.location}</p>
                  <p className="text-sm text-gray-500">{event.date.toLocaleDateString()}</p>
                </div>
                <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full">
                  {event.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
